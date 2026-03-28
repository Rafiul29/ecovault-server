/* eslint-disable @typescript-eslint/no-explicit-any */
import Stripe from "stripe";
import { stripe } from "../../config/stripe.config";
import { PaymentStatus } from "../../../generated/prisma/enums";
import { uploadFileToCloudinary } from "../../config/cloudinary.config";
import { prisma } from "../../lib/prisma";
import { sendEmail } from "../../utils/email";
import { generateInvoicePdf } from "./payment.utils";

const handlerStripeWebhookEvent = async (event: Stripe.Event) => {
    // We get the checkout session if completed
    if (event.type === "checkout.session.completed") {
        const session = event.data.object as any;

        const paymentId = session.metadata?.paymentId;
        const ideaId = session.metadata?.ideaId;
        const userId = session.metadata?.userId;

        if (!paymentId || !ideaId || !userId) {
            console.error("⚠️ Missing metadata in webhook event");
            return { message: "Missing metadata" };
        }

        const payment = await prisma.payment.findUnique({
            where: { id: paymentId }
        });

        if (!payment) {
            console.error(`⚠️ Payment ${paymentId} not found.`);
            return { message: "Payment not found" };
        }

        if (payment.status === PaymentStatus.COMPLETED) {
            console.log(`Payment ${paymentId} already processed. Skipping`);
            return { message: `Payment ${paymentId} already processed. Skipping` };
        }

        // Verify idea and user exist
        const user = await prisma.user.findUnique({ where: { id: userId } });
        const idea = await prisma.idea.findUnique({ where: { id: ideaId } });

        if (!user || !idea) {
            console.error(`⚠️ User ${userId} or Idea ${ideaId} not found.`);
            return { message: "User or Idea not found" };
        }

        if (idea.authorId === userId) {
            console.error(`⚠️ User ${userId} is the author of idea ${ideaId}. Cannot purchase own idea.`);
            return { message: "User cannot purchase their own idea" };
        }

        const existingPurchase = await prisma.ideaPurchase.findUnique({
            where: {
                userId_ideaId: {
                    userId,
                    ideaId
                }
            }
        });

        if (existingPurchase) {
            console.error(`⚠️ User ${userId} already purchased idea ${ideaId}`);
            return { message: "Idea already purchased by this user" };
        }

        let pdfBuffer: Buffer | null = null;
        let invoiceUrl: string | null = null;

        // Update payment and create purchase in a transaction
        const result = await prisma.$transaction(async (tx) => {
            const updatedPayment = await tx.payment.update({
                where: {
                    id: paymentId
                },
                data: {
                    status: session.payment_status === "paid" ? PaymentStatus.COMPLETED : PaymentStatus.FAILED,
                    paymentGatewayData: session,
                    transactionId: session.payment_intent as string || event.id // Use payment_intent or event.id as transactionId
                }
            });

            let newPurchase = null;

            if (session.payment_status === "paid") {
                newPurchase = await tx.ideaPurchase.create({
                    data: {
                        userId,
                        ideaId,
                        amount: updatedPayment.amount,
                        paymentId
                    }
                });

                try {
                    pdfBuffer = await generateInvoicePdf({
                        invoiceId: paymentId,
                        userName: user.name,
                        userEmail: user.email,
                        ideaTitle: idea.title,
                        amount: updatedPayment.amount,
                        transactionId: updatedPayment.transactionId || "",
                        paymentDate: new Date().toISOString()
                    });

                    // Optional: Upload invoice to Cloudinary if needed in future
                    const cloudinaryResponse = await uploadFileToCloudinary(
                        pdfBuffer,
                        `ecovault/invoices/invoice-${paymentId}-${Date.now()}.pdf`
                    );
                    invoiceUrl = cloudinaryResponse?.secure_url || null;

                    console.log(`✅ Invoice PDF generated and uploaded for payment ${paymentId}`);
                } catch (pdfError) {
                    console.error("❌ Error generating/uploading invoice PDF:", pdfError);
                }
            }

            return { updatedPayment, newPurchase, invoiceUrl };
        });

        if (session.payment_status === "paid" && pdfBuffer) {
            try {
                await sendEmail({
                    to: user.email,
                    subject: `Payment Confirmation & Invoice - ${idea.title}`,
                    templateName: "invoice",
                    templateData: {
                        userName: user.name,
                        invoiceId: paymentId,
                        transactionId: result.updatedPayment.transactionId || "",
                        paymentDate: new Date().toLocaleDateString(),
                        ideaTitle: idea.title,
                        amount: payment.amount,
                        invoiceUrl: result.invoiceUrl
                    },
                    attachments: [
                        {
                            filename: `Invoice-${paymentId}.pdf`,
                            content: pdfBuffer || Buffer.from(""), 
                            contentType: 'application/pdf'
                        }
                    ]
                });
                console.log(`✅ Invoice email sent to ${user.email}`);
            } catch (emailError) {
                console.error("❌ Error sending invoice email:", emailError);
            }
        }

        console.log(`✅ Payment ${session.payment_status} for idea ${ideaId}`);

    } else if (event.type === "checkout.session.expired") {
        const session = event.data.object as any;
        const paymentId = session.metadata?.paymentId;
        
        if (paymentId) {
            await prisma.payment.update({
                where: { id: paymentId },
                data: { status: PaymentStatus.FAILED }
            });
        }
        console.log(`Checkout session ${session.id} expired. Marking associated payment as failed.`);

    } else if (event.type === "payment_intent.payment_failed") {
        const session = event.data.object as any;
        const paymentId = session.metadata?.paymentId;
        
        if (paymentId) {
            await prisma.payment.update({
                where: { id: paymentId },
                data: { status: PaymentStatus.FAILED }
            });
        }
        console.log(`Payment intent ${session.id} failed. Marking associated payment as failed.`);

    } else {
        console.log(`Unhandled event type ${event.type}`);
    }

    return { message: `Webhook Event ${event.id} processed successfully` };
};

const createCheckoutSession = async (userId: string, ideaId: string) => {
    // Check if the idea exists
    const idea = await prisma.idea.findUnique({
        where: { id: ideaId }
    });

    if (!idea) {
        throw new Error("Idea not found");
    }

    if (idea.authorId === userId) {
        throw new Error("You cannot purchase your own idea");
    }

    // Check if already purchased
    const existingPurchase = await prisma.ideaPurchase.findUnique({
        where: {
            userId_ideaId: {
                userId,
                ideaId
            }
        }
    });

    if (existingPurchase) {
        throw new Error("Idea is already purchased by you");
    }

    // Create a payment record in database with PENDING status
    const payment = await prisma.payment.create({
        data: {
            amount: idea.price || 0, // Assuming idea has a price
            status: PaymentStatus.PENDING,
            userId: userId,
        }
    });

    // Create stripe checkout session
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
            {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: idea.title,
                        description: `Purchase for idea: ${idea.title}`,
                    },
                    unit_amount: Math.round((idea.price || 0) * 100),
                },
                quantity: 1,
            },
        ],
        mode: 'payment',
        success_url: `http://localhost:3000/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `http://localhost:3000/cancel`,
        metadata: {
            paymentId: payment.id,
            ideaId: idea.id,
            userId: userId
        }
    });

    return { url: session.url };
};

const getMyPurchases = async (userId: string) => {
    const purchases = await prisma.ideaPurchase.findMany({
        where: {
            userId: userId
        },
        include: {
            idea: true,
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            }
        },
        orderBy: {
            purchasedAt: "desc"
        }
    });
    return purchases;
};

const getAllPurchases = async () => {
    const purchases = await prisma.ideaPurchase.findMany({
        include: {
            idea: true,
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            }
        },
        orderBy: {
            purchasedAt: "desc"
        }
    });
    return purchases;
};

export const PaymentService = {
    handlerStripeWebhookEvent,
    createCheckoutSession,
    getMyPurchases,
    getAllPurchases
};
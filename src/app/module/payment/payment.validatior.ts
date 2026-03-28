import { z } from 'zod';

const createCheckoutSessionSchema = z.object({
    ideaId: z.string({
        message: 'Idea ID is required',
    }).min(1, 'Idea ID is required'),
    paymentMethod: z.enum(['STRIPE', 'SSLECOMMERCE', 'BKASH', 'NAGAD', 'CARD']).optional().default('STRIPE')
});

export const PaymentValidator = {
    createCheckoutSessionSchema,
};
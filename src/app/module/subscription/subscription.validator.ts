import { z } from 'zod';
import { SubscriptionTier } from '../../../generated/prisma/enums';

const createSubscriptionPlanSchema = z.object({
    name: z.string({ message: 'Name is required' }).min(1, 'Name is required'),
    description: z.string().optional(),
    tier: z.nativeEnum(SubscriptionTier, { message: 'Tier is required' }),
    price: z.number({ message: 'Price is required' }).min(0),
    durationDays: z.number().int().positive().optional(),
    features: z.array(z.string()).optional(),
    order: z.number().int().optional(),
    isPopular: z.boolean().optional(),
    buttonText: z.string().optional(),
});

const updateSubscriptionPlanSchema = z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    tier: z.nativeEnum(SubscriptionTier).optional(),
    price: z.number().min(0).optional(),
    durationDays: z.number().int().positive().optional(),
    features: z.array(z.string()).optional(),
    order: z.number().int().optional(),
    isPopular: z.boolean().optional(),
    buttonText: z.string().optional(),
    isActive: z.boolean().optional(),
});

const subscribeToPlanSchema = z.object({
    subscriptionPlanId: z.string({ message: 'Subscription Plan ID is required' }).min(1, 'Subscription Plan ID is required'),
    paymentMethod: z.enum(['STRIPE', 'SSLECOMMERCE', 'BKASH', 'NAGAD', 'CARD']).optional().default('STRIPE')
});

export const SubscriptionValidator = {
    createSubscriptionPlanSchema,
    updateSubscriptionPlanSchema,
    subscribeToPlanSchema
};

import { z } from 'zod';

const createCheckoutSessionSchema = z.object({
    ideaId: z.string({
        message: 'Idea ID is required',
    }).min(1, 'Idea ID is required'),
});

export const PaymentValidator = {
    createCheckoutSessionSchema,
};
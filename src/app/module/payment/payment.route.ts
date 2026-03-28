import { Router } from 'express';
import express from 'express';
import { PaymentController } from './payment.controller';
import { validateRequest } from '../../middleware/validateRequest';
import { PaymentValidator } from './payment.validatior';
import { checkAuth } from '../../middleware/checkAuth';
import { Role } from '../../../generated/prisma/enums';

const router = Router();

router.post(
  '/create-checkout-session',
  checkAuth(Role.MEMBER, Role.MODERATOR, Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(PaymentValidator.createCheckoutSessionSchema),
  PaymentController.createCheckoutSession
);

router.get(
  '/my-purchases',
  checkAuth(Role.MEMBER, Role.MODERATOR, Role.ADMIN, Role.SUPER_ADMIN),
  PaymentController.getMyPurchases
);

router.get(
  '/all-purchases',
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  PaymentController.getAllPurchases
);

router.post(
  '/webhook/stripe',
  express.raw({ type: 'application/json' }),
  PaymentController.handleStripeWebhookEvent
);

router.post(
  '/webhook/bkash',
  express.raw({ type: 'application/json' }),
  PaymentController.handleBkashWebhookEvent
);

router.post(
  '/webhook/sslcommerce',
  express.raw({ type: 'application/json' }),
  PaymentController.handleSslWebhookEvent
);

router.post(
  '/webhook/nagad',
  express.raw({ type: 'application/json' }),
  PaymentController.handleNagadWebhookEvent
);

router.post(
  '/webhook/card',
  express.raw({ type: 'application/json' }),
  PaymentController.handleCardWebhookEvent
);

export const PaymentRoutes: Router = router;
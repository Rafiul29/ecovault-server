import { Router } from 'express';
import { SubscriptionController } from './subscription.controller';
import { validateRequest } from '../../middleware/validateRequest';
import { SubscriptionValidator } from './subscription.validator';
import { checkAuth } from '../../middleware/checkAuth';
import { Role } from '../../../generated/prisma/enums';

const router = Router();

// Subscription Plan routes (Admin)
router.post(
  '/plans',
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(SubscriptionValidator.createSubscriptionPlanSchema),
  SubscriptionController.createSubscriptionPlan
);

router.get(
  '/plans',
  SubscriptionController.getAllSubscriptionPlans
);

router.get(
  '/plans/:id',
  SubscriptionController.getSubscriptionPlanById
);

router.patch(
  '/plans/:id',
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(SubscriptionValidator.updateSubscriptionPlanSchema),
  SubscriptionController.updateSubscriptionPlan
);

// Subscription routes (User)
router.post(
  '/subscribe',
  checkAuth(Role.MEMBER, Role.MODERATOR, Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(SubscriptionValidator.subscribeToPlanSchema),
  SubscriptionController.subscribeToPlan
);

router.get(
  '/my-subscription',
  checkAuth(Role.MEMBER, Role.MODERATOR, Role.ADMIN, Role.SUPER_ADMIN),
  SubscriptionController.getMySubscription
);

export const SubscriptionRoutes: Router = router;

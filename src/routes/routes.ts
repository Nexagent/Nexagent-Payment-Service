import { Router } from 'express';
import { paymentController } from '../controllers/controller';

const router = Router();

router.post('/',              (req, res, next) => paymentController.initiatePayment(req, res, next));
router.get('/',               (req, res, next) => paymentController.getPayments(req, res, next));
router.get('/:id',            (req, res, next) => paymentController.getPaymentById(req, res, next));
router.get('/:id/status',     (req, res, next) => paymentController.getPaymentStatus(req, res, next));
router.post('/:id/refund',    (req, res, next) => paymentController.refundPayment(req, res, next));
router.post('/:id/retry',     (req, res, next) => paymentController.retryPayment(req, res, next));

export default router;

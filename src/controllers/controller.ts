import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { paymentService } from '../services/service';
import { PaymentStatus } from '../models/Status';
import { GetPaymentsDto } from '../models/dto/GetPayments';

const CreatePaymentSchema = z.object({
  orderId:  z.string().min(1),
  amount:   z.number().positive(),
  currency: z.string().length(3).optional(),
});

const PaymentQuerySchema = z.object({
  status:  z.nativeEnum(PaymentStatus).optional(),
  orderId: z.string().optional(),
});

class PaymentController {
  initiatePayment(req: Request, res: Response, next: NextFunction): void {
    try {
      const body = CreatePaymentSchema.parse(req.body);
      const payment = paymentService.initiatePayment(body);
      res.status(201).json({ success: true, data: payment });
    } catch (err) {
      next(err);
    }
  }

  getPaymentById(req: Request, res: Response, next: NextFunction): void {
    try {
      const payment = paymentService.getPaymentById(req.params.id);
      res.status(200).json({ success: true, data: payment });
    } catch (err) {
      next(err);
    }
  }

  getPayments(req: Request, res: Response, next: NextFunction): void {
    try {
      const filters = PaymentQuerySchema.parse(req.query) as GetPaymentsDto;
      const payments = paymentService.getPayments(filters);
      res.status(200).json({ success: true, data: payments, total: payments.length });
    } catch (err) {
      next(err);
    }
  }

  getPaymentStatus(req: Request, res: Response, next: NextFunction): void {
    try {
      const result = paymentService.getPaymentStatus(req.params.id);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  refundPayment(req: Request, res: Response, next: NextFunction): void {
    try {
      const payment = paymentService.refundPayment(req.params.id);
      res.status(200).json({ success: true, data: payment });
    } catch (err) {
      next(err);
    }
  }

  retryPayment(req: Request, res: Response, next: NextFunction): void {
    try {
      const payment = paymentService.retryPayment(req.params.id);
      res.status(200).json({ success: true, data: payment });
    } catch (err) {
      next(err);
    }
  }
}

export const paymentController = new PaymentController();

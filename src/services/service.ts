import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { Payment } from '../models/Payment';
import { PaymentStatus } from '../models/Status';
import { CreatePaymentDto } from '../models/dto/CreatePayment';
import { GetPaymentsDto } from '../models/dto/GetPayments';
import { paymentRepository } from '../repositories/repository';
import config from '../config/config';

// ─── Domain Errors ────────────────────────────────────────────────────────────

export class PaymentNotFoundError extends Error {
  constructor(id: string) {
    super(`Payment with id '${id}' not found`);
    this.name = 'PaymentNotFoundError';
  }
}

export class InvalidPaymentOperationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidPaymentOperationError';
  }
}

// ─── Async Processing ─────────────────────────────────────────────────────────

async function notifyOrderService(orderId: string, status: 'PAID'): Promise<void> {
  try {
    await axios.patch(`${config.orderServiceUrl}/orders/${orderId}/status`, { status });
    console.log(`[payment-service] Notified order-service: order ${orderId} → ${status}`);
  } catch (err) {
    console.error(`[payment-service] Failed to notify order-service for order ${orderId}:`, err);
  }
}

function simulateProcessing(paymentId: string): void {
  setTimeout(async () => {
    const outcome = Math.random() < 0.8 ? PaymentStatus.SUCCESS : PaymentStatus.FAILED;

    const updated = paymentRepository.update(paymentId, {
      status: outcome,
      ...(outcome === PaymentStatus.FAILED && { failureReason: 'Insufficient funds' }),
    });

    if (!updated) return;

    console.log(`[payment-service] Payment ${paymentId} processed → ${outcome}`);

    if (outcome === PaymentStatus.SUCCESS) {
      await notifyOrderService(updated.orderId, 'PAID');
    }
  }, 1500);
}

// ─── Service ──────────────────────────────────────────────────────────────────

class PaymentService {
  initiatePayment(dto: CreatePaymentDto): Payment {
    const now = new Date().toISOString();
    const payment: Payment = {
      id: uuidv4(),
      orderId: dto.orderId,
      amount: dto.amount,
      currency: dto.currency ?? 'USD',
      status: PaymentStatus.PENDING,
      createdAt: now,
      updatedAt: now,
    };

    paymentRepository.save(payment);
    simulateProcessing(payment.id);
    return payment;
  }

  getPaymentById(id: string): Payment {
    const payment = paymentRepository.findById(id);
    if (!payment) throw new PaymentNotFoundError(id);
    return payment;
  }

  getPayments(filters: GetPaymentsDto): Payment[] {
    return paymentRepository.findAll().filter((payment) => {
      if (filters.status && payment.status !== filters.status) return false;
      if (filters.orderId && payment.orderId !== filters.orderId) return false;
      return true;
    });
  }

  getPaymentStatus(id: string): { id: string; status: PaymentStatus } {
    const payment = paymentRepository.findById(id);
    if (!payment) throw new PaymentNotFoundError(id);
    return { id: payment.id, status: payment.status };
  }

  refundPayment(id: string): Payment {
    const payment = paymentRepository.findById(id);
    if (!payment) throw new PaymentNotFoundError(id);

    if (payment.status !== PaymentStatus.SUCCESS) {
      throw new InvalidPaymentOperationError(
        `Only SUCCESS payments can be refunded. Current status: '${payment.status}'`,
      );
    }

    const updated = paymentRepository.update(id, { status: PaymentStatus.REFUNDED });
    return updated!;
  }

  retryPayment(id: string): Payment {
    const payment = paymentRepository.findById(id);
    if (!payment) throw new PaymentNotFoundError(id);

    if (payment.status !== PaymentStatus.FAILED) {
      throw new InvalidPaymentOperationError(
        `Only FAILED payments can be retried. Current status: '${payment.status}'`,
      );
    }

    const updated = paymentRepository.update(id, {
      status: PaymentStatus.PENDING,
      failureReason: undefined,
    });

    simulateProcessing(id);
    return updated!;
  }
}

export const paymentService = new PaymentService();

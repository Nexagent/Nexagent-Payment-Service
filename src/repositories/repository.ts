import { Payment } from '../models/Payment';

class PaymentRepository {
  private store: Map<string, Payment> = new Map();

  save(payment: Payment): Payment {
    this.store.set(payment.id, payment);
    return payment;
  }

  findById(id: string): Payment | undefined {
    return this.store.get(id);
  }

  findAll(): Payment[] {
    return Array.from(this.store.values());
  }

  update(id: string, changes: Partial<Payment>): Payment | undefined {
    const existing = this.store.get(id);
    if (!existing) return undefined;

    const updated: Payment = {
      ...existing,
      ...changes,
      id,
      updatedAt: new Date().toISOString(),
    };
    this.store.set(id, updated);
    return updated;
  }
}

export const paymentRepository = new PaymentRepository();

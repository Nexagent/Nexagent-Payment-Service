import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { orderService } from '../services/service';
import { OrderStatus } from '../models/Status';
import { GetOrdersDto } from '../models/dto/GetOrders';

const OrderItemSchema = z.object({
  productId: z.string().min(1),
  name: z.string().min(1),
  quantity: z.number().int().positive(),
  unitPrice: z.number().positive(),
});

const CreateOrderSchema = z.object({
  customerId: z.string().min(1),
  items: z.array(OrderItemSchema).min(1),
});

const StatusOrderSchema = z.object({
  status: z.nativeEnum(OrderStatus),
});

const OrderQuerySchema = z.object({
  status: z.nativeEnum(OrderStatus).optional(),
  customerId: z.string().optional(),
});

class OrderController {
  createOrder(req: Request, res: Response, next: NextFunction): void {
    try {
      const body = CreateOrderSchema.parse(req.body);
      const order = orderService.createOrder(body);
      res.status(201).json({ success: true, data: order });
    } catch (err) {
      next(err);
    }
  }

  getOrderById(req: Request, res: Response, next: NextFunction): void {
    try {
      const order = orderService.getOrderById(req.params.id);
      res.status(200).json({ success: true, data: order });
    } catch (err) {
      next(err);
    }
  }

  getOrders(req: Request, res: Response, next: NextFunction): void {
    try {
      const filters = OrderQuerySchema.parse(req.query) as GetOrdersDto;
      const orders = orderService.getOrders(filters);
      res.status(200).json({ success: true, data: orders, total: orders.length });
    } catch (err) {
      next(err);
    }
  }

  getOrderStatus(req: Request, res: Response, next: NextFunction): void {
    try {
      const result = orderService.getOrderStatus(req.params.id);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  cancelOrder(req: Request, res: Response, next: NextFunction): void {
    try {
      const order = orderService.cancelOrder(req.params.id);
      res.status(200).json({ success: true, data: order });
    } catch (err) {
      next(err);
    }
  }

  updateStatus(req: Request, res: Response, next: NextFunction): void {
    try {
      const body = StatusOrderSchema.parse(req.body);
      const order = orderService.updateStatus(req.params.id, body);
      res.status(200).json({ success: true, data: order });
    } catch (err) {
      next(err);
    }
  }
}

export const orderController = new OrderController();

import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Stripe from 'stripe';
import { Order, OrderStatus } from '../orders/entities/order.entity';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private configService: ConfigService,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
  ) {
    const apiKey = this.configService.get('STRIPE_SECRET_KEY');
    if (!apiKey) throw new Error('STRIPE_SECRET_KEY is missing');

    this.stripe = new Stripe(apiKey, {
      apiVersion: '2026-01-28.clover',
    });
  }

  async createPaymentIntent(orderId: number, user: any) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['user'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.user.id !== user.userId) {
      // Simple ownership check
      throw new NotFoundException('Order not found');
    }

    if (order.status === OrderStatus.PAID) {
      throw new BadRequestException('Order already paid');
    }

    const amount = Math.round(order.totalAmount * 100);
    const currency = this.configService.get('STRIPE_CURRENCY') || 'usd';

    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount,
        currency,
        metadata: { orderId: order.id.toString() },
        automatic_payment_methods: { enabled: true },
      });

      order.paymentIntentId = paymentIntent.id;
      order.clientSecret = paymentIntent.client_secret;
      order.status = OrderStatus.AWAITING_PAYMENT;
      await this.orderRepository.save(order);

      return {
        clientSecret: paymentIntent.client_secret,
      };
    } catch (error) {
      this.logger.error(`Stripe Error: ${error.message}`);
      throw new BadRequestException('Payment creation failed');
    }
  }

  async handleWebhook(signature: string, payload: Buffer) {
    const webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET');
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret,
      );
    } catch (err) {
      this.logger.error(
        `Webhook signature verification failed: ${err.message}`,
      );
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const orderId = paymentIntent.metadata.orderId;

      this.logger.log(`Payment succeeded for Order ID: ${orderId}`);

      if (orderId) {
        await this.orderRepository.update(orderId, {
          status: OrderStatus.PAID,
        });
      }
    } else if (event.type === 'payment_intent.payment_failed') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const orderId = paymentIntent.metadata.orderId;
      this.logger.warn(`Payment failed for Order ID: ${orderId}`);
    }

    return { received: true };
  }
}

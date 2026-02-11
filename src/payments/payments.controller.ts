import {
  Controller,
  Post,
  Body,
  Req,
  Headers,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiHeader,
} from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-intent')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Create payment intent',
    description: 'Creates a Stripe payment intent for an order',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        orderId: {
          type: 'number',
          example: 1,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Payment intent created successfully',
    schema: {
      example: {
        clientSecret: 'pi_xxx_secret_xxx',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid order ID' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  createIntent(@Body('orderId') orderId: number, @CurrentUser() user: User) {
    return this.paymentsService.createPaymentIntent(orderId, user);
  }

  @Public() // Bypass global auth guard if any
  @Post('webhook')
  @ApiOperation({
    summary: 'Stripe webhook',
    description: 'Handles Stripe webhook events for payment processing',
  })
  @ApiHeader({
    name: 'stripe-signature',
    description: 'Stripe webhook signature',
    required: true,
  })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  @ApiResponse({
    status: 400,
    description: 'Invalid webhook signature or payload',
  })
  async handleWebhook(
    @Req() req: any,
    @Headers('stripe-signature') signature: string,
  ) {
    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header');
    }
    // Assumes middleware attaches rawBody to req
    const rawBody = req.rawBody;
    if (!rawBody) {
      throw new BadRequestException('Raw body not available');
    }
    return this.paymentsService.handleWebhook(signature, rawBody);
  }
}

import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Inject,
  Param,
  ParseUUIDPipe,
  Post,
  RawBodyRequest,
  Req,
  Request,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { SkipThrottle } from '@nestjs/throttler';
import {
  ApiBearerAuth,
  ApiExcludeEndpoint,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PAYMENTS_SERVICE } from '../../common/tokens';
import { IPaymentsService } from '../services/payments.service.interface';
import { CreateCheckoutSessionDto } from '../dto/create-checkout-session.dto';
import { Public } from '../../auth/guards/public-auth.decorator';

@ApiTags('payments')
@ApiBearerAuth()
@Controller('payments')
export class PaymentsController {
  constructor(
    @Inject(PAYMENTS_SERVICE)
    private readonly paymentsService: IPaymentsService,
  ) {}

  @Post('checkout-session')
  @ApiOperation({ summary: 'Create a payment session for the active cart' })
  @ApiResponse({ status: 201, description: 'Checkout session created' })
  createCheckoutSession(
    @Body() dto: CreateCheckoutSessionDto,
    @Request() req: any,
  ) {
    return this.paymentsService.createCheckoutSession(req.user.sub, dto);
  }

  // The confirmation page polls this endpoint, so it must not be rate-limited.
  @SkipThrottle()
  @Get(':paymentId')
  @ApiOperation({ summary: 'Get the status of a payment' })
  @ApiResponse({ status: 200, description: 'Payment status returned' })
  getStatus(
    @Param('paymentId', ParseUUIDPipe) paymentId: string,
    @Request() req: any,
  ) {
    return this.paymentsService.getStatus(req.user.sub, paymentId);
  }

  @Post(':paymentId/confirm-mock')
  @ApiOperation({
    summary: 'Simulate a successful payment (mock mode only, dev)',
  })
  @ApiResponse({ status: 201, description: 'Mock payment confirmed' })
  confirmMock(
    @Param('paymentId', ParseUUIDPipe) paymentId: string,
    @Request() req: any,
  ) {
    return this.paymentsService.confirmMock(req.user.sub, paymentId);
  }

  @Public()
  @SkipThrottle()
  @Post('webhook')
  @ApiExcludeEndpoint()
  async webhook(
    @Req() req: RawBodyRequest<ExpressRequest>,
    @Headers('stripe-signature') signature: string,
  ) {
    if (!req.rawBody) {
      throw new BadRequestException('Missing raw request body');
    }
    return this.paymentsService.handleWebhook(req.rawBody, signature);
  }
}

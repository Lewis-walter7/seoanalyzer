import { Module } from '@nestjs/common';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionService } from './subscription.service';
import { PaymentService } from './payment.service';
import { IntaSendService } from './intasend.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SubscriptionController],
  providers: [SubscriptionService, PaymentService, IntaSendService],
  exports: [SubscriptionService, PaymentService, IntaSendService]
})
export class SubscriptionModule {}

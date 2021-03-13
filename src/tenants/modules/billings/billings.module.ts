import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BillingsController } from './billings.controller';
import { BillingsService } from './billings.service';
import { Billing } from './models/billing.entity';


@Module({
  imports: [TypeOrmModule.forFeature([Billing])],
  controllers: [BillingsController],
  providers: [BillingsService]
})
export class BillingsModule {}

import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BillingsModule } from './billings.module';
import { BillingsService } from './billings.service';
import { CreateBillingDto } from './dto/create/create-billing.dto';
import { Billing } from './models/billing.entity';

@ApiTags('tenants/billings')
@Controller('tenants/billings')
export class BillingsController {
    constructor(private readonly billingsService: BillingsService) { }

    @Post()
    create(@Body() createBillingDto: CreateBillingDto): Promise<Billing> {
        return this.billingsService.create(createBillingDto);
    }

    @Get()
    findAll(): string {
        return "This is billings"
    }

}

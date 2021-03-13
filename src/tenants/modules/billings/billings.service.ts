import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateBillingDto } from './dto/create/create-billing.dto';
import { Billing } from './models/billing.entity';

@Injectable()
export class BillingsService {

    constructor(
        @InjectRepository(Billing) private billingRepository: Repository<Billing>
    ) { }

    async create(createBillingDto: CreateBillingDto): Promise<Billing> {

        const newBilling = this.billingRepository.create(createBillingDto);
        return this.billingRepository.save(newBilling);

    }
}

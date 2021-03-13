import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tenant } from 'src/tenants/models/tenant.entity';
import { ConnectionResourcesController } from './connection-resources.controller';
import { ConnectionResourcesService } from './connection-resources.service';
import { ConnectionResource } from './models/connection-resource.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ConnectionResource, Tenant])],
  controllers: [ConnectionResourcesController],
  providers: [ConnectionResourcesService]
})
export class ConnectionResourcesModule {}

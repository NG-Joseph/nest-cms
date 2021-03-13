import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomTheme } from './models/custom-theme.entity';
import { Tenant } from './models/tenant.entity';
import { TenantsController } from './tenants.controller';
import { TenantsService } from './tenants.service';
import { ThemesModule } from './modules/themes/themes.module';
import { BillingsModule } from './modules/billings/billings.module';
import { User } from 'src/users/models/user.entity';
import { Theme } from './modules/themes/models/theme.entity';
import { ConnectionResource } from 'src/connection-resources/models/connection-resource.entity';
import { Billing } from './modules/billings/models/billing.entity';
import { TenantTeam } from './models/tenant-team';
import { TenantAccountOfficer } from './models/tenant-account-officer';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tenant, CustomTheme, User, Theme, Billing, ConnectionResource, TenantTeam, TenantAccountOfficer]), //include all the entities that will be involved in tenantsService. Usually, they have relationship
    ThemesModule, 
    BillingsModule
  ],
  controllers: [TenantsController],
  providers: [TenantsService]
})
export class TenantsModule {}

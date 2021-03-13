import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { LocalStrategy } from './strategies/local.strategy';
import { UsersModule } from 'src/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/models/user.entity';
import { Role } from 'src/roles/models/role.entity';
import { Tenant } from 'src/tenants/models/tenant.entity';
import { TenantTeam } from 'src/tenants/models/tenant-team';
import { TenantAccountOfficer } from 'src/tenants/models/tenant-account-officer';
import { UsersService } from 'src/users/users.service';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshTokenStrategy } from './strategies/jwt-refresh.strategy';
import { JwtCookieBasedStrategy } from './strategies/jwt-cookie-based.strategy';
import { FacebookStrategy } from './strategies/facebook.strategy';


@Module({
  imports: [UsersModule, 
    PassportModule, //alternatively, we can specify default strategy if we have more than one, as done below
    //PassportModule.register({ defaultStrategy: 'jwt' }),
    TypeOrmModule.forFeature([User, Role, Tenant, TenantTeam, TenantAccountOfficer]),
    JwtModule.register({}),
    
  ],
  providers: [AuthService, LocalStrategy, UsersService, JwtStrategy, 
    JwtCookieBasedStrategy, JwtRefreshTokenStrategy, FacebookStrategy],
  controllers: [AuthController]
})
export class AuthModule {}

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TenantsModule } from './tenants/tenants.module';
//We need these to read our environment config variables
//import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseModule } from './app.database.module';
//import * as Joi from '@hapi/joi';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { ConnectionResourcesModule } from './connection-resources/connection-resources.module';
import { AuthModule } from './auth/auth.module';

/**
 * The App root module
 */
@Module({
  imports: [ TenantsModule,
    UsersModule,
    RolesModule,
    ConnectionResourcesModule,
    AuthModule,

    //read the environment .env file
    ConfigModule.forRoot(),
    /* //Below Joi use is if I want to validate environment variables entry. Good idea
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        POSTGRES_HOST: Joi.string().required(),
        POSTGRES_PORT: Joi.number().required(),
        POSTGRES_USER: Joi.string().required(),
        POSTGRES_PASSWORD: Joi.string().required(),
        POSTGRES_DB: Joi.string().required(),
        PORT: Joi.number(),
      })
    }),
    */
    DatabaseModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

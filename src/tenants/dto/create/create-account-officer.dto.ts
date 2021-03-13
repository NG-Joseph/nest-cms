import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";
import { TenantAccountOfficerRole } from "src/global/app.settings";
import { CreateUserDto } from "../../../users/dto/create/create-user.dto";
import { CreateTenantDto } from "./create-tenant.dto";

export class CreateTenantAccountOfficerDto{

    @ApiProperty({ required: false})
    readonly tenant: CreateTenantDto;

    @ApiProperty({ required: false})
    readonly user: CreateUserDto;

    @ApiProperty({ enum: TenantAccountOfficerRole, default: [], isArray: true })
    @IsNotEmpty()
    readonly roles: TenantAccountOfficerRole[];

}

export class CreateTenantAccountOfficerRolesDto{
    @ApiProperty({ enum: TenantAccountOfficerRole, default: [], isArray: true })
    @IsNotEmpty()
    readonly roles: TenantAccountOfficerRole[];
}
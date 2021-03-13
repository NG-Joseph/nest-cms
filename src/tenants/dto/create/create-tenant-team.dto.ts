import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";
import { TenantTeamRole } from "src/global/app.settings";
import { CreateUserDto } from "../../../users/dto/create/create-user.dto";
import { CreateTenantDto } from "./create-tenant.dto";

export class CreateTenantTeamDto{

    @ApiProperty({ required: false})
    readonly tenant: CreateTenantDto;

    @ApiProperty({ required: false})
    readonly user: CreateUserDto;

    @ApiProperty({ enum: TenantTeamRole, default: [], isArray: true })
    @IsNotEmpty()
    readonly roles: TenantTeamRole[];

    @ApiProperty()
    readonly tenantUniqueName: string; //denomalizing for display efficiency on client

    @ApiProperty()
    readonly tenantUniqueId: number; //denomalizing for display efficiency on client
}

//only for roles
export class CreateTenantTeamRolesDto{

    @ApiProperty({ enum: TenantTeamRole, default: [], isArray: true })
    @IsNotEmpty()
    readonly roles: TenantTeamRole[];
}
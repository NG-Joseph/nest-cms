import { ApiProperty } from "@nestjs/swagger";
import { TenantTeamRole } from "src/global/app.settings";
import { CreateUserDto } from "../../../users/dto/create/create-user.dto";
import { CreateTenantDto } from "../create/create-tenant.dto";


export class UpdateTenantTeamDto{

    @ApiProperty({ required: false})
    readonly id: number;

    @ApiProperty({ required: false})
    readonly tenant: CreateTenantDto;

    @ApiProperty({ required: false})
    readonly user: CreateUserDto;

    @ApiProperty({ enum: TenantTeamRole, default: [], isArray: true })
    readonly roles: TenantTeamRole[];

    @ApiProperty()
    readonly tenantUniqueName: string; //denomalizing for display efficiency on client

    @ApiProperty()
    readonly tenantUniqueId: number; //denomalizing for display efficiency on client
}

export class UpdateTenantTeamRolesDto{
    @ApiProperty({ enum: TenantTeamRole, default: [], isArray: true })
    readonly roles: TenantTeamRole[];
}
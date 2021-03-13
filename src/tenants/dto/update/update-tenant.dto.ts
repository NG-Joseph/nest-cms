import { IsNotEmpty } from "class-validator";
import { TenantStatus } from "src/global/custom.interfaces";
import { UpdateCustomThemeDto } from "./update-custom-theme.dto"
import { UpdateUserDto } from "../../../users/dto/update/update-user.dto";
import { ApiProperty } from "@nestjs/swagger";
import { UpdateTenantTeamDto } from "./update-tenant-team.dto";
import { UpdateTenantAccountOfficerDto } from "./update-account-officer.dto";

//Only id is marked as NotEmpty, to accommodate partial update
export class UpdateTenantDto{
    /*
    @ApiProperty()
    @IsNotEmpty()
    readonly id: number
    */
    
    @ApiProperty({ required: false})
    readonly uniqueName: string;
    
    @ApiProperty({ required: false})
    readonly address: string;

    @ApiProperty({ required: false})
    readonly moreInfo: string;

    @ApiProperty({ required: false})
    readonly logo: string;

    @ApiProperty({ required: false})
    readonly logoMimeType: string;
    
    @ApiProperty({ required: false})
    readonly dateOfRegistration: Date;

    @ApiProperty({ required: false})
    readonly status: TenantStatus;

    @ApiProperty({ required: false})
    readonly primaryContact: UpdateUserDto;

    @ApiProperty({ required: false})
    readonly teamMembers: UpdateTenantTeamDto[];

    @ApiProperty({ required: false})
    readonly tenantAccountOfficers: UpdateTenantAccountOfficerDto[];

    @ApiProperty({ required: false})
    readonly customTheme: UpdateCustomThemeDto;
}
import { IsNotEmpty } from "class-validator";
import { TenantStatus } from "src/global/custom.interfaces";
import { CreateCustomThemeDto } from "./create-custom-theme.dto"
import { CreateUserDto } from "../../../users/dto/create/create-user.dto";
import { ApiProperty } from "@nestjs/swagger";

export class CreateTenantDto{

    @ApiProperty()
    @IsNotEmpty()
    readonly uniqueName: string;

    @ApiProperty()
    @IsNotEmpty()
    readonly address: string;

    @ApiProperty({ required: false})
    readonly moreInfo: string;

    @ApiProperty({ required: false})
    readonly logo: string;

    @ApiProperty({ required: false})
    readonly logoMimeType: string;

    @ApiProperty()
    @IsNotEmpty()
    readonly dateOfRegistration: Date;

    @ApiProperty({ enum: TenantStatus, required: false })
    readonly status: TenantStatus;

    @ApiProperty({ required: false})
    readonly primaryContact: CreateUserDto;

    @ApiProperty({ required: false})
    readonly customTheme: CreateCustomThemeDto;

}

export class CreateTenantDtos{
    dtos: CreateTenantDto[];
}
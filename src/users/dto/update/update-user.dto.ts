import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty } from "class-validator";
import { Gender } from "src/global/custom.interfaces";

class PhoneDto {

    @ApiProperty({ required: false })
    mobile: string[];

    @ApiProperty({ required: false })
    office: string[];

    @ApiProperty({ required: false })
    home: string[];
}

//Only id is marked as NotEmpty, to accommodate partial update. Email must be sent in right format however
export class UpdateUserDto {

    @ApiProperty()
    readonly id?: number

    @ApiProperty({ required: false })
    readonly landlord?: boolean;

    @ApiProperty({ required: false })
    readonly firstName?: string;

    @ApiProperty({ required: false })
    readonly middleName?: string;

    @ApiProperty({ required: false })
    readonly lastName?: string;

    @ApiProperty({ required: false })
    readonly commonName?: string;

    @ApiProperty({ required: false })
    readonly homeAddress?: string;

    @ApiProperty({ required: false })
    readonly gender?: Gender;

    @ApiProperty({ required: false })
    readonly dateOfBirth?: Date;

    @ApiProperty({ required: false })
    readonly nationality?: string;

    @ApiProperty({ required: false })
    readonly stateOfOrigin?: string;

    @ApiProperty({ required: false })
    readonly zip?: string;

    @ApiProperty({ required: false })
    readonly photo?: string;

    @ApiProperty({ required: false })
    readonly photoMimeType?: string;

    @ApiProperty({ required: false })
    readonly isActive?: boolean;

    @ApiProperty({ required: false })
    @IsEmail()
    readonly primaryEmailAddress?: string;

    @ApiProperty({ required: false })
    @IsEmail()
    readonly backupEmailAddress?: string;

    @ApiProperty({ required: false })
    readonly phone?: PhoneDto;

    @ApiProperty({ required: false })
    readonly isPrimaryEmailAddressVerified?: boolean;

    readonly passwordSalt?: string;

    @ApiProperty({ required: false })
    passwordHash?: string; //not readonly because it will be replaced by hash in the insertusers function

    @ApiProperty({ required: false })
    readonly isPasswordChangeRequired?: boolean;

    readonly refreshTokenHash?: string


}
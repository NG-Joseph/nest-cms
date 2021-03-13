import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class CreateRoleDto {

    @ApiProperty()
    @IsNotEmpty()
    readonly name: string;

    @ApiProperty({ required: false})
    readonly description: string;

    @ApiProperty({ required: false})
    readonly landlord: boolean;

}

export class CreateRoleDtos {
    dtos: CreateRoleDto[];
}
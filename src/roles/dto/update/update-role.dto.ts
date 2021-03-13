import { ApiProperty } from "@nestjs/swagger";

//Only id is marked as NotEmpty, to accommodate partial update
export class UpdateRoleDto {

    /*
    @ApiProperty()
    @IsNotEmpty()
    readonly id: number
    */

    @ApiProperty({ required: false})
    readonly name: string;

    @ApiProperty({ required: false})
    readonly description: string;

    @ApiProperty({ required: false})
    readonly landlord: boolean;

}

export class UpdateRoleDtos {
    dtos: UpdateRoleDto[];
}
import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty } from "class-validator"

export class CreateCustomThemeDto {

    @ApiProperty()
    @IsNotEmpty()
    readonly name: string

    @ApiProperty({ required: false})
    readonly description: string
    
    @ApiProperty({ required: false})
    readonly properties: string
}
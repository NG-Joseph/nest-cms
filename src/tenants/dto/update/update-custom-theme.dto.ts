import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class UpdateCustomThemeDto{
    
    @ApiProperty()
    @IsNotEmpty()
    readonly id: number;

    @ApiProperty({ required: false})
    readonly name: string

    @ApiProperty({ required: false})
    readonly description: string
  
    @ApiProperty({ required: false})
    readonly properties: string
}
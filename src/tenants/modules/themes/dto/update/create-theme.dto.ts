import { ApiProperty } from "@nestjs/swagger"

export class UpdateThemeDto{

    @ApiProperty()
    readonly id: number;

    @ApiProperty()
    readonly name: string

    @ApiProperty()
    readonly description: string

    @ApiProperty()
    readonly properties: string
}
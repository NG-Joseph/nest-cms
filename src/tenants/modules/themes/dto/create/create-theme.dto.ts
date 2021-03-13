import { ApiProperty } from "@nestjs/swagger"

export class CreateThemeDto{

    @ApiProperty()
    readonly name: string

    @ApiProperty()
    readonly description: string

    @ApiProperty()
    readonly properties: string
}
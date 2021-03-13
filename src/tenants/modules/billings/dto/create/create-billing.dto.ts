import { ApiProperty } from "@nestjs/swagger"

export class CreateBillingDto{
    @ApiProperty()
    readonly code: string

    @ApiProperty()
    readonly description: string

    @ApiProperty()
    readonly type: string
}
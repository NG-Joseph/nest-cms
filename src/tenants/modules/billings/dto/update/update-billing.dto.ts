import { ApiProperty } from "@nestjs/swagger"

export class UpdateBillingDto{

    /*
    @ApiProperty()
    readonly id: number
    */

    @ApiProperty({required: false})
    readonly code: string

    @ApiProperty({required: false})
    readonly description: string

    @ApiProperty({required: false})
    readonly type: string
}
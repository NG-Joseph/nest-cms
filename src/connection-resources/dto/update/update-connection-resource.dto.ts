import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

//for connectionProperties field which is a simple-json
class ConnectionPropertiesDto{
    readonly type: string;
    readonly host: string;
    readonly port: string;
    readonly username: string;
    readonly password: string;
    readonly database: string;
    readonly schema: string;
}

//Only id is marked as NotEmpty, to accommodate partial update
export class UpdateConnectionResourceDto {

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
    readonly active: boolean;

    @ApiProperty({ required: false})@ApiProperty()
    readonly platform: string;

    @ApiProperty({ required: false})
    readonly rootFileSystem: string;

    @ApiProperty({ required: false})
    readonly connectionProperties: ConnectionPropertiesDto

}
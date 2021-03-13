import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

//for connectionProperties field which is a simple-json
class ConnectionPropertiesDto{
  @ApiProperty({ required: false, default: 'postgres' })
  readonly type: string = 'postgres';

  @ApiProperty()
  readonly host: string;

  @ApiProperty({ required: false})
  readonly port: string;

  @ApiProperty()
  readonly username: string;

  @ApiProperty()
  readonly password: string;

  @ApiProperty()
  readonly database: string;

  @ApiProperty({ required: false, default: 'public' })
  readonly schema?: string;
}

export class CreateConnectionResourceDto {

    @ApiProperty() 
    @IsNotEmpty()
    readonly name: string;

    @ApiProperty({ required: false})
    readonly description: string;

    @ApiProperty({ required: false})
    readonly active: boolean;

    @ApiProperty() 
    @IsNotEmpty()
    readonly platform: string;

    @ApiProperty({ required: false})
    readonly rootFileSystem: string;

    @ApiProperty({ required: false})
    readonly connectionProperties: ConnectionPropertiesDto;

}

export class CreateConnectionResourceDtos{
  dtos: CreateConnectionResourceDto[];
}
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put, Query, Req, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request, Reply } from 'src/global/custom.interfaces';
import { InsertResult, UpdateResult } from 'typeorm';
import { ConnectionResourcesService } from './connection-resources.service';
import { CreateConnectionResourceDto, CreateConnectionResourceDtos } from './dto/create/create-connection-resource.dto';
import { UpdateConnectionResourceDto } from './dto/update/update-connection-resource.dto';
import { ConnectionResource } from './models/connection-resource.entity';

@ApiTags('connection-resources')
@Controller('connection-resources')
export class ConnectionResourcesController {
    constructor(private readonly connectionResourcesService: ConnectionResourcesService) { }

    @Post()
    create(@Body() createConnectionResourceDto: CreateConnectionResourceDto, @Req() req: Request): Promise<ConnectionResource>{
        return this.connectionResourcesService.create(createConnectionResourceDto, req);
    }

    @Post('insert')
    insert(@Body() createConnectionResourceDtos: CreateConnectionResourceDtos, @Req() req: Request): Promise<InsertResult> {
        return this.connectionResourcesService.insertConnectionResources(createConnectionResourceDtos.dtos, req);
    }

    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() updateConnectionResourceDto: UpdateConnectionResourceDto): Promise<UpdateResult> {
        return this.connectionResourcesService.update(id, updateConnectionResourceDto);
    }

    /**
     * 
     * @param ConnectionResource 
     * Non-partial update. Takes a full tenant without param.
     */
    /*
    @Put()
    save(@Body() connectionResource: ConnectionResource): Promise<ConnectionResource> {
        return this.connectionResourcesService.save(connectionResource);
    }
    */

    @Delete(':id')
    delete(@Param('id', ParseIntPipe) id: number) {
        return this.connectionResourcesService.delete(id);
    }

    /**READ section */
    /**
     * Handle Get request for find
     */
    @Get()
    findAll(@Query() query: string): Promise<[ConnectionResource[], number]> {
        for (const queryKey of Object.keys(query)) {
            if (queryKey == "findOptions") {
                return this.connectionResourcesService.findAllWithOptions(decodeURI(query[queryKey]));
            }
        }
        return this.connectionResourcesService.findAll();
    }

    /**
     * 
     * @param id 
     * Handle Get request for find by id
     */
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number): Promise<ConnectionResource> {
        return this.connectionResourcesService.findOne(id);
    }

    //Below is designed to return html and not objects as we have seen so far
    @Get('web')
    async web(@Res() reply: Reply) {
        //TODO
    }

    //7. Tenant
    @Patch(':connectionResourceId/tenant/:tenantId')
    setTenantById(@Param('connectionResourceId', ParseIntPipe) connectionResourceId: number, @Param('tenantId', ParseIntPipe) tenantId: number): Promise<void> {
        return this.connectionResourcesService.setTenantById(connectionResourceId, tenantId);
    }

    @Delete(':connectionResourceId/tenant')
    unsetTenantById(@Param('connectionResourceId', ParseIntPipe) connectionResourceId: number): Promise<void> {
        return this.connectionResourcesService.unsetTenantById(connectionResourceId);
    }

}

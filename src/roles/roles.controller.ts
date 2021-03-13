import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put, Query, Req, Res } from '@nestjs/common';
import { ApiBadRequestResponse, ApiCreatedResponse, ApiInternalServerErrorResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request, Reply } from 'src/global/custom.interfaces';
import { InsertResult, UpdateResult } from 'typeorm';
import { CreateRoleDto, CreateRoleDtos } from './dto/create/create-role.dto';
import { UpdateRoleDto } from './dto/update/update-role.dto';
import { Role } from './models/role.entity';
import { RolesService } from './roles.service';

@ApiTags('roles')
@Controller('roles')
export class RolesController {

    constructor(private readonly rolesService: RolesService) { }

    /**
     * Post a single new role
     * @param createRoleDto 
     * @param req 
     */
    @ApiOperation({ description: "Create a new role" })
    @ApiCreatedResponse({description: 'Role has been successfully created.'})
    @ApiBadRequestResponse({description: "Bad request: likely constraint problem"})
    @ApiInternalServerErrorResponse({description: 'Internal server error'})
    @Post()
    create(@Body() createRoleDto: CreateRoleDto, @Req() req: Request): Promise<Role>{
        return this.rolesService.create(createRoleDto, req);
    }


    /**
     * Insert multiple new roles
     * @param createRoleDtos 
     * @param req 
     */
    @ApiOperation({ description: "Create one or more new roles in one go" })
    @ApiCreatedResponse({description: 'Roles have been successfully created.'})
    @ApiBadRequestResponse({description: "Bad request: likely a constraint problem"})
    @ApiInternalServerErrorResponse({description: 'Internal server error'})
    @Post('insert')
    insert(@Body() createRoleDtos: CreateRoleDtos, @Req() req: Request): Promise<InsertResult> {
        return this.rolesService.insertRoles(createRoleDtos.dtos, req);
    }

    /**
     * Do partial update of role
     * @param id 
     * @param updateRoleDto 
     */
    @ApiOperation({ description: "Update a role. Only the fields sent from client will be updated" })
    @ApiOkResponse({description: 'Role has been successfully updated.'})
    @ApiBadRequestResponse({description: "Bad request: likely a constraint problem"})
    @ApiInternalServerErrorResponse({description: 'Internal server error'})
    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() updateRoleDto: UpdateRoleDto): Promise<UpdateResult> {
        return this.rolesService.update(id, updateRoleDto);
    }

    /**
     * 
     * @param role 
     * Non-partial update. Takes a full tenant without param.
     */
    @ApiOperation({ description: "Update a role. Fully replaces all fields" })
    @ApiOkResponse({description: 'Role has been successfully updated.'})
    @ApiBadRequestResponse({description: "Bad request: constraint problem"})
    @ApiInternalServerErrorResponse({description: 'Internal server error'})
    @Put()
    save(@Body() role: Role): Promise<Role> {
        return this.rolesService.save(role);
    }

    @ApiOperation({ description: "Delete a role." })
    @ApiOkResponse({description: 'Role has been successfully deleted.'})
    @ApiBadRequestResponse({description: "Bad request: likely role does not exist"})
    @ApiInternalServerErrorResponse({description: 'Internal server error'})
    @Delete(':id')
    delete(@Param('id', ParseIntPipe) id: number) {
        return this.rolesService.delete(id);
    }

    /**READ section */
    /**
     * Handle Get request for find
     */
    @ApiOperation({ description: "Get all roles that meet the criteria specified in query options, if any." })
    @ApiOkResponse({description: 'Roles returned.'})
    @ApiBadRequestResponse({description: "Bad request: likely incorrect options sent"})
    @ApiInternalServerErrorResponse({description: 'Internal server error'})
    @Get()
    findAll(@Query() query: string): Promise<[Role[], number]> {
        for (const queryKey of Object.keys(query)) {
            if (queryKey == "findOptions") {
                return this.rolesService.findAllWithOptions(decodeURI(query[queryKey]));
            }
        }
        return this.rolesService.findAll();
    }

    /**
     * 
     * @param id 
     * Handle Get request for find by id
     */
    @ApiOperation({ description: "Get a role with the id sent as param" })
    @ApiOkResponse({description: 'Role returned.'})
    @ApiInternalServerErrorResponse({description: 'Internal server error'})
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number): Promise<Role> {
        return this.rolesService.findOne(id);
    }

    //Below is designed to return html and not objects as we have seen so far
    //This is not really needed as I am combining users and roles under users/web on the client side.
    /*
    @Get('web')
    async web(@Res() reply: Reply) {
        
    }
    */

    /*Work on relationships*/
    //1. Users
    @ApiOperation({ description: "Assign role with roleId to user with userId." })
    @ApiOkResponse({description: 'Role assigned to user successfully.'})
    @ApiBadRequestResponse({description: "Bad request: likely, user or role does not exist"})
    @ApiInternalServerErrorResponse({description: 'Internal server error'})
    @Patch(':roleId/users/:userId')
    addUserById(@Param('roleId', ParseIntPipe) roleId: number, @Param('userId', ParseIntPipe) userId: number): Promise<Role>{
        return this.rolesService.addUserById(roleId, userId);
    }

    /**
     * 
     * @param query This should contain an array of userIds in query named as userid e.g. ?userid=1&userid=2&userid=3...
     * @param roleId 
     */
    @ApiOperation({ description: "Assign multiple users to role with roleId. The query should contain an array of userIds in query key named userid e.g. ?userid=1&userid=2&userid=3..." })
    @ApiOkResponse({description: 'Role assigned to users successfully.'})
    @ApiBadRequestResponse({description: "Bad request: likely, user(s) or role does not exist"})
    @ApiInternalServerErrorResponse({description: 'Internal server error'})
    @Patch(':roleId/users')
    addUsersById(@Query() query: string, @Param('roleId', ParseIntPipe) roleId: number){
        this.rolesService.addUsersById(roleId, query['userid']);
    }

    @ApiOperation({ description: "Remove role with roleId from user with userId" })
    @ApiOkResponse({description: 'Role removed from user successfully.'})
    @ApiBadRequestResponse({description: "Bad request: likely, user or role does not exist"})
    @ApiInternalServerErrorResponse({description: 'Internal server error'})
    @Delete(':roleId/users/:userId')
    removeUserById(@Param('roleId', ParseIntPipe) roleId: number, @Param('userId', ParseIntPipe) userId: number){
        this.rolesService.removeUserById(roleId, userId);
    }

    /**
     * 
     * @param query This should contain an array of roleId in query named as roleid e.g. ?roleid=1&roleid=2&roleid=3...
     * @param roleId 
     */
    @ApiOperation({ description: "Remove multiple users from role with roleId. The query should contain an array of userIds in query key named userid e.g. ?userid=1&userid=2&userid=3..." })
    @ApiOkResponse({description: 'Role removed from users successfully.'})
    @ApiBadRequestResponse({description: "Bad request: likely, users or role does not exist"})
    @ApiInternalServerErrorResponse({description: 'Internal server error'})
    @Delete(':roleId/users')
    removeUsersById(@Query() query: string, @Param('roleId', ParseIntPipe) roleId: number){
        this.rolesService.removeUserById(roleId, query['userid']);
    }

}

import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put, Query, Req, Res } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBody, ApiConsumes, ApiCreatedResponse, ApiInternalServerErrorResponse, ApiOkResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request, Reply } from 'src/global/custom.interfaces';
import {GenericBulmaNotificationResponseDto } from 'src/global/generic.dto';
import { CreateRoleDto } from 'src/roles/dto/create/create-role.dto';
import { CreateTenantAccountOfficerDto } from 'src/tenants/dto/create/create-account-officer.dto';
import { CreateTenantTeamDto, CreateTenantTeamRolesDto } from 'src/tenants/dto/create/create-tenant-team.dto';
import { CreateTenantDto } from 'src/tenants/dto/create/create-tenant.dto';
import { UpdateTenantAccountOfficerRolesDto } from 'src/tenants/dto/update/update-account-officer.dto';
import { UpdateTenantTeamRolesDto } from 'src/tenants/dto/update/update-tenant-team.dto';
import { DeleteResult, InsertResult, UpdateResult } from 'typeorm';
import { CreateUserDto, CreateUserDtos } from './dto/create/create-user.dto';
import { UpdateUserDto } from './dto/update/update-user.dto';
import { FileUploadDto } from '../global/file-upload.dto';
import { User } from './models/user.entity';
import { UsersService } from './users.service';
import renderEngine from 'src/global/render.engine';
import { API_VERSION, TenantTeamRole } from 'src/global/app.settings';
import { renderToNodeStream } from 'react-dom/server';
import App from '../clients_dev/user-react-web-client/src/App';
import React from 'react';
import { StaticRouter } from 'react-router-dom';
import { Role } from 'src/roles/models/role.entity';
import { Tenant } from 'src/tenants/models/tenant.entity';
import { TenantTeam } from 'src/tenants/models/tenant-team';

@ApiTags('users')
@Controller('users')
export class UsersController {

    /**
     * 
     * @param usersService 
     */
    constructor(private readonly usersService: UsersService) { }

    /**
     * Post a single user
     * @param createUserDto 
     * @param req 
     */
    @ApiOperation({ description: "Create a new user" })
    @ApiCreatedResponse({description: 'User has been successfully created.'})
    @ApiBadRequestResponse({description: "Bad request: constraint problem"})
    @ApiInternalServerErrorResponse({description: 'Internal server error'})
    @Post()
    //TODO: still to find out why CreateUserDto as type is failing below. I am using User meanwhile
    create(@Body() createUserDto: User, @Req() req: Request): Promise<User>{
        return this.usersService.create(createUserDto, req);
    }

    /**
     * Post multiple users
     * @param createUserDtos 
     * @param req 
     */
    @ApiOperation({ description: "Create one or more new users in one go" })
    @ApiCreatedResponse({description: 'Users have been successfully created.'})
    @ApiBadRequestResponse({description: "Bad request: constraint problem"})
    @ApiInternalServerErrorResponse({description: 'Internal server error'})
    @Post('insert')
    insert(@Body() createUserDtos: CreateUserDtos, @Req() req: Request): Promise<InsertResult> {
        return this.usersService.insertUsers(createUserDtos.dtos, req);
    }

    /**
     * Do partial update of a user.
     * @param id The user id
     * @param updateUserDto This dto does not contain user id. Deconstruct in usersService
     */
    @ApiOperation({ description: "Update a user. Only the fields sent from client will be updated" })
    @ApiOkResponse({description: 'User has been successfully updated.'})
    @ApiBadRequestResponse({description: "Bad request: constraint problem"})
    @ApiInternalServerErrorResponse({description: 'Internal server error'})
    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto): Promise<UpdateResult> {
        return this.usersService.update(id, updateUserDto);
    }

    /**
     * 
     * @param user 
     * Non-partial update. Takes a full tenant without param.
     */
    @ApiOperation({ description: "Update a user. Fully replaces all fields" })
    @ApiOkResponse({description: 'User has been successfully updated.'})
    @ApiBadRequestResponse({description: "Bad request: constraint problem"})
    @ApiInternalServerErrorResponse({description: 'Internal server error'})
    @Put()
    save(@Body() user: User): Promise<User> {
        return this.usersService.save(user);
    }

    /**
     * Delete a user with the given id
     * @param id 
     */
    @ApiOperation({ description: "Delete a user." })
    @ApiOkResponse({description: 'User has been successfully deleted.'})
    @ApiBadRequestResponse({description: "Bad request: likely user does not exist"})
    @ApiInternalServerErrorResponse({description: 'Internal server error'})
    @Delete(':id')
    delete(@Param('id', ParseIntPipe) id: number) {
        return this.usersService.delete(id);
    }

    /**READ section */
    /**
     * Get all users. Returns an array of users found and the total number of users
     * @param query May contain findOptions
     */
    @ApiOperation({ description: "Get all users that meet the criteria specified in query options, if any." })
    @ApiOkResponse({description: 'Users returned.'})
    @ApiBadRequestResponse({description: "Bad request: likely incorrect options sent"})
    @ApiInternalServerErrorResponse({description: 'Internal server error'})
    @Get()
    findAll(@Query() query: string): Promise<[User[], number]> {
        for (const queryKey of Object.keys(query)) {
            if (queryKey == "findOptions") {
                return this.usersService.findAllWithOptions(decodeURI(query[queryKey]));
            }
        }
        return this.usersService.findAll();
    }

    /**
     * Find user by id
     * @param id 
     * 
     */
    @ApiOperation({ description: "Get a user with the id sent as param" })
    @ApiOkResponse({description: 'User returned.'})
    @ApiInternalServerErrorResponse({description: 'Internal server error'})
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number): Promise<User> {
        return this.usersService.findOne(id);
    }

    /**
     * Returns html
     * @param reply 
     */
    @ApiOperation({ description: "This url is for web client involving both server-side and client-side rendering" })
    @ApiOkResponse({description: 'Rendered web page is returned.'})
    @ApiInternalServerErrorResponse({description: 'Internal server error'})
    @Get('web*')
    async web(@Res() reply: Reply, @Req() req: Request) {
        //We want to render the raw way so that we can call renderToStream
        const res = reply.raw;

        const beforeStream = renderEngine().render('users/before-react-stream.fragment.html',
            { title: 'User Management', UserAdminctive: true, apiVersion: API_VERSION!==null? `${API_VERSION}`: '' , currentUrlSlug: API_VERSION!==null?`/${API_VERSION}/users/web`: '/users/web'})

        const afterStream = renderEngine().render('users/after-react-stream.fragment.html')

        //Write the first rendered fragment (upper html part)
        res.write(beforeStream);

        //write the React app using renderToNodeStream
        const context = {};
        const stream = renderToNodeStream(
            <StaticRouter location={req.url} context={context}>
                <App  baseUrl={`${API_VERSION!==null? `/${API_VERSION}`: '' }/users/web`} />
            </StaticRouter>
        )

        stream.addListener('end', () => {
            res.write(afterStream); //Write the last rendered fragment (lower html part)
            res.end();
        });

        //enable stream piping
        stream.pipe(res, { end: false });
    }

    /*Work on relationships*/
    //1. Roles
    /**
     * Post a new role and associate it with the user with userId. This may not be very useful
     * @param createRoleDto 
     * @param userId 
     */

    @ApiOperation({ description: "Post a new role and associate it with the user with userId." })
    @ApiOkResponse({description: 'New role created and associated with the user.'})
    @ApiBadRequestResponse({description: "Bad request: likely, user does not exist or role already exists"})
    @ApiInternalServerErrorResponse({description: 'Internal server error'})
    @Post(':userId/roles')
    createAndAddRole(@Body() createRoleDto: CreateRoleDto, @Param('userId', ParseIntPipe) userId: number){
        this.usersService.createAndAddRole(userId, createRoleDto);
    }
    
    /**
     * Add role to a user by id
     * @param userId 
     * @param roleId 
     */
    @ApiOperation({ description: "Assign role with roleId to user with userId." })
    @ApiOkResponse({description: 'Role assigned to user successfully.'})
    @ApiBadRequestResponse({description: "Bad request: likely, user or role does not exist"})
    @ApiInternalServerErrorResponse({description: 'Internal server error'})
    @Patch(':userId/roles/:roleId')
    addRoleById(@Param('userId', ParseIntPipe) userId: number, @Param('roleId', ParseIntPipe) roleId: number){
        this.usersService.addRoleById(userId, roleId);
    }

    /**
     * 
     * @param query This should contain an array of roleIds in query key named roleid e.g. ?roleid=1&roleid=2&roleid=3...
     * @param userId 
     */
    @ApiOperation({ description: "Assign multiple roles to user with userId. The query should contain an array of roleIds in query key named roleid e.g. ?roleid=1&roleid=2&roleid=3..." })
    @ApiOkResponse({description: 'Roles assigned to user successfully.'})
    @ApiBadRequestResponse({description: "Bad request: likely, user or role(s) does not exist"})
    @ApiInternalServerErrorResponse({description: 'Internal server error'})
    @Patch(':userId/roles')
    addRolesById(@Query() query: string, @Param('userId', ParseIntPipe) userId: number): Promise<Role[]>{
        return this.usersService.addRolesById(userId, query['roleid']);
    }

    /**
     * Remove role from a user
     * @param userId 
     * @param roleId 
     */
    @ApiOperation({ description: "Remove role with roleId from user with userId" })
    @ApiOkResponse({description: 'Role removed from user successfully.'})
    @ApiBadRequestResponse({description: "Bad request: likely, user or role does not exist"})
    @ApiInternalServerErrorResponse({description: 'Internal server error'})
    @Delete(':userId/roles/:roleId')
    removeRoleById(@Param('userId', ParseIntPipe) userId: number, @Param('roleId', ParseIntPipe) roleId: number): Promise<Role[]>{
        return this.usersService.removeRoleById(userId, roleId);
    }

    /**
     * Remove multiple roles from a user
     * @param query This should contain an array of roleId in query named as roleid e.g. ?roleid=1&roleid=2&roleid=3...
     * @param userId 
     */
    @ApiOperation({ description: "Remove multiple roles from user with userId. The query should contain an array of roleIds in query key named roleid e.g. ?roleid=1&roleid=2&roleid=3..." })
    @ApiOkResponse({description: 'Roles removed from user successfully.'})
    @ApiBadRequestResponse({description: "Bad request: likely, user or role(s) does not exist"})
    @ApiInternalServerErrorResponse({description: 'Internal server error'})
    @Delete(':userId/roles')
    removeRolesById(@Query() query: string, @Param('userId', ParseIntPipe) userId: number): Promise<Role[]>{
        return this.usersService.removeRoleById(userId, query['roleid']);
    }

    /*Work on other relationships*/
    /**
     * Create a new tenant and set user with userId as the primary contact
     * @param createTenantDto 
     * @param userId 
     */
    @Post(':userId/primary-contact-for')
    createAndSetTenantForPrimaryContact(@Body() createTenantDto: CreateTenantDto, @Param('userId', ParseIntPipe) userId: number): Promise<void> {
        return this.usersService.createAndSetTenantForPrimaryContact(userId, createTenantDto);
    }

    /**
     * Make a user with userid a primary contact for tenant with tenantId
     * @param userId 
     * @param tenantId 
     */
    @Patch(':userId/primary-contact-for/:tenantId')
    setAsPrimaryContactForATenantByTenantId(@Param('userId', ParseIntPipe) userId: number, @Param('tenantId', ParseIntPipe) tenantId: number): Promise<Tenant[]>{
        return this.usersService.setAsPrimaryContactForATenantByTenantId(userId, tenantId);
    }

    @Patch(':userId/primary-contact-for-by-unique-name/:uniqueName')
    setAsPrimaryContactForATenantByTenantUniqueName(@Param('userId', ParseIntPipe) userId: number, @Param('uniqueName') uniqueName: string): Promise<Tenant[]>{
        return this.usersService.setAsPrimaryContactForATenantByTenantUniqueName(userId, uniqueName);
    }

    /**
     * Remove user with userId as primary contact of tenant with tenantId
     * @param userId 
     * @param tenantId 
     */
    @Delete(':userId/primary-contact-for/:tenantId')
    removeAsPrimaryContactForATenantById(@Param('userId', ParseIntPipe) userId: number, @Param('tenantId', ParseIntPipe) tenantId: number): Promise<Tenant[]> {
        return this.usersService.removeAsPrimaryContactForATenantsById(userId, tenantId);
    }

    //3. tenantTeamMembership
    /**
     * Create a new tenant and add user with userId as team member of the tenant
     * @param userId 
     * @param createTenantTeamDto 
     */
    @Post(':userId/team-membership')
    createTenantAndSetTeamMembership(@Param('userId', ParseIntPipe) userId: number, @Body() createTenantTeamDto: CreateTenantTeamDto): Promise<void> {
        return this.usersService.createTenantAndSetTeamMembership(userId, createTenantTeamDto);
    }

    /**
     * Update the roles of a user as a tenant team member
     * @param userId 
     * @param tenantId 
     * @param createTenantTeamRolesDto 
     */
    @Patch(':userId/team-membership/:tenantId')
    setTeamMembershipById(@Param('userId', ParseIntPipe) userId: number, @Param('tenantId', ParseIntPipe) tenantId: number, @Body() createTenantTeamRolesDto: CreateTenantTeamRolesDto): Promise<void> {
        return this.usersService.setTeamMembershipById(userId, tenantId,createTenantTeamRolesDto);
    }

    @Patch(':userId/team-membership-by-uniqueName/:uniqueName')
    setTeamMembershipByTenantUniqueName(@Param('userId', ParseIntPipe) userId: number, @Param('uniqueName') uniqueName: string, @Body() roles: TenantTeamRole[]): Promise<TenantTeam[]> {
        return this.usersService.setTeamMembershipByTenantUniqueName(userId, uniqueName, roles);

    }

    /**
     * Disassociate a user from tenant as team member
     * @param userId 
     * @param tenantId 
     */
    @Delete(':userId/team-membership/:tenantId')
    deleteTeamMemberShipById(@Param('userId', ParseIntPipe) userId: number, @Param('tenantId', ParseIntPipe) tenantId: number): Promise<TenantTeam[]> {
        return this.usersService.deleteTeamMemberShipById(userId, tenantId);
    }

    /**
     * Update the roles of a user as tenant team member
     * @param userId 
     * @param tenantId 
     * @param updateTenantTeamRolesDto 
     */
    @Patch(':userId/team-membership-roles/:tenantId')
    updateTeamMemberShipById(@Param('userId', ParseIntPipe) userId: number, @Param('tenantId', ParseIntPipe) tenantId: number, @Body() updateTenantTeamRolesDto: UpdateTenantTeamRolesDto): Promise<UpdateResult> {
        return this.usersService.updateTeamMemberShipRolesById(userId, tenantId, updateTenantTeamRolesDto)
    }

    //4. TenantAccountOfficers. Also a case of many-to-many split into two one-to-manys
    /**
     * Create a new tenant and add user with userId as account officer
     * @param userId 
     * @param createTenantAccountOfficerDto 
     */
    @Post(':userId/account-officer-for')
    createAndSetAccountOfficerForWhichTenant(@Param('userId', ParseIntPipe) userId: number, @Body() createTenantAccountOfficerDto: CreateTenantAccountOfficerDto): Promise<void> {
        return this.usersService.createAndSetAccountOfficerForWhichTenant(userId, createTenantAccountOfficerDto);
    }

    /**
     * Associate a user with userId with tenant with tenantId as account officer
     * @param userId 
     * @param tenantId 
     * @param createTenantAccountOfficerDto 
     */
    @Patch(':userId/account-officer-for/:tenantId')
    setTenantAccountOfficerForWhichTenantById(@Param('userId', ParseIntPipe) userId: number, @Param('tenantId', ParseIntPipe) tenantId: number, createTenantAccountOfficerDto: CreateTenantAccountOfficerDto): Promise<void> {
        return this.usersService.setTenantAccountOfficerForWhichTenantById(userId, tenantId, createTenantAccountOfficerDto);
    }

    /**
     * Dissociate user with userId from tenant with tenantId, as account officer
     * @param userId 
     * @param tenantId 
     */
    @Delete(':userId/account-officer-for/:tenantId')
    deleteTenantAccountOfficerForWhichTenantById(@Param('userId', ParseIntPipe) userId: number, @Param('tenantId', ParseIntPipe) tenantId: number): Promise<DeleteResult> {
        return this.usersService.deleteTenantAccountOfficerForWhichTenantById(userId, tenantId);
    }

    /**
     * Update the roles of a user with userId as account officer for tenant with tenantId
     * @param userId 
     * @param tenantId 
     * @param updateTenantAccountOfficerRolesDto 
     */
    @Patch(':userId/account-officer-roles-for/:tenantId')
    updateTenantAccountOfficerForWhichTenantById(userId: number, tenantId: number, @Body() updateTenantAccountOfficerRolesDto: UpdateTenantAccountOfficerRolesDto): Promise<UpdateResult> {
        return this.updateTenantAccountOfficerForWhichTenantById(userId, tenantId, updateTenantAccountOfficerRolesDto);
    }


    /*Some user perculiarities*/
    /**
     * Set the password of a user with userId
     * @param userId 
     * @param password 
     */
    @Patch(':userId/set-password')
    setUserPassword(@Param('userId', ParseIntPipe) userId: number, @Body() password: string): Promise<UpdateResult> {
        return this.usersService.setUserPassword(userId, password);
    }

    /**
     * Upload photo of a user with userId
     * @param userId 
     * @param req 
     * @param reply 
     */
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        description: 'User photo',
        type: FileUploadDto,
      })
    @Post(':userId/photo')
    setUserPhoto(@Param('userId', ParseIntPipe) userId: number, @Req() req: Request, @Res() reply: Reply): Promise<void>{
        return this.usersService.setUserPhoto(userId, req, reply);
    }

    /**
     * Get the photo of a user. This link is used on client side for image URL
     * @param userId 
     * @param reply 
     */
    @Get(':userId/photo')
    async getUserPhoto(@Param('userId', ParseIntPipe) userId: number, @Res() reply: Reply){
        return this.usersService.getUserPhoto(userId, reply);
    }

    /**
     * Receive reset password request. Calls service to generate and send request token
     * @param email 
     * @param req 
     */
    @Post('reset-password-request')
    resetPasswordRequest(@Body() email: string, @Req() req: Request): Promise<GenericBulmaNotificationResponseDto>{
        return this.usersService.resetPasswordRequest(email, req);
    }  

    /**
     * Reset password. Calls service to validate the token received and reset password. The Get here
     * receives request from browser, no password sent, thus a form will be sent
     * @param token 
     * @param password 
     * @param reply 
     */
    @Get('reset-password/:token')
    resetPassword1(@Param('token') token: string, @Res() reply: Reply){
        return this.usersService.resetPassword(token, null, reply);
    }

    /**
     * This receives request from form. Password is sent in body
     * @param token 
     * @param password 
     * @param reply 
     */
    @Post('reset-password/:token')
    resetPassword2(@Param('token') token: string, @Res() reply: Reply, @Body() body: {password: string}){
        return this.usersService.resetPassword(token, body.password, reply);
    }

    /**
     * Receives request to confirm primary email address of user with userId. Calls service to send a token.
     * @param userId 
     * @param req 
     */
    @Get(':userId/confirm-primary-email-request')
    confirmPrimaryEmailRequest(@Param('userId', ParseIntPipe) userId: number, @Req() req: Request){
        //may be safer to get userId from cookie
        return this.usersService.confirmEmailRequest(null, userId, true, req);

    }  

    /**
     * Receives request to confirm backup email address of user with userId. Calls service to send a token.
     * @param userId 
     * @param req 
     */
    @Get(':userId/confirm-backup-email-request')
    confirmBackupEmailRequest(@Param('userId', ParseIntPipe) userId: number, @Req() req: Request){
        //may be safer to get userId from cookie
        return this.usersService.confirmEmailRequest(null, userId, false, req);

    } 

    /**
     * Called to confirm primary email address. Passes token to service to validate and then confirm email
     * @param token 
     * @param reply 
     */
    @Get('confirm-primary-email/:token')
    confirmPrimaryEmail(@Param('token') token: string, @Res() reply: Reply){
        return this.usersService.confirmEmail(token, true, reply);

    }

    /**
     * Called to confirm primary email address. Passes token to service to validate and then confirm email
     * @param token 
     * @param reply 
     */
    @Get('confirm-backup-email/:token')
    confirmBackupEmail(@Param('token') token: string, @Res() reply: Reply){
        return this.usersService.confirmEmail(token, false, reply);
    }
    

}

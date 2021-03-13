import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put, Query, Req, Res } from '@nestjs/common';
import { renderToNodeStream } from 'react-dom/server';
import App from '../clients_dev/tenants-react-web-client/src/App';
import * as React from 'react';
import { Request, Reply } from 'src/global/custom.interfaces';
import renderEngine from 'src/global/render.engine';
import { UpdateResult } from 'typeorm/query-builder/result/UpdateResult';
import { CreateTenantDto, CreateTenantDtos } from './dto/create/create-tenant.dto';
import { UpdateTenantDto } from './dto/update/update-tenant.dto';
import { Tenant } from './models/tenant.entity';
import { TenantsService } from './tenants.service';
import { CreateUserDto } from 'src/users/dto/create/create-user.dto';
import { DeleteResult, InsertResult } from 'typeorm';
import { CreateThemeDto } from './modules/themes/dto/create/create-theme.dto';
import { CreateBillingDto } from './modules/billings/dto/create/create-billing.dto';
import { CreateCustomThemeDto } from './dto/create/create-custom-theme.dto';
import { IState } from '../clients_dev/tenants-react-web-client/src/app.interfaces';
import { CreateTenantTeamDto, CreateTenantTeamRolesDto } from './dto/create/create-tenant-team.dto';
import { CreateTenantAccountOfficerDto } from './dto/create/create-account-officer.dto';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FileUploadDto } from 'src/global/file-upload.dto';
import { API_VERSION } from 'src/global/app.settings';

@ApiTags('tenants')
@Controller('tenants')
export class TenantsController {

    /**
     * 
     * @param tenantsService 
     * Inject tenantsService
     */
    constructor(private readonly tenantsService: TenantsService) { }

    /**
     * 
     * @param createTenantDto 
     * Handle Post request for create
     */
    @Post()
    create(@Body() createTenantDto: CreateTenantDto, @Query() query: string,@Req() req: Request): Promise<Tenant> {
        //read the query to check if createPrimaryContact is enabled
        const createPrimaryContact: number = query["createPrimaryContact"];
        //const createPrimaryContactInt: number = createPrimaryContact==true? 1 : 0
        //console.log(createPrimaryContact)
        return this.tenantsService.create(createTenantDto, createPrimaryContact, req);
    }

    @Post('insert')
    insert(@Body() createTenantDtos: CreateTenantDtos): Promise<InsertResult> {
        return this.tenantsService.insertTenants(createTenantDtos.dtos);
    }

    /**
     * 
     * @param id id of tenant to be updated
     * @param updateTenantDto new content
     * Handle Put request for 
     */
    /* FindOneParams not working well. Using ParseIntPipe
    @Put(':id')
    partialUpdate(@Param('id', ParseIntPipe) id: FindOneParams, @Body() updateTenantDto: UpdateTenantDto): Promise<UpdateResult> {
        return this.tenantsService.update1(id, updateTenantDto);
    }
    */
    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() updateTenantDto: UpdateTenantDto): Promise<UpdateResult> {
        //console.log(JSON.stringify(updateTenantDto))
        return this.tenantsService.update(id, updateTenantDto);
    }

    /**
     * 
     * @param tenant 
     * Non-partial update. Takes a full tenant without param. Use this if data sent includes relations.
     */
    @Put()
    save(@Body() tenant: Tenant): Promise<Tenant> {
        return this.tenantsService.save(tenant);
    }
    

    @Delete(':id')
    delete(@Param('id', ParseIntPipe) id: number) {
        return this.tenantsService.delete(id);
    }

    /**READ section */
    /**
     * Handle Get request for find
     */
    @Get()
    findAll(@Query() query: string): Promise<[Tenant[], number]> {
        
        for (const queryKey of Object.keys(query)) {
            if (queryKey == "findOptions") {
                return this.tenantsService.findAllWithOptions(decodeURI(query[queryKey]));
            }
        }
        //console.log('inside findAll');
        return this.tenantsService.findAll();
    }

    /**
     * 
     * @param id 
     * Handle Get request for find by id
     */
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number): Promise<Tenant> {
        return this.tenantsService.findOne(id);
    }


    //Below is designed to return html and not objects as we have seen so far
    @Get('web')
    async web(@Res() reply: Reply) {

        //We want to render the raw way so that we can call renderToStream
        const res = reply.raw;

        /*We want to be able to send some initialization data to the react component
        Just using below string as an illustration placeholder for now. The real value will be 
        when we implement Authentication and Authorization.
        The token will contain whatever data you want to pass but in base64 digest format.
        For example, UserInfo, Roles, ThemeContext values, etc.
        */
        //const initialProps = { jwtToken: "put-the-token-string-here-if-any" };

        //Instead of the above, we will pass initial values for our state variable.
        //We may for example want to send tenants e.g.
        const [tenants, count] = await this.tenantsService.findAllWithOptions('{"take": 10, "relations":["primaryContact","teamMembers", "tenantAccountOfficers", "customTheme", "connectionResource"]}');
        //because of the await, we had to make this function async
        const initialProps:IState = {
            tenants:  tenants,
            tenantsCount: count,
            tenant:  null,
            onAddTenant:  false,
            onViewTenant:  false,
            onEditTenant:  false,
            alert: { show: false, message: '', type: '' }
          };

        const beforeStream = renderEngine().render('tenants/before-react-stream.fragment.html',
            { title: 'Tenants Admin', TenantsActive: true, apiVersion: API_VERSION!==null? `${API_VERSION}`: '', currentUrlSlug: API_VERSION!==null?`/${API_VERSION}/tenants/web`: '/tenants/web' })

        const afterStream = renderEngine().render('tenants/after-react-stream.fragment.html',
            { initialProps: encodeURI(JSON.stringify(initialProps)) })

        //Write the first rendered fragment (upper html part)
        res.write(beforeStream);

        //write the React app using renderToNodeStream
        const stream = renderToNodeStream(<App {...initialProps} />)

        stream.addListener('end', () => {
            res.write(afterStream); //Write the last rendered fragment (lower html part)
            res.end();
        });

        //enable stream piping
        stream.pipe(res, { end: false });

    }

    /*Work on relationships*/

    //1. Primary Contact
    @Patch(':tenantId/primary-contact/:userId')
    setPrimaryContactById(@Param('tenantId', ParseIntPipe) tenantId: number, @Param('userId', ParseIntPipe) userId: number): Promise<void> {
        return this.tenantsService.setPrimaryContactById(tenantId, userId);
    }

    @Post(':tenantId/primary-contact')
    createAndSetPrimaryContact(@Body() createUserDto: CreateUserDto, @Param('tenantId', ParseIntPipe) tenantId: number): Promise<void> {
        return this.tenantsService.createAndSetPrimaryContact(tenantId, createUserDto);
    }

    @Delete(':tenantId/primary-contact')
    unsetPrimaryContactById(@Param('tenantId', ParseIntPipe) tenantId: number): Promise<void> {
        return this.tenantsService.unsetPrimaryContactById(tenantId);
    }

    //2. Custom Theme
    @Patch(':tenantId/custom-theme/:customThemeId')
    setCustomThemeById(@Param('tenantId', ParseIntPipe) tenantId: number, @Param('customThemeId', ParseIntPipe) customThemeId: number): Promise<void> {
        return this.tenantsService.setCustomThemeById(tenantId, customThemeId);
    }

    @Post(':tenantId/custom-theme')
    async createAndSetCustomTheme(@Body() createCustomThemeDto: CreateCustomThemeDto, @Param('tenantId', ParseIntPipe) tenantId: number): Promise<void> {
        return this.tenantsService.createAndSetCustomTheme(tenantId, createCustomThemeDto);
    }

    @Delete(':tenantId/custom-theme')
    unsetCustomThemeById(@Param('tenantId', ParseIntPipe) tenantId: number): Promise<void> {
        return this.tenantsService.unsetCustomThemeById(tenantId);
    }

    //3. Team members

    @Patch(':tenantId/team-member/:userId')
    setTeamMemberById(@Body() createTenantTeamRolesDto: CreateTenantTeamRolesDto, @Param('tenantId', ParseIntPipe) tenantId: number, @Param('userId', ParseIntPipe) userId: number): Promise<void> {
        return this.tenantsService.setTeamMemberById(tenantId, userId, createTenantTeamRolesDto);
    }

    @Post(':tenantId/team-member')
    createAndSetTeamMember(@Body() createTenantTeamDto: CreateTenantTeamDto, @Param('tenantId', ParseIntPipe) tenantId: number): Promise<void> {
        return this.tenantsService.createAndSetTeamMember(tenantId, createTenantTeamDto);
    }

    @Delete(':tenantId/team-member/:userId')
    deleteTeamMemberById(@Param('tenantId', ParseIntPipe) tenantId: number, @Param('userId', ParseIntPipe) userId: number): Promise<DeleteResult> {
        return this.tenantsService.deleteTeamMemberById(tenantId, userId);
    }

    //4. TenantAccountOfficers
    @Patch(':tenantId/account-officer/:userId')
    setTenantAccountOfficerById(@Body() createTenantAccountOfficerDto: CreateTenantAccountOfficerDto, @Param('tenantId', ParseIntPipe) tenantId: number, @Param('userId', ParseIntPipe) userId: number): Promise<void> {
        return this.tenantsService.setTenantAccountOfficerById(tenantId, userId, createTenantAccountOfficerDto);
    }

    @Patch(':tenantId/account-officer')
    createAndSetAccountOfficer(@Body() createTenantAccountOfficerDto: CreateTenantAccountOfficerDto, @Param('tenantId', ParseIntPipe) tenantId: number): Promise<void> {
        return this.tenantsService.createAndSetTenantAccountOfficer(tenantId, createTenantAccountOfficerDto);
    }

    @Delete(':tenantId/account-officer/:userId')
    deleteTenantAccountOfficerById(@Param('tenantId', ParseIntPipe) tenantId: number, @Param('userId', ParseIntPipe) userId: number): Promise<DeleteResult> {
        return this.tenantsService.deleteTenantAccountOfficerById(tenantId, userId);
    }

    //5. Theme
    @Patch(':tenantId/theme/:themeId')
    addThemeById(@Param('tenantId', ParseIntPipe) tenantId: number, @Param('themeId', ParseIntPipe) themeId: number): Promise<void> {
        return this.tenantsService.addThemeById(tenantId, themeId);
    }

    @Post(':tenantId/theme')
    async createAndAddTheme(@Body() createThemeDto: CreateThemeDto, @Param('tenantId', ParseIntPipe) tenantId: number): Promise<void> {
        return this.tenantsService.createAndAddTheme(tenantId, createThemeDto);
    }

    @Delete(':tenantId/theme/:themeId')
    removeThemeById(@Param('tenantId', ParseIntPipe) tenantId: number, @Param('themeId', ParseIntPipe) themeId: number): Promise<void> {
        return this.tenantsService.removeThemeById(tenantId, themeId);
    }

    //6. Billings
    @Patch(':tenantId/billing/:billingId')
    addBillingById(@Param('tenantId', ParseIntPipe) tenantId: number, @Param('billingId', ParseIntPipe) billingId: number): Promise<void> {
        return this.tenantsService.addBillingById(tenantId, billingId);
    }

    @Post(':tenantId/billing')
    async createAndBilling(@Body() createBillingDto: CreateBillingDto, @Param('tenantId', ParseIntPipe) tenantId: number): Promise<void> {
        return this.tenantsService.createAndAddBilling(tenantId, createBillingDto);
    }

    @Delete(':tenantId/billing/:billingId')
    removeBillingById(@Param('tenantId', ParseIntPipe) tenantId: number, @Param('billingId', ParseIntPipe) billingId: number): Promise<void> {
        return this.tenantsService.removeBillingById(tenantId, billingId);
    }

    //7. Connection Resource
    @Patch(':tenantId/connection-resource/:connectionResourceId')
    setConnectionResourceById(@Param('tenantId', ParseIntPipe) tenantId: number, @Param('connectionResourceId', ParseIntPipe) connectionResourceId: number): Promise<void> {
        return this.tenantsService.setConnectionResourceById(tenantId, connectionResourceId);
    }

    @Delete(':tenantId/connection-resource')
    unsetConnectionResourceById(@Param('tenantId', ParseIntPipe) tenantId: number): Promise<void> {
        return this.tenantsService.unsetConnectionResourceById(tenantId);
    }

    //finders
    /**
     * Get active tenants of an account officer
     * @param userId
     */
    @Get('account-officer/:userId/tenants')
    getActiveTenantsByAccountOfficer(@Param('userId', ParseIntPipe) userId: number, @Query() query: string){
        const active: boolean = query['active'] as boolean || false; 
        return this.tenantsService.getActiveTenantsByAccountOfficer(userId, active);
    }

    @ApiConsumes('multipart/form-data')
    @ApiBody({
        description: 'Tenant logo',
        type: FileUploadDto,
      })
    @Post(':tenantId/logo')
    uploadTenantLogo(@Param('tenantId', ParseIntPipe) tenantId: number, @Req() req: Request, @Res() reply: Reply): Promise<void>{
        return this.tenantsService.setTenantLogo(tenantId, req, reply);
    }

    @Get(':tenantId/logo')
    async getTenantLogo(@Param('tenantId', ParseIntPipe) tenantId: number, @Res() reply: Reply){
        return this.tenantsService.getTenantLogo(tenantId, reply);
    }

}

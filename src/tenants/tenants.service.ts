import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import { PG_UNIQUE_CONSTRAINT_VIOLATION } from 'src/global/error.codes';
import { CreateUserDto } from 'src/users/dto/create/create-user.dto';
import { User } from 'src/users/models/user.entity';
import { Connection, DeleteResult, InsertResult, Repository, UpdateResult } from 'typeorm';
import { CreateTenantAccountOfficerDto } from './dto/create/create-account-officer.dto';
import { CreateCustomThemeDto } from './dto/create/create-custom-theme.dto';
import { CreateTenantTeamDto, CreateTenantTeamRolesDto } from './dto/create/create-tenant-team.dto';
import { CreateTenantDto } from './dto/create/create-tenant.dto';
import { UpdateTenantAccountOfficerDto } from './dto/update/update-account-officer.dto';
import { UpdateTenantTeamDto } from './dto/update/update-tenant-team.dto';
import { UpdateTenantDto } from './dto/update/update-tenant.dto';
import { CustomTheme } from './models/custom-theme.entity';
import { TenantAccountOfficer } from './models/tenant-account-officer';
import { TenantTeam } from './models/tenant-team';
import { Tenant } from './models/tenant.entity';
import { CreateBillingDto } from './modules/billings/dto/create/create-billing.dto';
import { Billing } from './modules/billings/models/billing.entity';
import { CreateThemeDto } from './modules/themes/dto/create/create-theme.dto';
import { Theme } from './modules/themes/models/theme.entity';
import * as bcrypt from 'bcrypt';
import { Request, Reply } from 'src/global/custom.interfaces';
//five imports below are for file upload handling
import util from 'util'; //for uploaded file streaming to file
import { pipeline } from 'stream';//also for uploaded file streaming to file
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { randomBytes } from 'crypto';
import { API_VERSION, confirmEmailMailOptionSettings, EMAIL_VERIFICATION_EXPIRATION, LOGO_FILE_SIZE_LIMIT, PHOTO_FILE_SIZE_LIMIT, PROTOCOL, smtpTransport, smtpTransportGmail, USE_API_VERSION_IN_URL } from 'src/global/app.settings';
import { SendMailOptions } from 'nodemailer';


@Injectable()
export class TenantsService {

    /**
     * 
     * @param tenantRepository 
     */
    constructor(
        @InjectRepository(Tenant) private tenantRepository: Repository<Tenant>,
        @InjectRepository(User) private userRepository: Repository<User>,
        @InjectRepository(TenantTeam) private tenantTeamRepository: Repository<TenantTeam>,
        @InjectRepository(TenantAccountOfficer) private tenantAccountOfficerRepository: Repository<TenantAccountOfficer>,
        @InjectRepository(CustomTheme) private customThemeRepository: Repository<CustomTheme>,
        @InjectRepository(Theme) private themeRepository: Repository<Theme>,
        @InjectRepository(Billing) private billingRepository: Repository<Billing>,
        @InjectConnection('default')//You can inject connection by name. See https://docs.nestjs.com/techniques/database#multiple-databases
        private connection: Connection
    ) { }

    /*CREATE section*/

    /**
     * 
     * @param createTenantDto 
     */
    async create(createTenantDto: CreateTenantDto, createPrimaryContact: number, req: Request): Promise<Tenant> {
        try {
            const newTenant = this.tenantRepository.create(createTenantDto);
            if (createPrimaryContact != 1) {//the dto contains all that it takes to create both tenant and primary contact
                //find the user by primaryEmailAddress and set as Primary Contact
                console.log(createPrimaryContact)
                const primaryContact: User = await this.userRepository.findOne({where:{primaryEmailAddress: newTenant.primaryContact.primaryEmailAddress}})

                if (primaryContact){
                    newTenant.primaryContact = primaryContact
                }else{
                    throw new HttpException({
                        status: HttpStatus.BAD_REQUEST,
                        error: `There was a problem with tenant creation: Primary contact selected does not exist`,
                    }, HttpStatus.BAD_REQUEST)
                }
            }else{ //the dto primaryContact part contains the email of the user to set as primary contact
                
                if (newTenant.primaryContact != null) {
                    await bcrypt.hash(newTenant.primaryContact.passwordHash, 10).then((hash: string) => {
                        newTenant.primaryContact.passwordHash = hash
                    })
                    newTenant.primaryContact.isPasswordChangeRequired = true;
                }
            }

            const tenant = await this.tenantRepository.save(newTenant);

            //if primary contact was created, check the email and send verification message
            //check if user primary email and then provoke verification process
            if(createPrimaryContact == 1){
                if (tenant.primaryContact != null && tenant.primaryContact.primaryEmailAddress != null) {
                    let user: User = null;
                    user = await this.userRepository.findOne({ where: { primaryEmailAddress: tenant.primaryContact.primaryEmailAddress } });
                    this.sendVerificationEmail(user, req);
                }
            }
    
            return tenant;

        } catch (error) {
            console.log(error);
            if (error && error.code === PG_UNIQUE_CONSTRAINT_VIOLATION) {
                throw new HttpException({
                    status: HttpStatus.BAD_REQUEST,
                    error: `There was a problem with tenant creation: : ${error.message}`,
                }, HttpStatus.BAD_REQUEST)
            } else {

                throw new HttpException({
                    status: HttpStatus.INTERNAL_SERVER_ERROR,
                    error: `There was a problem with tenant creation: ${error.message}`,
                }, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }

    //insert using query builder - more efficient than save. Can be used for single or bulk save. See https://github.com/typeorm/typeorm/blob/master/docs/insert-query-builder.md
    async insertTenants(tenants: CreateTenantDto[]): Promise<InsertResult> {//tenants is an array of objects
        try {
            return await this.tenantRepository.createQueryBuilder()
                .insert()
                .into(Tenant)
                .values(tenants)
                .execute();
        } catch (error) {
            if (error && error.code === PG_UNIQUE_CONSTRAINT_VIOLATION) {
                throw new HttpException({
                    status: HttpStatus.BAD_REQUEST,
                    error: `There was a problem with tenant(s) insertion: : ${error.message}`,
                }, HttpStatus.BAD_REQUEST)
            } else {
                throw new HttpException({
                    status: HttpStatus.INTERNAL_SERVER_ERROR,
                    error: `There was a problem with tenant(s) insertion: ${error.message}`,
                }, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }

    }
    //Below is not necessary. It is only for the purpose of explaining transactions.
    /**If the query to be executed is expected to be involved in a transaction 
     * at the controller level for example, the function here should be used to return the raw sql instead
     * of an execute(), getOne() or getMany() call that will return a Promise.
     * The insertTenantSQL below returns SQL string
     */
    insertTenantSQL(tenant: CreateTenantDto): string {
        return this.tenantRepository.createQueryBuilder()
            .insert()
            .into(Tenant)
            .values(tenant)
            .getSql();
    }

    /*UPDATE section*/

    async update(id: number, tenant: UpdateTenantDto): Promise<UpdateResult> {
        try {
            return await this.tenantRepository.update(id, { ...tenant })
        } catch (error) {
            console.log(error)
            if (error && error.code === PG_UNIQUE_CONSTRAINT_VIOLATION) {
                throw new HttpException({
                    status: HttpStatus.BAD_REQUEST,
                    error: `There was a problem updating tenant data: : ${error.message}`,
                }, HttpStatus.BAD_REQUEST)
            } else {
                throw new HttpException({
                    status: HttpStatus.INTERNAL_SERVER_ERROR,
                    error: `There was a problem updating tenant data: ${error.message}`,
                }, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }

    /**
     * 
     * @param tenant 
     * No partial update allowed here. Saves the tenant object supplied
     */
    async save(tenant: Tenant): Promise<Tenant> {
        try {
            return await this.tenantRepository.save(tenant)
        } catch (error) {
            if (error && error.code === PG_UNIQUE_CONSTRAINT_VIOLATION) {
                throw new HttpException({
                    status: HttpStatus.BAD_REQUEST,
                    error: `There was a problem updating tenant: : ${error.message}`,
                }, HttpStatus.BAD_REQUEST)
            } else {
                throw new HttpException({
                    status: HttpStatus.INTERNAL_SERVER_ERROR,
                    error: `There was a problem updating: ${error.message}`,
                }, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }

    //Let's also do partial update using query builder. Also more efficient
    async updateTenant(tenantId: number, updateTenantDto: UpdateTenantDto): Promise<UpdateResult> {
        try {
            return await this.tenantRepository.createQueryBuilder()
                .update(Tenant)
                .set({ ...updateTenantDto })
                .where("id = :id", { id: tenantId })
                .execute();
        } catch (error) {
            if (error && error.code === PG_UNIQUE_CONSTRAINT_VIOLATION) {
                throw new HttpException({
                    status: HttpStatus.BAD_REQUEST,
                    error: `There was a problem updating tenant: : ${error.message}`,
                }, HttpStatus.BAD_REQUEST)
            } else {
                throw new HttpException({
                    status: HttpStatus.INTERNAL_SERVER_ERROR,
                    error: `There was a problem updating: ${error.message}`,
                }, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }


    /* DELETE section */

    async delete(id: number): Promise<void> {
        try {
            await this.tenantRepository.delete(id);
        } catch (error) {
            throw new HttpException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                error: `There was a problem deleting tenant data: ${error.message}`,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    //query builder equivalent of delete shown above
    async deleteTenant(tenantId: number): Promise<DeleteResult> {
        try {
            return await this.tenantRepository.createQueryBuilder()
                .delete()
                .from(Tenant)
                .where("id = :id", { id: tenantId })
                .execute();
        } catch (error) {
            throw new HttpException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                error: `There was a problem deleting tenant data: ${error.message}`,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * 
     * @param tenant 
     * Remove the Tenant specifed. Returns Tenant removed.
     */
    async remove(tenant: Tenant): Promise<Tenant> {
        try {
            return await this.tenantRepository.remove(tenant);
        } catch (error) {
            throw new HttpException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                error: `There was a problem deleting tenant data: ${error.message}`,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    /** READ section
     */
    /**
     * You can set options e.g. fields, relations to be returned etc. See https://typeorm.io/#/find-options
     */
    async findAllWithOptions(findOptions: string): Promise<[Tenant[], number]> {
        try {
            return await this.tenantRepository.findAndCount(JSON.parse(findOptions));
        } catch (error) {
            throw new HttpException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                error: `There was a problem accessing tenants data: ${error.message}`,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async findAll(): Promise<[Tenant[], number]> {
        try {
            return await this.tenantRepository.findAndCount();
        } catch (error) {
            throw new HttpException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                error: `There was a problem accessing tenants data: ${error.message}`,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * 
     * @param id 
     * find one by id
     */
    async findOne(id: number): Promise<Tenant> {
        try {
            return await this.tenantRepository.findOne(id);
        } catch (error) {
            throw new HttpException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                error: `There was a problem accessing tenant data: ${error.message}`,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }


    /*Let's work on functions to set/add and unset/remove relations. set/unset applies to x-to-one and add/remove applies to x-to-many */
    //1. primaryContact

    /**
     * setPrimaryContact takes and tenantId and user object as primaryContact and sets it.
     * For info on relations querybuilder, see https://github.com/typeorm/typeorm/blob/master/docs/relational-query-builder.md
     * Notice the use of set below, because we are dealing with x-to-one. Since only one primary contact
     * per tenant, we have to set. If it was multiple per tenant i.e. to x-to-many, we have to add
     * @param tenantId 
     * @param primaryContact 
     */
    /*
    Below is one way to handle transactions. The other way involving entitymanager is shorter, hence I commented below out
    Transaction wrapping is done when you have two or more database changes for the same functionality
    and you want to make sure that all changes are rolled back if any of them fails
    I use transaction where I create and then set relationship afterwards like createAndSetPrimaryContact below
    async createAndSetPrimaryContact(tenantId: number, createUserDto: CreateUserDto): Promise<void>{
        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.startTransaction();
        try {
            const newUser = this.userRepository.create(createUserDto);
            const user = await queryRunner.manager.save(newUser);
            await queryRunner.manager.createQueryBuilder()
            .relation(Tenant, "primaryContact")
            .of(tenantId)
            .set(user);

            // commit transaction now:
            await queryRunner.commitTransaction();
        }catch(error){
            // since we have errors let's rollback changes we made
            await queryRunner.rollbackTransaction();
            throw new Error(error.message);
        }finally {
            // you need to release query runner which is manually created:
            await queryRunner.release();
        }
    }
    */
    //See the use of entityManager below for transaction purpose
    async createAndSetPrimaryContact(tenantId: number, createUserDto: CreateUserDto): Promise<void> {
        try {
            await this.connection.manager.transaction(async entityManager => {
                const newUser = this.userRepository.create(createUserDto);
                //hash the password in dto
                await bcrypt.hash(newUser.passwordHash, 10).then((hash: string) => {
                    newUser.passwordHash = hash
                })
                const user = await entityManager.save(newUser);
                await entityManager.createQueryBuilder()
                    .relation(Tenant, "primaryContact")
                    .of(tenantId)
                    .set(user);//x-to-one
            })
        } catch (error) {
            if (error && error.code === PG_UNIQUE_CONSTRAINT_VIOLATION) {
                throw new HttpException({
                    status: HttpStatus.BAD_REQUEST,
                    error: `There was a problem with setting primary contact for tenant: ${error.message}`,
                }, HttpStatus.BAD_REQUEST)
            } else {
                throw new HttpException({
                    status: HttpStatus.INTERNAL_SERVER_ERROR,
                    error: `There was a problem with setting primary contact for tenant: ${error.message}`,
                }, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }

    async setPrimaryContactById(tenantId: number, userId: number): Promise<void> {
        try {
            return await this.tenantRepository.createQueryBuilder()
                .relation(Tenant, "primaryContact")
                .of(tenantId)
                .set(userId)
        } catch (error) {
            throw new HttpException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                error: `There was a problem with setting primary contact for tenant: ${error.message}`,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async unsetPrimaryContactById(tenantId: number): Promise<void> {
        try {
            return await this.tenantRepository.createQueryBuilder()
                .relation(Tenant, "primaryContact")
                .of(tenantId)
                .set(null)
        } catch (error) {
            throw new HttpException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                error: `There was a problem with unsetting primary contact for tenant: ${error.message}`,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    //2. CustomTheme
    async createAndSetCustomTheme(tenantId: number, createCustomThemeDto: CreateCustomThemeDto): Promise<void> {
        try {
            await this.connection.manager.transaction(async entityManager => {
                const newCustomTheme = this.customThemeRepository.create(createCustomThemeDto);
                const customTheme = await entityManager.save(newCustomTheme);
                await entityManager.createQueryBuilder()
                    .relation(Tenant, "customTheme")
                    .of(tenantId)
                    .set(customTheme);
            })
        } catch (error) {
            throw new HttpException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                error: `There was a problem adding custom theme to tenant: ${error.message}`,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async setCustomThemeById(tenantId: number, customThemeId: number): Promise<void> {
        try {
            return await this.tenantRepository.createQueryBuilder()
                .relation(Tenant, "customTheme")
                .of(tenantId)
                .set(customThemeId)
        } catch (error) {
            throw new HttpException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                error: `There was a problem setting custom theme for tenant: ${error.message}`,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async unsetCustomThemeById(tenantId: number): Promise<void> {
        try {
            return await this.tenantRepository.createQueryBuilder()
                .relation(Tenant, "customTheme")
                .of(tenantId)
                .set(null)
        } catch (error) {
            throw new HttpException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                error: `There was a problem unsetting custom theme of tenant: ${error.message}`,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    //3. teamMembers. Special case of many-to-many split into two one-to-manys
    async createAndSetTeamMember(tenantId: number, createTenantTeamDto: CreateTenantTeamDto): Promise<void> {
        try {
            await this.connection.manager.transaction(async entityManager => {
                //create a new user with data sent with dto
                const newUser = this.userRepository.create(createTenantTeamDto.user);
                //hash the password in dto
                await bcrypt.hash(newUser.passwordHash, 10).then((hash: string) => {
                    newUser.passwordHash = hash
                })
                const user = await entityManager.save(newUser);

                //create a new tenant team with roles sent in Dto
                const newTenantTeam = this.tenantTeamRepository.create({ roles: createTenantTeamDto.roles });
                const tenantTeam = await entityManager.save(newTenantTeam);

                //finally, associate the new tenantTeam with both user and tenant
                await entityManager.createQueryBuilder()
                    .relation(TenantTeam, "tenant")
                    .of(tenantTeam.id)
                    .set(tenantId)//x-to-one tenant-team to tenant

                await entityManager.createQueryBuilder()
                    .relation(TenantTeam, "user")
                    .of(tenantTeam.id)
                    .set(user.id);//x-to-one tenant-team to user

            })
        } catch (error) {
            if (error && error.code === PG_UNIQUE_CONSTRAINT_VIOLATION) {
                throw new HttpException({
                    status: HttpStatus.BAD_REQUEST,
                    error: `There was a problem with adding team member to tenant: ${error.message}`,
                }, HttpStatus.BAD_REQUEST)
            } else {
                throw new HttpException({
                    status: HttpStatus.INTERNAL_SERVER_ERROR,
                    error: `There was a problem with adding team member to tenant: ${error.message}`,
                }, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }

    async setTeamMemberById(tenantId: number, userId: number, createTenantTeamRolesDto: CreateTenantTeamRolesDto): Promise<void> {

        try {
            await this.connection.manager.transaction(async entityManager => {
                //create a new tenant team with roles sent in Dto
                const newTenantTeam = this.tenantTeamRepository.create({ roles: createTenantTeamRolesDto.roles });
                const tenantTeam = await entityManager.save(newTenantTeam);

                //Associate the new tenantTeam with both user and tenant
                await entityManager.createQueryBuilder()
                    .relation(TenantTeam, "tenant")
                    .of(tenantTeam.id)
                    .set(tenantId);

                await entityManager.createQueryBuilder()
                    .relation(TenantTeam, "user")
                    .of(tenantTeam.id)
                    .set(userId);
            })
        } catch (error) {
            if (error && error.code === PG_UNIQUE_CONSTRAINT_VIOLATION) {
                throw new HttpException({
                    status: HttpStatus.BAD_REQUEST,
                    error: `There was a problem with adding team member to tenant: ${error.message}`,
                }, HttpStatus.BAD_REQUEST)
            } else {
                throw new HttpException({
                    status: HttpStatus.INTERNAL_SERVER_ERROR,
                    error: `There was a problem with adding team member to tenant: ${error.message}`,
                }, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }

    async deleteTeamMemberById(tenantId: number, userId: number): Promise<DeleteResult> {
        try {
            return await this.tenantTeamRepository.createQueryBuilder()
                .delete()
                .from(TenantTeam)
                .where("tenantId = :tenantId and userId = :userId", { tenantId, userId })
                .execute();
        } catch (error) {
            throw new HttpException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                error: `There was a problem removing team member from tenant: ${error.message}`,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async updateTeamMemberById(tenantId: number, userId: number, updateTenantTeamDto: UpdateTenantTeamDto): Promise<UpdateResult> {
        try {
            return await this.tenantTeamRepository.createQueryBuilder()
                .update()
                .set({ roles: updateTenantTeamDto.roles })
                .where("tenantId = :tenantId and userId = :userId", { tenantId, userId })
                .execute();
        } catch (error) {
            throw new HttpException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                error: `There was a problem updating team member of tenant: ${error.message}`,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    //4. TenantAccountOfficers. Also a case of many-to-many split into two one-to-manys
    async createAndSetTenantAccountOfficer(tenantId: number, createTenantAccountOfficerDto: CreateTenantAccountOfficerDto): Promise<void> {
        try {
            await this.connection.manager.transaction(async entityManager => {
                //create a new user with data sent with dto
                const newUser = this.userRepository.create(createTenantAccountOfficerDto.user);
                //hash the password in dto
                await bcrypt.hash(newUser.passwordHash, 10).then((hash: string) => {
                    newUser.passwordHash = hash
                })
                const user = await entityManager.save(newUser);

                //create a new tenant account officer with roles sent in Dto
                const newTenantAccountOfficer = this.tenantAccountOfficerRepository.create({ roles: createTenantAccountOfficerDto.roles });
                const tenantAccountOfficer = await entityManager.save(newTenantAccountOfficer);

                //finally, associate the new tenantAccountOfficer with both user and tenant
                await entityManager.createQueryBuilder()
                    .relation(TenantAccountOfficer, "tenant")
                    .of(tenantAccountOfficer.id)
                    .set(tenantId);

                await entityManager.createQueryBuilder()
                    .relation(TenantAccountOfficer, "user")
                    .of(tenantAccountOfficer.id)
                    .set(user.id);

            })
        } catch (error) {
            if (error && error.code === PG_UNIQUE_CONSTRAINT_VIOLATION) {
                throw new HttpException({
                    status: HttpStatus.BAD_REQUEST,
                    error: `There was a problem with adding account officer to tenant: ${error.message}`,
                }, HttpStatus.BAD_REQUEST)
            } else {
                throw new HttpException({
                    status: HttpStatus.INTERNAL_SERVER_ERROR,
                    error: `There was a problem with adding account officer to tenant: ${error.message}`,
                }, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }

    async setTenantAccountOfficerById(tenantId: number, userId: number, createTenantAccountOfficerDto: CreateTenantAccountOfficerDto): Promise<void> {

        try {
            await this.connection.manager.transaction(async entityManager => {
                //create a new tenant account officer with roles sent in Dto
                const newTenantAccountOfficer = this.tenantAccountOfficerRepository.create({ roles: createTenantAccountOfficerDto.roles });
                const tenantAccountOfficer = await entityManager.save(newTenantAccountOfficer);

                //Associate the new tenantTeam with both user and tenant
                await entityManager.createQueryBuilder()
                    .relation(TenantAccountOfficer, "tenant")
                    .of(tenantAccountOfficer.id)
                    .set(tenantId);

                await entityManager.createQueryBuilder()
                    .relation(TenantAccountOfficer, "user")
                    .of(tenantAccountOfficer.id)
                    .set(userId);
            })
        } catch (error) {
            if (error && error.code === PG_UNIQUE_CONSTRAINT_VIOLATION) {
                throw new HttpException({
                    status: HttpStatus.BAD_REQUEST,
                    error: `There was a problem with adding account officer to tenant: ${error.message}`,
                }, HttpStatus.BAD_REQUEST)
            } else {
                throw new HttpException({
                    status: HttpStatus.INTERNAL_SERVER_ERROR,
                    error: `There was a problem with adding account officer to tenant: ${error.message}`,
                }, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }

    async deleteTenantAccountOfficerById(tenantId: number, userId: number): Promise<DeleteResult> {
        try {
            return await this.tenantAccountOfficerRepository.createQueryBuilder()
                .delete()
                .from(TenantAccountOfficer)
                .where("tenantId = :tenantId and userId = :userId", { tenantId, userId })
                .execute();
        } catch (error) {
            throw new HttpException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                error: `There was a problem removing tenant account officer from tenant: ${error.message}`,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async updateTenantAccountOfficerById(tenantId: number, userId: number, updateTenantAccountOfficerDto: UpdateTenantAccountOfficerDto): Promise<UpdateResult> {
        try {
            return await this.tenantAccountOfficerRepository.createQueryBuilder()
                .update()
                .set({ roles: updateTenantAccountOfficerDto.roles })
                .where("tenantId = :tenantId and userId = :userId", { tenantId, userId })
                .execute();
        } catch (error) {
            throw new HttpException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                error: `There was a problem updating account officer of tenant: ${error.message}`,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    //5. Themes
    async createAndAddTheme(tenantId: number, createThemeDto: CreateThemeDto): Promise<void> {
        try {
            await this.connection.manager.transaction(async entityManager => {
                const newTheme = this.themeRepository.create(createThemeDto);
                const theme = await entityManager.save(newTheme);
                await entityManager.createQueryBuilder()
                    .relation(Tenant, "themes")
                    .of(tenantId)
                    .add(theme);
            })
        } catch (error) {
            if (error && error.code === PG_UNIQUE_CONSTRAINT_VIOLATION) {
                throw new HttpException({
                    status: HttpStatus.BAD_REQUEST,
                    error: `There was a problem adding theme to tenant: ${error.message}`,
                }, HttpStatus.BAD_REQUEST)
            } else {
                throw new HttpException({
                    status: HttpStatus.INTERNAL_SERVER_ERROR,
                    error: `There was a problem adding theme to tenant: ${error.message}`,
                }, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }

    async addThemeById(tenantId: number, themeId: number): Promise<void> {
        try {
            return await this.tenantRepository.createQueryBuilder()
                .relation(Tenant, "themes")
                .of(tenantId)
                .add(themeId)//add one or more
        } catch (error) {
            throw new HttpException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                error: `There was a problem adding theme to tenant: ${error.message}`,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async removeThemeById(tenantId: number, themeId: number): Promise<void> {
        try {
            return await this.tenantRepository.createQueryBuilder()
                .relation(Tenant, "themes")
                .of(tenantId)
                .remove(themeId)//remove one or more
        } catch (error) {
            throw new HttpException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                error: `There was a problem removing theme from tenant: ${error.message}`,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    //6. Billings
    async createAndAddBilling(tenantId: number, createBillingDto: CreateBillingDto): Promise<void> {
        try {
            await this.connection.manager.transaction(async entityManager => {
                const newBilling = this.themeRepository.create(createBillingDto);
                const billing = await entityManager.save(newBilling);
                await entityManager.createQueryBuilder()
                    .relation(Tenant, "billings")
                    .of(tenantId)
                    .add(billing);
            })
        } catch (error) {
            if (error && error.code === PG_UNIQUE_CONSTRAINT_VIOLATION) {
                throw new HttpException({
                    status: HttpStatus.BAD_REQUEST,
                    error: `There was a problem adding billing to tenant: ${error.message}`,
                }, HttpStatus.BAD_REQUEST)
            } else {
                throw new HttpException({
                    status: HttpStatus.INTERNAL_SERVER_ERROR,
                    error: `There was a problem adding billing to tenant: ${error.message}`,
                }, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }

    async addBillingById(tenantId: number, billingId: number): Promise<void> {
        try {
            return await this.tenantRepository.createQueryBuilder()
                .relation(Tenant, "billings")
                .of(tenantId)
                .add(billingId)//one or more
        } catch (error) {
            throw new HttpException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                error: `There was a problem adding billing to tenant: ${error.message}`,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async removeBillingById(tenantId: number, billingId: number): Promise<void> {
        try {
            return await this.tenantRepository.createQueryBuilder()
                .relation(Tenant, "billings")
                .of(tenantId)
                .remove(billingId)//one or more
        } catch (error) {
            throw new HttpException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                error: `There was a problem removing billing to tenant: ${error.message}`,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    //7. ConnectionResource
    async setConnectionResourceById(tenantId: number, connectionResourseId: number): Promise<void> {
        try {
            return await this.tenantRepository.createQueryBuilder()
                .relation(Tenant, "connectionResourse")
                .of(tenantId)
                .set(connectionResourseId)
        } catch (error) {
            throw new HttpException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                error: `There was a problem setting connection resource for tenant: ${error.message}`,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async unsetConnectionResourceById(tenantId: number): Promise<void> {
        try {
            return await this.tenantRepository.createQueryBuilder()
                .relation(Tenant, "connectionResourse")
                .of(tenantId)
                .set(null)
        } catch (error) {
            throw new HttpException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                error: `There was a problem unsetting connection resource for tenant: ${error.message}`,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    //We can also create some finders using querybuilder. It is more efficient.
    //I am using the Select QueryBuilder here (see https://github.com/typeorm/typeorm/blob/master/docs/select-query-builder.md).
    //Info on insert, update and delete querybuilder and even joining relations, are also in that page
    //Note that QueryBuilder does not work yet with Mongo. For info on Mongo see src https://github.com/typeorm/typeorm/blob/555cd69f46ae68d4686ba4a8e07a8d77a1ee3aad/src/repository/MongoRepository.ts#L56-L55
    //and doc https://github.com/typeorm/typeorm/blob/master/docs/mongodb.md
    //See example below:
    /*   
    async findByActive(active: boolean): Promise<TenantsWithCount>{
        return await this.tenantRepository.createQueryBuilder("tenant")
            .where("tenant.active = :active", { active })
            .getManyAndCount().then((result) => {
                return {tenants:result[0], count:result[1]}
            });
    }
    */
    async findByActive(active: boolean): Promise<[Tenant[], number]> {
        return await this.tenantRepository.createQueryBuilder("tenant")
            .where("tenant.active = :active", { active })
            .getManyAndCount()
    }

    async findByUniqueName(uniqueName: string): Promise<Tenant> {
        return await this.tenantRepository.createQueryBuilder("tenant")
            .where("tenant.uniqueName = :uniqueName", { uniqueName })
            .getOne();
    }

    //some perculiar getters. Sea without shores
    async getActiveTenantsByAccountOfficer(userId: number, active: boolean = true): Promise<TenantAccountOfficer[]> {
        return await this.tenantAccountOfficerRepository.createQueryBuilder("tenantAccountOfficer")
            .innerJoinAndSelect("tenantAccountOfficer.tenant", "tenant", "tenant.active = :active", { active })
            .where("tenantAccountOfficer.user = :userId", { userId })
            .getMany()

        //To restrict the returned fields of user, below for example will only return some indicated fields in select etc
        /*
        return await this.tenantAccountOfficerRepository.createQueryBuilder("tenantAccountOfficer")
        .select(["tenantAccountOfficer.id","tenantAccountOfficer.roles"])
        .addSelect(["tenant.id, tenant.uniqueName, tenant.status"])
        .innerJoin("tenantAccountOfficer.tenant", "tenant", "tenant.active = :active", {active})
        .where("tenantAccountOfficer.user = :userId", {userId})
        .getMany()
        */

    }

    async getAccountOfficersByTenant(tenantId: number): Promise<TenantAccountOfficer[]> {
        return await this.tenantAccountOfficerRepository.createQueryBuilder("tenantAccountOfficer")
            .innerJoinAndSelect("tenantAccountOfficer.user", "user")
            .where("tenantAccountOfficer.tenant = :tenantId", { tenantId })
            .getMany()

        //To restrict the returned fields of user, below for example will only return user.id, user.firstName, user.lastName, etc
        /*
        return await this.tenantAccountOfficerRepository.createQueryBuilder("tenantAccountOfficer")
        .select(["tenantAccountOfficer.id", "tenantAccountOfficer.roles"])
        .addSelect(["user.id, user.firstName, user.lastName, user.primaryEmailAddress, user.phone, user.roles"])
        .innerJoin("tenantAccountOfficer.user", "user")
        .where("tenantAccountOfficer.tenant = :tenantId", {tenantId})
        .getMany()
        */

    }

    async setTenantLogo(tenantId: number, req: Request, reply: Reply): Promise<any> {
        /*This is a special case. 
        References: 
        https://medium.com/@427anuragsharma/upload-files-using-multipart-with-fastify-and-nestjs-3f74aafef331,
        https://github.com/fastify/fastify-multipart

        For ideas on send files, see https://expressjs.com/en/api.html#res.sendFile, https://stackoverflow.com/questions/51045980/how-to-serve-assets-from-nest-js-and-add-middleware-to-detect-image-request, https://github.com/fastify/fastify/issues/163#issuecomment-323070670, 
        Steps:
        1. npm i fastify-multipart
        2. Assuming that uploads will be to /uploads folder under project directory, create the folder.
        For multitenant implementations, we will read this from connectionResourse.rootFileSystem
        3. For user photos, we will assume the path photos/filename. We will use uuid to generate unique filename and store in photo fieldThe filename will be stored in photo field
        4. We will store the mime type for file in user field photoFileEncoding, for setting content type when sending file
        5. Register the installed fastify-multipart in main.ts
        */
        //Check request is multipart
        if (!req.isMultipart()) {
            reply.send(
                new HttpException({
                    status: HttpStatus.BAD_REQUEST,
                    error: `There was a problem uploading logo. No logo was sent`,
                }, HttpStatus.BAD_REQUEST)
            )
        }
        //It is multipart, so proceed to get the file

        try {
            //console.log('about to set options')
            const options = { limits: { fileSize: LOGO_FILE_SIZE_LIMIT } }; //limit options may be passed. Unit is bytes. See main.ts for comments on other options
            const data = await req.file();

            //save to file
            //We will use uuid (see https://github.com/uuidjs/uuid) to generate filename instead of using data.filename
            //note: npm install uuid @types/uuid
            let { fileName } = await this.getLogoInfo(tenantId);
            if (fileName == null) fileName = uuidv4(); //no previous photo, generate new fileName
            //time to write
            const pump = util.promisify(pipeline)
            await pump(data.file, fs.createWriteStream(`uploads/logos/${fileName}`))//beware of filesystem permissions

            //save the fileName to logo and mimetype to tenant logoMimeType field
            const updateResult = await this.tenantRepository.createQueryBuilder()
                .update(Tenant)
                .set({ logo: fileName, logoMimeType: data.mimetype })
                .where("id = :tenantId", { tenantId })
                .execute();

            reply.send(updateResult);
        } catch (error) {
            /*const fastify = require('fastify');//Below only works with this. Hence this weird entry here
            if (error instanceof fastify.multipartErrors.FilesLimitError) {
                reply.send(new HttpException({
                    status: HttpStatus.BAD_REQUEST,
                    error: `There was a problem uploading logo. Keep upload to size limit of ${LOGO_FILE_SIZE_LIMIT} bytes`,
                }, HttpStatus.BAD_REQUEST))
            } else {*/
                reply.send(
                    new HttpException({
                        status: HttpStatus.INTERNAL_SERVER_ERROR,
                        error: `There was a problem uploading logo: ${error.message}`,
                    }, HttpStatus.INTERNAL_SERVER_ERROR)
                )
            //}
        }
    }

    /**
     * Get information about tenant logo
     * @param tenantId 
     */
    async getLogoInfo(tenantId: number): Promise<{ fileName: string, mimeType: string }> {
        try {
            /* Below is not working. .select has a problem with case sensitivity
            return await this.tenantRepository.createQueryBuilder("tenant")
                .select(["tenant.logo AS fileName", "tenant.logoMimeType as mimeType"])
                .where("id = :tenantId", { tenantId })
                //.cache(1000) //1sec by default. You can change the value
                .execute();
                */
            const tenant: Tenant = await this.tenantRepository.findOne(tenantId)

            return { fileName: tenant.logo, mimeType: tenant.logoMimeType }
        } catch (error) {
            console.log(error)
            throw new HttpException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                error: `There was a problem with getting tenant logo info: ${error.message}`,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getTenantLogo(tenantId: number, reply: Reply) {
        const logoInfo = await this.getLogoInfo(tenantId);
        let { fileName, mimeType } = logoInfo;
        if (fileName == null || undefined) {

            fileName = "blankLogoAvatar.png";//make sure that it exists
            mimeType = "image/png";
        }
        const filePath = `uploads/logos/${fileName}`;
        //read the file as stream and send out
        try {
            const stream = fs.createReadStream(filePath)
            reply.type(mimeType).send(stream);
        } catch (error) {
            reply.send(new HttpException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                error: `There was a problem with getting tenant logo info: ${error.message}`,
            }, HttpStatus.INTERNAL_SERVER_ERROR));
        }
    }


    async sendVerificationEmail(user: User, req: Request): Promise<void> {
        if (user != null) {
            //generate the token (for primary or backup). See resetPasswordRequest above for ideas
            randomBytes(256, async (error, buf) => {
                if (error)
                    throw error; //strange. the catch part below will handle it
                const token = buf.toString('hex');

                //success. Continue with email containing reset message with token
                user.primaryEmailVerificationToken = token;
                user.emailVerificationTokenExpiration = new Date(Date.now() + EMAIL_VERIFICATION_EXPIRATION);
                //save the updated user
                await this.userRepository.save(user);

                //construct and send email using nodemailer
                const globalPrefixUrl = USE_API_VERSION_IN_URL ? `/${API_VERSION}` : '';
                const url = `${req.protocol || PROTOCOL}://${req.hostname}${globalPrefixUrl}/users/confirm-primary-email/${token}`;
                const mailText = confirmEmailMailOptionSettings.textTemplate.replace('{url}', url);

                //mailOptions
                const mailOptions: SendMailOptions = {
                    to: user.primaryEmailAddress,
                    from: confirmEmailMailOptionSettings.from,
                    subject: confirmEmailMailOptionSettings.subject,
                    text: mailText,
                };

                //send mail
                smtpTransportGmail.sendMail(mailOptions, async (error: Error) => {
                    //if (error)
                    //    throw error; //throw error that will be caught at the end?
                    console.log(error);
                });
            });
        }
    }

}

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import { PG_UNIQUE_CONSTRAINT_VIOLATION } from 'src/global/error.codes';
import { CreateRoleDto } from 'src/roles/dto/create/create-role.dto';
import { Role } from 'src/roles/models/role.entity';
import { CreateTenantAccountOfficerDto } from 'src/tenants/dto/create/create-account-officer.dto';
import { CreateTenantTeamDto, CreateTenantTeamRolesDto } from 'src/tenants/dto/create/create-tenant-team.dto';
import { CreateTenantDto } from 'src/tenants/dto/create/create-tenant.dto';
import { UpdateTenantAccountOfficerRolesDto } from 'src/tenants/dto/update/update-account-officer.dto';
import { UpdateTenantTeamRolesDto } from 'src/tenants/dto/update/update-tenant-team.dto';
import { TenantAccountOfficer } from 'src/tenants/models/tenant-account-officer';
import { TenantTeam } from 'src/tenants/models/tenant-team';
import { Tenant } from 'src/tenants/models/tenant.entity';
import { Connection, DeleteResult, InsertResult, Repository, UpdateResult } from 'typeorm';
import { CreateUserDto } from './dto/create/create-user.dto';
import { UpdateUserDto } from './dto/update/update-user.dto';
import { User } from './models/user.entity';
import * as bcrypt from 'bcrypt';
//five imports below are for file upload handling
import { Gender, Reply, Request } from '../global/custom.interfaces';
import util from 'util'; //for uploaded file streaming to file
import { pipeline } from 'stream';//also for uploaded file streaming to file
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { randomBytes } from 'crypto';
import { API_VERSION, AUTO_SEND_CONFIRM_EMAIL, confirmEmailMailOptionSettings, EMAIL_VERIFICATION_EXPIRATION, PASSWORD_RESET_EXPIRATION, PHOTO_FILE_SIZE_LIMIT, PROTOCOL, resetPasswordMailOptionSettings, smtpTransport, smtpTransportGmail, TenantTeamRole, USE_API_VERSION_IN_URL } from 'src/global/app.settings';
import { SendMailOptions } from 'nodemailer';
import { GenericBulmaNotificationResponseDto } from 'src/global/generic.dto';
import { FacebookProfileDto } from 'src/auth/dtos/facebook-profile.dto';
import * as randomstring from 'randomstring';

@Injectable()
export class UsersService {

    constructor(
        @InjectRepository(User) private userRepository: Repository<User>,
        @InjectRepository(Role) private roleRepository: Repository<Role>,
        @InjectRepository(Tenant) private tenantRepository: Repository<Tenant>,
        @InjectRepository(TenantTeam) private tenantTeamRepository: Repository<TenantTeam>,
        @InjectRepository(TenantAccountOfficer) private tenantAccountOfficerRepository: Repository<TenantAccountOfficer>,
        @InjectConnection('default')//You can inject connection by name. See https://docs.nestjs.com/techniques/database#multiple-databases
        private connection: Connection
    ) { }

    /*CREATE section*/

    /**
     * 
     * @param createUserDto 
     */
    async create(createUserDto: CreateUserDto, req: Request): Promise<User> {
        try {
            const newUser = this.userRepository.create(createUserDto);
            //hash the password in dto
            await bcrypt.hash(newUser.passwordHash, 10).then((hash: string) => {
                newUser.passwordHash = hash
            })
            const user = await this.userRepository.save(newUser);
            //call confirmEmailRequest() without await.
            if (AUTO_SEND_CONFIRM_EMAIL) this.confirmEmailRequest(user.primaryEmailAddress, null, true, req)
            return user;
        } catch (error) {
            if (error && error.code === PG_UNIQUE_CONSTRAINT_VIOLATION) {
                throw new HttpException({
                    status: HttpStatus.BAD_REQUEST,
                    error: `There was a problem with user creation: : ${error.message}`,
                }, HttpStatus.BAD_REQUEST)
            } else {
                throw new HttpException({
                    status: HttpStatus.INTERNAL_SERVER_ERROR,
                    error: `There was a problem with user creation: ${error.message}`,
                }, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }

    async createFromFacebookProfile(facebookProfileDto: FacebookProfileDto): Promise<User> {

        const createUserDto: CreateUserDto = {

            landlord: false,
            firstName: facebookProfileDto.name.givenName,
            lastName: facebookProfileDto.name.familyName,
            commonName: facebookProfileDto.displayName,
            primaryEmailAddress: facebookProfileDto.emails[0].value,
            isPrimaryEmailAddressVerified: true,
            passwordHash: randomstring.generate(),
            isPasswordChangeRequired: true,
            gender: facebookProfileDto.gender == 'male' ? Gender.M : Gender.F,
            dateOfBirth: new Date()

        }

        //create the user
        try {
            const newUser = this.userRepository.create(createUserDto);
            //hash the password in dto
            await bcrypt.hash(newUser.passwordHash, 10).then((hash: string) => {
                newUser.passwordHash = hash
            })
            
            let user = await this.userRepository.save(newUser);

            //add the relationship with facebookProfile before returning
            user = await this.addFacebookProfile(user.id, facebookProfileDto);

            //no need to call confirm email as Facebook has done that for us.
            //TODO: But we need to send mail to welcome the user and also initiate password change request
            return user;
        } catch (error) {
            if (error && error.code === PG_UNIQUE_CONSTRAINT_VIOLATION) {
                //this would imply that the user with the email address already exists.
                throw new HttpException({
                    status: HttpStatus.BAD_REQUEST,
                    error: `There was a problem with user creation: : ${error.message}`,
                }, HttpStatus.BAD_REQUEST)
            } else {
                throw new HttpException({
                    status: HttpStatus.INTERNAL_SERVER_ERROR,
                    error: `There was a problem with user creation: ${error.message}`,
                }, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }



    }

    //insert using query builder - more efficient than save. Can be used for single or bulk save. See https://github.com/typeorm/typeorm/blob/master/docs/insert-query-builder.md
    async insertUsers(users: CreateUserDto[], req: Request): Promise<InsertResult> {//users is an array of objects
        try {
            //iteratively hash the passwords
            let usersWithHashedPasswords = [];
            users.map(async (user) => {
                //hash the password in dto
                await bcrypt.hash(user.passwordHash, 10).then((hash: string) => {
                    user.passwordHash = hash;
                    usersWithHashedPasswords.push(user);
                })
            })
            const insertResult = await this.userRepository.createQueryBuilder()
                .insert()
                .into(User)
                .values(usersWithHashedPasswords)
                .execute();

            //iteratively call confirmEmailRequest() for users without await.
            if (AUTO_SEND_CONFIRM_EMAIL) {
                users.map((user) => {
                    this.confirmEmailRequest(user.primaryEmailAddress, null, true, req)
                })
            }

            return insertResult;

        } catch (error) {
            if (error && error.code === PG_UNIQUE_CONSTRAINT_VIOLATION) {
                throw new HttpException({
                    status: HttpStatus.BAD_REQUEST,
                    error: `There was a problem with user(s) insertion: : ${error.message}`,
                }, HttpStatus.BAD_REQUEST)
            } else {
                throw new HttpException({
                    status: HttpStatus.INTERNAL_SERVER_ERROR,
                    error: `There was a problem with user(s) insertion: ${error.message}`,
                }, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }

    }
    //Below is not necessary. It is only for the purpose of explaining transactions.
    /**If the query to be executed is expected to be involved in a transaction 
     * at the controller level for example, the function here should be used to return the raw sql instead
     * of an execute(), getOne() or getMany() call that will return a Promise.
     * The insertUserSQL below returns SQL string
     */
    async insertUserSQL(user: CreateUserDto): Promise<string> {
        //hash the password in dto
        await bcrypt.hash(user.passwordHash, 10).then((hash: string) => {
            user.passwordHash = hash
        })
        return this.userRepository.createQueryBuilder()
            .insert()
            .into(User)
            .values(user)
            .getSql();
    }

    /*UPDATE section*/

    async update(id: number, user: UpdateUserDto): Promise<UpdateResult> {
        try {
            /*
            if (user.passwordHash != '') { //new password was sent. Not ideal though. There should be a different process for updating password
                await bcrypt.hash(user.passwordHash, 10).then((hash: string) => {
                    user.passwordHash = hash
                })
            }*/
            //exclude user password, if any. Password should be edited either by user setPassword or admin resetPassword
            const { passwordHash, ...userToSave } = user
            return await this.userRepository.update(id, { ...userToSave })
        } catch (error) {
            if (error && error.code === PG_UNIQUE_CONSTRAINT_VIOLATION) {
                throw new HttpException({
                    status: HttpStatus.BAD_REQUEST,
                    error: `There was a problem updating user data: : ${error.message}`,
                }, HttpStatus.BAD_REQUEST)
            } else {
                throw new HttpException({
                    status: HttpStatus.INTERNAL_SERVER_ERROR,
                    error: `There was a problem updating user data: ${error.message}`,
                }, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }

    /**
     * 
     * @param user 
     * No partial update allowed here. Saves the user object supplied
     */
    async save(user: User): Promise<User> {

        try {
            /*
            if (user.passwordHash && user.passwordHash != '') { //new password was sent. Not ideal though. There should be a different process for updating password
                await bcrypt.hash(user.passwordHash, 10).then((hash: string) => {
                    user.passwordHash = hash
                })
            }*/
            //exclude user password if any. Password should be edited either by user setPassword or admin resetPassword
            const { passwordHash, ...userToSave } = user
            return await this.userRepository.save({ ...userToSave })
        } catch (error) {
            if (error && error.code === PG_UNIQUE_CONSTRAINT_VIOLATION) {
                throw new HttpException({
                    status: HttpStatus.BAD_REQUEST,
                    error: `There was a problem updating user: : ${error.message}`,
                }, HttpStatus.BAD_REQUEST)
            } else {
                throw new HttpException({
                    status: HttpStatus.INTERNAL_SERVER_ERROR,
                    error: `There was a problem updating user: ${error.message}`,
                }, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }

    //Let's also do partial update using query builder. Also more efficient
    async updateUser(userId: number, updateUserDto: UpdateUserDto): Promise<UpdateResult> {
        try {
            /*
            if (updateUserDto.passwordHash != '') { //new password was sent. Not ideal though. There should be a different process for updating password
                await bcrypt.hash(updateUserDto.passwordHash, 10).then((hash: string) => {
                    updateUserDto.passwordHash = hash
                })
            }*/
            //exclude user password, if any. Password should be edited either by user setPassword or admin resetPassword
            const { passwordHash, ...userToSave } = updateUserDto
            return await this.userRepository.createQueryBuilder()
                .update(User)
                .set({ ...userToSave })
                .where("id = :id", { id: userId })
                .execute();
        } catch (error) {
            if (error && error.code === PG_UNIQUE_CONSTRAINT_VIOLATION) {
                throw new HttpException({
                    status: HttpStatus.BAD_REQUEST,
                    error: `There was a problem updating user: : ${error.message}`,
                }, HttpStatus.BAD_REQUEST)
            } else {
                throw new HttpException({
                    status: HttpStatus.INTERNAL_SERVER_ERROR,
                    error: `There was a problem updating user: ${error.message}`,
                }, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }


    /* DELETE section */

    async delete(id: number): Promise<void> {
        try {
            await this.userRepository.delete(id);
        } catch (error) {
            throw new HttpException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                error: `There was a problem deleting user data: ${error.message}`,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    //query builder equivalent of delete shown above
    async deleteUser(userId: number): Promise<DeleteResult> {
        try {
            return await this.userRepository.createQueryBuilder()
                .delete()
                .from(User)
                .where("id = :id", { id: userId })
                .execute();
        } catch (error) {
            throw new HttpException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                error: `There was a problem deleting user data: ${error.message}`,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * 
     * @param user 
     * Remove the User specifed. Returns User removed.
     */
    async remove(user: User): Promise<User> {
        try {
            return await this.userRepository.remove(user);
        } catch (error) {
            throw new HttpException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                error: `There was a problem deleting user data: ${error.message}`,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    /** READ section
     */
    /**
     * You can set options e.g. fields, relations to be returned etc. See https://typeorm.io/#/find-options
     */
    async findAllWithOptions(findOptions: string): Promise<[User[], number]> {
        try {
            return await this.userRepository.findAndCount(JSON.parse(findOptions));
        } catch (error) {
            throw new HttpException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                error: `There was a problem accessing users data: ${error.message}`,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async findAll(): Promise<[User[], number]> {
        try {
            return await this.userRepository.findAndCount();
        } catch (error) {
            throw new HttpException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                error: `There was a problem accessing users data: ${error.message}`,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * 
     * @param id 
     * find one by id
     */
    async findOne(id: number): Promise<User> {
        try {
            return await this.userRepository.findOne(id);
        } catch (error) {
            throw new HttpException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                error: `There was a problem accessing user data: ${error.message}`,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }

    /*Let's work on functions to set/add and unset/remove relations. set/unset applies to x-to-one and add/remove applies to x-to-many */
    //1. Roles
    async createAndAddRole(userId: number, createRoleDto: CreateRoleDto): Promise<void> {
        try {
            await this.connection.manager.transaction(async entityManager => {
                const newRole = this.roleRepository.create(createRoleDto);
                const role = await entityManager.save(newRole);
                await entityManager.createQueryBuilder()
                    .relation(User, "roles")
                    .of(userId)
                    .add(role);//using add because of to-many
            })
        } catch (error) {
            if (error && error.code === PG_UNIQUE_CONSTRAINT_VIOLATION) {
                throw new HttpException({
                    status: HttpStatus.BAD_REQUEST,
                    error: `There was a problem with adding role to user: ${error.message}`,
                }, HttpStatus.BAD_REQUEST)
            } else {
                throw new HttpException({
                    status: HttpStatus.INTERNAL_SERVER_ERROR,
                    error: `There was a problem with adding role to user: ${error.message}`,
                }, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }

    async addRoleById(userId: number, roleId: number): Promise<void> {
        try {
            return await this.userRepository.createQueryBuilder()
                .relation(User, "roles")
                .of(userId)
                .add(roleId)
        } catch (error) {
            if (error && error.code === PG_UNIQUE_CONSTRAINT_VIOLATION) {
                throw new HttpException({
                    status: HttpStatus.BAD_REQUEST,
                    error: `There was a problem adding role to user: ${error.message}`,
                }, HttpStatus.BAD_REQUEST)
            } else {
                throw new HttpException({
                    status: HttpStatus.INTERNAL_SERVER_ERROR,
                    error: `There was a problem with adding role to user: ${error.message}`,
                }, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }

    async addRolesById(userId: number, roleIds: number[]): Promise<Role[]> {
        try {
            await this.userRepository.createQueryBuilder()
                .relation(User, "roles")
                .of(userId)
                .add(roleIds)
            //return the user roles modified for redisplay
            const user = await this.userRepository.findOne(userId, { relations: ['roles'] });
            return user.roles;
        } catch (error) {
            if (error && error.code === PG_UNIQUE_CONSTRAINT_VIOLATION) {
                throw new HttpException({
                    status: HttpStatus.BAD_REQUEST,
                    error: `There was a problem adding roles to user: ${error.message}`,
                }, HttpStatus.BAD_REQUEST)
            } else {
                throw new HttpException({
                    status: HttpStatus.INTERNAL_SERVER_ERROR,
                    error: `There was a problem with adding roles to user: ${error.message}`,
                }, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }

    async removeRoleById(userId: number, roleId: number): Promise<Role[]> {
        try {
            await this.userRepository.createQueryBuilder()
                .relation(User, "roles")
                .of(userId)
                .remove(roleId)
            //return the user roles modified for redisplay
            const user = await this.userRepository.findOne(userId, { relations: ['roles'] });
            return user.roles;
        } catch (error) {
            throw new HttpException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                error: `There was a problem removing role from user: ${error.message}`,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async removeRolesById(userId: number, roleIds: number[]): Promise<Role[]> {
        try {
            await this.userRepository.createQueryBuilder()
                .relation(User, "roles")
                .of(userId)
                .remove(roleIds)
            //return the user roles modified for redisplay
            const user = await this.userRepository.findOne(userId, { relations: ['roles'] });
            return user.roles;
        } catch (error) {
            throw new HttpException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                error: `There was a problem removing roles from user: ${error.message}`,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /*Let's work on functions to set/add and unset/remove relations. set/unset applies to x-to-one and add/remove applies to x-to-many */
    //1. Tenant Primary Contact
    async createAndSetTenantForPrimaryContact(userId: number, createTenantDto: CreateTenantDto): Promise<void> {
        try {
            await this.connection.manager.transaction(async entityManager => {
                const newTenant = this.tenantRepository.create(createTenantDto);
                const tenant = await entityManager.save(newTenant);
                await entityManager.createQueryBuilder()
                    .relation(User, "primaryContactForWhichTenants")
                    .of(userId)
                    .add(tenant);//x-to-one
            })
        } catch (error) {
            if (error && error.code === PG_UNIQUE_CONSTRAINT_VIOLATION) {
                throw new HttpException({
                    status: HttpStatus.BAD_REQUEST,
                    error: `There was a problem with adding tenant to primary contact: ${error.message}`,
                }, HttpStatus.BAD_REQUEST)
            } else {
                throw new HttpException({
                    status: HttpStatus.INTERNAL_SERVER_ERROR,
                    error: `There was a problem with adding tenant to primary contact: ${error.message}`,
                }, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }

    async setAsPrimaryContactForATenantByTenantId(userId: number, tenantId: number): Promise<Tenant[]> {
        try {
            await this.tenantRepository.createQueryBuilder() //going through the tenant side, the to-one side, to avoid multiple add
                .relation(Tenant, "primaryContact")
                .of(tenantId)
                .set(userId)

            /*
            await this.userRepository.createQueryBuilder() //going through the tenant side, the to-one side, to avoid multiple add
            .relation(User, "primaryContactForWhichTenants")
            .of(userId)
            .add(tenantId)
            */

            const user = await this.userRepository.findOne(userId, { relations: ['primaryContactForWhichTenants'] })
            return user.primaryContactForWhichTenants;
        } catch (error) {
            if (error && error.code === PG_UNIQUE_CONSTRAINT_VIOLATION) {
                throw new HttpException({
                    status: HttpStatus.BAD_REQUEST,
                    error: `There was a problem with adding user as primary contact for tenant: ${error.message}`,
                }, HttpStatus.BAD_REQUEST)
            } else {
                throw new HttpException({
                    status: HttpStatus.INTERNAL_SERVER_ERROR,
                    error: `There was a problem with adding user as primary contact for tenant: ${error.message}`,
                }, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }

    async setAsPrimaryContactForATenantByTenantUniqueName(userId: number, uniqueName: string): Promise<Tenant[]> {

        try {
            //first get tenant with the unique name
            const tenant: Tenant = await this.tenantRepository.createQueryBuilder('tenant')
                .where("tenant.uniqueName = :uniqueName", { uniqueName: uniqueName })
                .getOne();

            if (tenant) { //associate with the user as primary contact

                await this.tenantRepository.createQueryBuilder() //going through the tenant side, the to-one side, to avoid multiple add
                    .relation(Tenant, "primaryContact")
                    .of(tenant.id)
                    .set(userId)

                /*
                await this.userRepository.createQueryBuilder() //going through the tenant side, the to-one side, to avoid multiple add
                .relation(User, "primaryContactForWhichTenants")
                .of(userId)
                .add(tenant.id)
                */

                const user = await this.userRepository.findOne(userId, { relations: ['primaryContactForWhichTenants'] })
                return user.primaryContactForWhichTenants;
            } else {
                throw new HttpException({
                    status: HttpStatus.BAD_REQUEST,
                    error: `There was a problem with adding user as primary contact for tenant. Tenant does not exist`,
                }, HttpStatus.BAD_REQUEST);
            }

        } catch (error) {
            if (error && error.code === PG_UNIQUE_CONSTRAINT_VIOLATION) {
                throw new HttpException({
                    status: HttpStatus.BAD_REQUEST,
                    error: `There was a problem with adding user as primary contact for tenant: ${error.message}`,
                }, HttpStatus.BAD_REQUEST)
            } else {
                throw new HttpException({
                    status: HttpStatus.INTERNAL_SERVER_ERROR,
                    error: `There was a problem with adding user as primary contact for tenant: ${error.message}`,
                }, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }

    async removeAsPrimaryContactForATenantsById(userId: number, tenantId: number): Promise<Tenant[]> {
        try {
            await this.userRepository.createQueryBuilder()
                .relation(User, "primaryContactForWhichTenants")
                .of(userId)
                .remove(tenantId)

            const user = await this.userRepository.findOne(userId, { relations: ['primaryContactForWhichTenants'] })
            return user.primaryContactForWhichTenants;
        } catch (error) {
            throw new HttpException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                error: `There was a problem with unsetting primary contact for tenant: ${error.message}`,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    //3. tenantTeamMemberships. Special case of many-to-many split into two one-to-manys
    async createTenantAndSetTeamMembership(userId: number, createTenantTeamDto: CreateTenantTeamDto): Promise<void> {
        try {
            await this.connection.manager.transaction(async entityManager => {
                //create a new tenant with data sent with dto
                const newTenant = this.tenantRepository.create(createTenantTeamDto.tenant);
                const tenant = await entityManager.save(newTenant);

                //create a new tenant team with roles sent in Dto
                const newTenantTeam = this.tenantTeamRepository.create({ roles: createTenantTeamDto.roles });
                const tenantTeam = await entityManager.save(newTenantTeam);

                //finally, associate the new tenantTeam with both user and tenant
                await entityManager.createQueryBuilder()
                    .relation(TenantTeam, "tenant")
                    .of(tenantTeam.id)
                    .set(tenant.id)//x-to-one tenant-team to tenant

                await entityManager.createQueryBuilder()
                    .relation(TenantTeam, "user")
                    .of(tenantTeam.id)
                    .set(userId);//x-to-one tenant-team to user

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

    async setTeamMembershipById(userId: number, tenantId: number, createTenantTeamRolesDto: CreateTenantTeamRolesDto): Promise<void> {
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

    async setTeamMembershipByTenantUniqueName(userId: number, uniqueName: string, roles: TenantTeamRole[]): Promise<TenantTeam[]> {
        try {
            await this.connection.manager.transaction(async entityManager => {

                //first get tenant with the unique name
                const tenant: Tenant = await this.tenantRepository.createQueryBuilder('tenant')
                    .where("tenant.uniqueName = :uniqueName", { uniqueName: uniqueName })
                    .getOne();

                if (tenant) {
                    //create a new tenant team with roles sent in Dto
                    const newTenantTeam = this.tenantTeamRepository.create({ roles: roles, tenantUniqueName: uniqueName, tenantUniqueId: tenant.id });
                    const tenantTeam = await entityManager.save(newTenantTeam);

                    //Associate the new tenantTeam with both user and tenant
                    await entityManager.createQueryBuilder()
                        .relation(TenantTeam, "tenant")
                        .of(tenantTeam.id)
                        .set(tenant.id);

                    await entityManager.createQueryBuilder()
                        .relation(TenantTeam, "user")
                        .of(tenantTeam.id)
                        .set(userId);

                } else {//tenant not found
                    throw new HttpException({
                        status: HttpStatus.BAD_REQUEST,
                        error: `There was a problem with adding team member to tenant. Tenant does not exist`,
                    }, HttpStatus.BAD_REQUEST);
                }

            });
            //after transaction. Cannot return inside transaction
            const user = await this.userRepository.findOne(userId, { relations: ['tenantTeamMemberships'] })
            return user.tenantTeamMemberships;

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

    async deleteTeamMemberShipById(userId: number, tenantId: number): Promise<TenantTeam[]> {
        console.log('inside delete')
        try {
            await this.tenantTeamRepository.createQueryBuilder()
                .delete()
                .from(TenantTeam)
                .where("tenant = :tenantId and user = :userId", { tenantId, userId })
                .execute();

            const user = await this.userRepository.findOne(userId, { relations: ['tenantTeamMemberships'] })
            return user.tenantTeamMemberships;
        } catch (error) {
            throw new HttpException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                error: `There was a problem removing team member from tenant: ${error.message}`,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async updateTeamMemberShipRolesById(userId: number, tenantId: number, updateTenantTeamRolesDto: UpdateTenantTeamRolesDto): Promise<UpdateResult> {
        try {
            return await this.tenantTeamRepository.createQueryBuilder()
                .update()
                .set({ roles: updateTenantTeamRolesDto.roles })
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
    async createAndSetAccountOfficerForWhichTenant(userId: number, createTenantAccountOfficerDto: CreateTenantAccountOfficerDto): Promise<void> {
        try {
            await this.connection.manager.transaction(async entityManager => {
                //create a new tenant with data sent with dto
                const newTenant = this.tenantRepository.create(createTenantAccountOfficerDto.tenant);
                const tenant = await entityManager.save(newTenant);

                //create a new tenant account officer with roles sent in Dto
                const newTenantAccountOfficer = this.tenantAccountOfficerRepository.create({ roles: createTenantAccountOfficerDto.roles });
                const tenantAccountOfficer = await entityManager.save(newTenantAccountOfficer);

                //finally, associate the new tenantAccountOfficer with both user and tenant
                await entityManager.createQueryBuilder()
                    .relation(TenantAccountOfficer, "tenant")
                    .of(tenantAccountOfficer.id)
                    .set(tenant.id);

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

    async setTenantAccountOfficerForWhichTenantById(userId: number, tenantId: number, createTenantAccountOfficerDto: CreateTenantAccountOfficerDto): Promise<void> {

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

    async deleteTenantAccountOfficerForWhichTenantById(userId: number, tenantId: number): Promise<DeleteResult> {
        try {
            return await this.tenantAccountOfficerRepository.createQueryBuilder()
                .delete()
                .from(TenantAccountOfficer)
                .where("tenantId = :tenantId and userId = :userId", { tenantId, userId })
                .execute();
        } catch (error) {
            throw new HttpException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                error: `There was a problem removing user as tenant account officer from tenant: ${error.message}`,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async updateTenantAccountOfficerForWhichTenantById(userId: number, tenantId: number, updateTenantAccountOfficerRolesDto: UpdateTenantAccountOfficerRolesDto): Promise<UpdateResult> {
        try {
            return await this.tenantAccountOfficerRepository.createQueryBuilder()
                .update()
                .set({ roles: updateTenantAccountOfficerRolesDto.roles })
                .where("tenantId = :tenantId and userId = :userId", { tenantId, userId })
                .execute();
        } catch (error) {
            throw new HttpException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                error: `There was a problem updating user as account officer of tenant: ${error.message}`,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    /*Some user perculiarities*/

    async setUserPassword(userId: number, password: string): Promise<UpdateResult> {
        try {
            await bcrypt.hash(password, 10).then((hash: string) => {
                password = hash
            })
            return await this.userRepository.createQueryBuilder()
                .update()
                .set({ passwordHash: password })
                .where("id = :userId", { userId })
                .execute();
        } catch (error) {
            throw new HttpException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                error: `There was a problem updating user password: ${error.message}`,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async setUserPhoto(userId: number, req: Request, reply: Reply): Promise<any> {
        /*This is a special case. 
        References: 
        https://github.com/fastify/fastify-multipart; https://medium.com/@427anuragsharma/upload-files-using-multipart-with-fastify-and-nestjs-3f74aafef331,
        

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
                    error: `There was a problem uploading photo. No photo was sent`,
                }, HttpStatus.BAD_REQUEST)
            )
        }
        //It is multipart, so proceed to get the file
        try {
            const options = { limits: { fileSize: PHOTO_FILE_SIZE_LIMIT } }; //limit options may be passed. Unit is bytes. See main.ts for comments on other options
            const data = await req.file(options);
            //save to file
            //We will use uuid (see https://github.com/uuidjs/uuid) to generate filename instead of using data.filename
            //note: npm install uuid @types/uuid
            let { fileName } = await this.getPhotoInfo(userId);
            if (fileName == null) fileName = uuidv4(); //no previous photo, generate new fileName
            //time to write
            const pump = util.promisify(pipeline)
            await pump(data.file, fs.createWriteStream(`uploads/photos/${fileName}`))//beware of filesystem permissions

            //save the fileName to photo and mimetype to user photoMimeType field
            const updateResult = await this.userRepository.createQueryBuilder()
                .update(User)
                .set({ photo: fileName, photoMimeType: data.mimetype })
                .where("id = :userId", { userId })
                .execute();

            reply.send(updateResult);
        } catch (error) {
            //const fastify = require('fastify');//Below only works with this.Hence this weird entry here
            /*
            if (error instanceof fastify.multipartErrors.FilesLimitError) {
                reply.send(new HttpException({
                    status: HttpStatus.BAD_REQUEST,
                    error: `There was a problem uploading photo. Keep upload to size limit of ${PHOTO_FILE_SIZE_LIMIT} bytes`,
                }, HttpStatus.BAD_REQUEST))
                */
            //} else {
            reply.send(
                new HttpException({
                    status: HttpStatus.INTERNAL_SERVER_ERROR,
                    error: `There was a problem uploading photo: ${error.message}`,
                }, HttpStatus.INTERNAL_SERVER_ERROR)
            )
            //}
        }
    }

    /**
     * Get information about user photo
     * @param userId 
     */
    async getPhotoInfo(userId: number): Promise<{ fileName: string, mimeType: string }> {
        try {
            /* Below is not working. .select has a problem with case sensitivity
            return await this.userRepository.createQueryBuilder("user")
                .select(["user.photo AS fileName", "user.photoMimeType AS mimeType"])
                .where("id = :userId", { userId })
                .cache(1000) //1sec by default. You can change the value
                .execute();
                */
            const user: User = await this.userRepository.findOne(userId)
            return { fileName: user.photo, mimeType: user.photoMimeType }
        } catch (error) {
            throw new HttpException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                error: `There was a problem with getting user photo info: ${error.message}`,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }

    async getUserPhoto(userId: number, reply: Reply) {
        const photoInfo = await this.getPhotoInfo(userId);
        let { fileName, mimeType } = photoInfo;
        //if fileName is not found, it means that there was no previous upload. Use generic avatar
        if (fileName == null || undefined) {

            fileName = "blankPhotoAvatar.png";//make sure that it exists
            mimeType = "image/png";
        }
        const filePath = `uploads/photos/${fileName}`;
        //read the file as stream and send out
        try {
            const stream = fs.createReadStream(filePath)
            reply.type(mimeType).send(stream);
        } catch (error) {
            reply.send(new HttpException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                error: `There was a problem with getting user photo info: ${error.message}`,
            }, HttpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    async findByPrimaryEmailAddress(primaryEmailAddress: string): Promise<User> {
        try {
            return await this.userRepository.createQueryBuilder("user")
                .leftJoinAndSelect("user.roles", "roles")
                .addSelect("user.passwordHash")
                .where("user.primaryEmailAddress = :primaryEmailAddress", { primaryEmailAddress })
                .getOne();
        } catch (error) {
            throw new HttpException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                error: `There was a problem with getting user: ${error.message}`,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }

    async findByConfirmedPrimaryEmailAddress(primaryEmailAddress: string): Promise<User> {
        try {
            return await this.userRepository.createQueryBuilder("user")
                .where("user.primaryEmailAddress = :primaryEmailAddress", { primaryEmailAddress })
                .andWhere("user.isPrimaryEmailAddressVerified = :isPrimaryEmailAddressVerified", { isPrimaryEmailAddressVerified: true })
                .getOne();
        } catch (error) {
            throw new HttpException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                error: `There was a problem with getting user: ${error.message}`,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }

    async findByResetPasswordToken(resetPasswordToken: string): Promise<User> {
        try {
            return await this.userRepository.createQueryBuilder("user")
                .where("user.resetPasswordToken = :resetPasswordToken", { resetPasswordToken })
                .getOne();
        } catch (error) {
            throw new HttpException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                error: `There was a problem with getting user: ${error.message}`,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async findByPrimaryEmailVerificationToken(primaryEmailVerificationToken: string): Promise<User> {
        try {
            return await this.userRepository.createQueryBuilder("user")
                .where("user.primaryEmailVerificationToken = :primaryEmailVerificationToken", { primaryEmailVerificationToken })
                .getOne();
        } catch (error) {
            throw new HttpException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                error: `There was a problem with getting user: ${error.message}`,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async findByBackupEmailVerificationToken(backupEmailVerificationToken: string): Promise<User> {
        try {
            return await this.userRepository.createQueryBuilder("user")
                .where("user.backupEmailVerificationToken = :backupEmailVerificationToken", { backupEmailVerificationToken })
                .getOne();
        } catch (error) {
            throw new HttpException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                error: `There was a problem with getting user: ${error.message}`,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async findById(id: number): Promise<User> {
        try {
            return await this.userRepository.createQueryBuilder("user")
                .addSelect("user.refreshTokenHash")
                .leftJoinAndSelect("user.roles", "roles")
                .where("user.id = :id", { id })
                .getOne();
        } catch (error) {
            throw new HttpException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                error: `There was a problem with getting user: ${error.message}`,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async findByFacebookId(id: number): Promise<User> {
        try {
            return await this.userRepository.createQueryBuilder("user")
                .addSelect("user.refreshTokenHash")
                .leftJoinAndSelect("user.roles", "roles")
                .leftJoinAndSelect("user.facebookProfile", "facebookProfile")
                .where("facebookProfile.facebookId = :id", { id })
                .getOne();
        } catch (error) {
            throw new HttpException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                error: `There was a problem with getting user: ${error.message}`,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }



    /**
     * This service is for handling password reset requests.
     * In principle, it should be called via the user controller endpoint reset-password-request, from the login page under auth module
     * The login page should handle the notification response as well, via ajax, just like reset-password handles its notification response via ajax
     * It uses randomBytes from crypto module to generate a unique token that will be sent to the user in 
     * a URL, by email. The user has to click on that URL with the right token, to be allowed to change the password
     * For sending emails, nodemailer installation (npm install nodemailer @types/nodemailer) is required.
     * 
     * @param email 
     */
    async resetPasswordRequest(email: string, req: Request): Promise<GenericBulmaNotificationResponseDto> {
        try {
            const user = await this.findByPrimaryEmailAddress(email);
            //console.log(email);
            if (user) {
                //generate the token
                randomBytes(256, async (error, buf) => {
                    if (error)
                        throw error; //strange. the catch part below will handle it
                    const token = buf.toString('hex');
                    //console.log(token);

                    //success. Continue with email containing reset message with token
                    user.resetPasswordToken = token;
                    user.resetPasswordExpiration = new Date(Date.now() + PASSWORD_RESET_EXPIRATION);
                    //save the updated user
                    await this.userRepository.save(user);

                    //construct and send email using nodemailer
                    const globalPrefixUrl = USE_API_VERSION_IN_URL ? `/${API_VERSION}` : '';
                    const url = `${req.protocol || PROTOCOL}://${req.hostname}${globalPrefixUrl}/users/reset-password/${token}`;
                    const mailText = resetPasswordMailOptionSettings.textTemplate.replace('{url}', url);

                    //console.log(mailText);

                    //mailOptions
                    //console.log(user.primaryEmailAddress)
                    const mailOptions: SendMailOptions = {
                        to: user.primaryEmailAddress,
                        from: resetPasswordMailOptionSettings.from,
                        subject: resetPasswordMailOptionSettings.subject,
                        text: mailText,
                    };


                    //send mail

                    smtpTransportGmail.sendMail(mailOptions, async (error: Error) => {
                        //if (error)
                        //    throw error; //throw error that will be caught at the end?
                        if (error)
                            console.log(error);
                    });


                })
                //console.log('message successfully sent')
                return {
                    notificationClass: "is-success",
                    notificationMessage: `If your email ${email} is found, you will receive email shortly for password reset`
                };
            } else {//email address not found
                //log bad request here and still respond
                return {
                    notificationClass: "is-success",
                    notificationMessage: `If your email ${email} is found, you will receive email shortly for password reset`
                };
            }
        } catch (error) {
            throw new HttpException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                error: `Problem with password reset request: ${error.message}`,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }

    /**
     * Called to reset password from email sent with token
     * @param token 
     * @param newPassword 
     * @param reply 
     */
    /* Had problem with combining reply.view and return. Using only reply.view for now. See below
    async resetPassword(token: string, newPassword: string, reply: Reply): Promise<any> {
        try {
            const user = await this.findByResetPasswordToken(token);
            if (user) {
                if (user.resetPasswordExpiration.valueOf() > Date.now()) {
                    //token has not expired, proceed!
                    if (newPassword) {
                        //proceed with saving
                        //hash the password in dto
                        await bcrypt.hash(newPassword, 10).then((hash: string) => {
                            user.passwordHash = hash;
                        })
                        user.resetPasswordToken = null;//clear
                        //save
                        await this.userRepository.save(user);
                        //consider sending mail here to the user to say that password has recently been reset
                        
                        return {
                            notificationClass: "is-success",
                            notificationMessage: "New password successfully saved"
                        };//only send this when form has already been sent
                    } else {//no newPassword yet. In principle, user should be sent back to form for entering new password.
                        const globalPrefixUrl = USE_API_VERSION_IN_URL ? `/${API_VERSION}` : '';
                        const returnUrl = `${globalPrefixUrl}/users/reset-password/${token}`;
                        //await reply.send(, {sendForm: true, token: token});//send form with token for submit url
                        reply.view('users/reset-password.html', { title: 'SGVI-1 Mini CMS - Reset Password', sendForm: true, returnUrl: returnUrl })
                    }
                } else {//expired token
                    reply.view('users/reset-password.html', { title: 'SGVI-1 Mini CMS - Reset Password', success: false, error: { message: 'Invalid token', detail: "The token sent has expired" } });
                }
            } else {//user with the sent token not found
                reply.view('users/reset-password.html', { title: 'SGVI-1 Mini CMS - Reset Password', success: false, error: { message: "Invalid token", detail: "No valid token was sent" } });
            }
        } catch (error) {
            throw new HttpException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                error: `Problem with password reset request: ${error.message}`,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
*/
    async resetPassword(token: string, newPassword: string, reply: Reply): Promise<any> {
        try {
            const user = await this.findByResetPasswordToken(token);
            if (user) {
                if (user.resetPasswordExpiration.valueOf() > Date.now()) {
                    //token has not expired, proceed!
                    if (newPassword) {
                        //proceed with saving
                        //hash the password in dto
                        await bcrypt.hash(newPassword, 10).then((hash: string) => {
                            user.passwordHash = hash;
                        })
                        user.resetPasswordToken = null;//clear
                        //save
                        await this.userRepository.save(user);
                        //consider sending mail here to the user to say that password has recently been reset

                        reply.view('users/reset-password.html',
                            {
                                title: 'SGVI-1 Mini CMS - Reset Password',
                                sendForm: false,
                                notificationVisibility: "",
                                notificationClass: "is-success",
                                notificationMessage: "New password successfully saved"
                            })

                    } else {//no newPassword yet. In principle, user should be sent back to form for entering new password.
                        const globalPrefixUrl = USE_API_VERSION_IN_URL ? `/${API_VERSION}` : '';
                        const returnUrl = `${globalPrefixUrl}/users/reset-password/${token}`;
                        //await reply.send(, {sendForm: true, token: token});//send form with token for submit url
                        reply.view('users/reset-password.html',
                            {
                                title: 'SGVI-1 Mini CMS - Reset Password',
                                sendForm: true,
                                returnUrl: returnUrl,
                                notificationVisibility: "is-hidden"
                            })
                    }
                } else {//expired token
                    reply.view('users/reset-password.html',
                        {
                            title: 'SGVI-1 Mini CMS - Reset Password',
                            sendForm: false,
                            notificationVisibility: "",
                            notificationClass: "is-danger",
                            notificationMessage: "Invalid token: expired"
                        });
                }
            } else {//user with the sent token not found
                reply.view('users/reset-password.html',
                    {
                        title: 'SGVI-1 Mini CMS - Reset Password',
                        sendForm: false,
                        notificationVisibility: "",
                        notificationClass: "is-danger",
                        notificationMessage: "Invalid token: not found"
                    });
            }
        } catch (error) {
            throw new HttpException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                error: `Problem with password reset request: ${error.message}`,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * 
     * @param email This may be sent if called after user has just been added in usersService
     * @param userId This may be sent from controller
     * @param primary 
     * @param backup 
     */

    async confirmEmailRequest(email: string = null, userId: number = null, primary: boolean, req: Request) {
        try {
            let user: User = null;
            if (userId != null) {
                user = await this.userRepository.findOne(userId);
            } else {
                user = primary ? await this.userRepository.findOne({ where: { primaryEmailAddress: email } }) : await this.userRepository.findOne({ where: { backupEmailAddress: email } });
            }
            if (user != null) {
                //generate the token (for primary or backup). See resetPasswordRequest above for ideas
                randomBytes(256, async (error, buf) => {
                    if (error)
                        throw error; //strange. the catch part below will handle it
                    const token = buf.toString('hex');

                    //success. Continue with email containing reset message with token
                    primary ? user.primaryEmailVerificationToken = token : user.backupEmailVerificationToken = token;
                    user.emailVerificationTokenExpiration = new Date(Date.now() + EMAIL_VERIFICATION_EXPIRATION);
                    //save the updated user
                    await this.userRepository.save(user);

                    //construct and send email using nodemailer
                    const globalPrefixUrl = USE_API_VERSION_IN_URL ? `/${API_VERSION}` : '';
                    const url = primary ? `${req.protocol || PROTOCOL}://${req.hostname}${globalPrefixUrl}/users/confirm-primary-email/${token}` : `${req.protocol}://${req.hostname}${globalPrefixUrl}/users/confirm-backup-email/${token}`;
                    const mailText = confirmEmailMailOptionSettings.textTemplate.replace('{url}', url);

                    //mailOptions
                    const mailOptions: SendMailOptions = {
                        to: primary ? user.primaryEmailAddress : user.backupEmailAddress,
                        from: confirmEmailMailOptionSettings.from,
                        subject: confirmEmailMailOptionSettings.subject,
                        text: mailText,
                    };

                    //send mail
                    smtpTransportGmail.sendMail(mailOptions, async (error: Error) => {
                        //if (error)
                        //    throw error; //throw error that will be caught at the end?
                        if (error)
                            console.log(error)
                    });
                });
                return {
                    notificationClass: "is-info",
                    notificationMessage: `If valid user, you will receive email shortly for email address confirmation`
                };
            } else {//email address or user not found
                //log bad request here and still respond
                return {
                    notificationClass: "is-info",
                    notificationMessage: `If valid user, you will receive email shortly for email addres confirmation`
                };
            }
        } catch (error) {
            throw new HttpException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                error: `Problem sending email address confirmation: ${error.message}`,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async confirmEmail(token: string, primary: boolean, reply: Reply) {
        try {
            //find user by token (primary or backup)
            let user: User = null;
            primary ? user = await this.findByPrimaryEmailVerificationToken(token) : await this.findByBackupEmailVerificationToken(token);
            if (user) {
                if (user.emailVerificationTokenExpiration.valueOf() > Date.now()) {
                    if (primary) {
                        user.isPrimaryEmailAddressVerified = true;
                        user.primaryEmailVerificationToken = null;
                    } else {
                        user.isBackupEmailAddressVerified = true;
                        user.backupEmailVerificationToken = null;
                    }
                    user.emailVerificationTokenExpiration = null;

                    await this.userRepository.save(user);

                    reply.view('users/confirm-email-feedback.html', { title: 'SGVI-1 Mini CMS - Confirm Email', notificationClass: "is-success", notificationMessage: "Email confirmed!" });
                } else {//expired token
                    reply.view('users/confirm-email-feedback.html', { title: 'SGVI-1 Mini CMS - Confirm Email', notificationClass: "is-danger", notificationMessage: "Problem confirming email. Token has expired!" });
                }
            } else {//user with the sent token not found
                reply.view('users/confirm-email-feedback.html', { title: 'SGVI-1 Mini CMS - Confirm Email', notificationClass: "is-danger", notificationMessage: "Problem confirming email" });
            }

        } catch (error) {
            reply.view('users/confirm-email-feedback.html', { title: 'SGVI-1 Mini CMS - Confirm Email', notificationClass: "is-danger", notificationMessage: "Problem confirming email!" });
        }
    }

    /**
     * Invoked to setRefreshTokenHash after successful login.
     * @param refreshToken 
     * @param userId 
     */
    async setRefreshTokenHash(refreshToken: string, userId: number) {
        const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
        await this.userRepository.update(userId, {
            refreshTokenHash
        });
    }

    async addFacebookProfile(userId: number, facebookProfile: FacebookProfileDto): Promise<User> {

        try {
            await this.userRepository.createQueryBuilder()
                .relation(User, "facebookProfile")
                .of(userId)
                .set(facebookProfile)

            //return the user modified
            return await this.userRepository.findOne(userId, { relations: ['facebookProfile', 'roles'] });

        } catch (error) {
            if (error && error.code === PG_UNIQUE_CONSTRAINT_VIOLATION) {
                throw new HttpException({
                    status: HttpStatus.BAD_REQUEST,
                    error: `There was a problem adding facebookProfile to user: ${error.message}`,
                }, HttpStatus.BAD_REQUEST)
            } else {
                throw new HttpException({
                    status: HttpStatus.INTERNAL_SERVER_ERROR,
                    error: `There was a problem with adding facebookProfile to user: ${error.message}`,
                }, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }

    }
}

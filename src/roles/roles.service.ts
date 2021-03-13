import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PG_UNIQUE_CONSTRAINT_VIOLATION } from 'src/global/error.codes';
import { User } from 'src/users/models/user.entity';
import { DeleteResult, InsertResult, Repository, UpdateResult } from 'typeorm';
import { CreateRoleDto } from './dto/create/create-role.dto';
import { UpdateRoleDto } from './dto/update/update-role.dto';
import { Role } from './models/role.entity';
import { Request } from 'src/global/custom.interfaces';

@Injectable()
export class RolesService {

    constructor(
        @InjectRepository(User) private userRepository: Repository<User>,
        @InjectRepository(Role) private roleRepository: Repository<Role>
    ) { }

    async create(createRoleDto: CreateRoleDto, req: Request): Promise<Role> {
        try {
            const newRole = this.roleRepository.create(createRoleDto);
            return await this.roleRepository.save(newRole);
        } catch (error) {
            if (error && error.code === PG_UNIQUE_CONSTRAINT_VIOLATION) {
                throw new HttpException({
                    status: HttpStatus.BAD_REQUEST,
                    error: `There was a problem with role creation: : ${error.message}`,
                }, HttpStatus.BAD_REQUEST)
            } else {
                throw new HttpException({
                    status: HttpStatus.INTERNAL_SERVER_ERROR,
                    error: `There was a problem with role creation: ${error.message}`,
                }, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }

    //insert using query builder - more efficient than save. Can be used for single or bulk save. See https://github.com/typeorm/typeorm/blob/master/docs/insert-query-builder.md
    async insertRoles(roles: CreateRoleDto[], req: Request): Promise<InsertResult> {//roles is an array of objects
        try {
            const insertResult = await this.roleRepository.createQueryBuilder()
                .insert()
                .into(Role)
                .values(roles)
                .execute();

            return insertResult;

        } catch (error) {
            if (error && error.code === PG_UNIQUE_CONSTRAINT_VIOLATION) {
                throw new HttpException({
                    status: HttpStatus.BAD_REQUEST,
                    error: `There was a problem with role(s) insertion: : ${error.message}`,
                }, HttpStatus.BAD_REQUEST)
            } else {
                throw new HttpException({
                    status: HttpStatus.INTERNAL_SERVER_ERROR,
                    error: `There was a problem with role(s) insertion: ${error.message}`,
                }, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }

    }
    /*UPDATE section*/

    async update(id: number, role: UpdateRoleDto): Promise<UpdateResult> {
        try {
            return await this.roleRepository.update(id, { ...role })
        } catch (error) {
            if (error && error.code === PG_UNIQUE_CONSTRAINT_VIOLATION) {
                throw new HttpException({
                    status: HttpStatus.BAD_REQUEST,
                    error: `There was a problem updating role data: : ${error.message}`,
                }, HttpStatus.BAD_REQUEST)
            } else {
                throw new HttpException({
                    status: HttpStatus.INTERNAL_SERVER_ERROR,
                    error: `There was a problem updating role data: ${error.message}`,
                }, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }

    /**
     * 
     * @param role 
     * No partial update allowed here. Saves the role object supplied
     */
    async save(role: Role): Promise<Role> {
        try {
            return await this.roleRepository.save(role)
        } catch (error) {
            if (error && error.code === PG_UNIQUE_CONSTRAINT_VIOLATION) {
                throw new HttpException({
                    status: HttpStatus.BAD_REQUEST,
                    error: `There was a problem updating role: : ${error.message}`,
                }, HttpStatus.BAD_REQUEST)
            } else {
                throw new HttpException({
                    status: HttpStatus.INTERNAL_SERVER_ERROR,
                    error: `There was a problem updating role: ${error.message}`,
                }, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }

    //Let's also do partial update using query builder. Also more efficient
    async updateRole(roleId: number, updateRoleDto: UpdateRoleDto): Promise<UpdateResult> {
        try {
            return await this.roleRepository.createQueryBuilder()
                .update(Role)
                .set({ ...updateRoleDto })
                .where("id = :id", { id: roleId })
                .execute();
        } catch (error) {
            if (error && error.code === PG_UNIQUE_CONSTRAINT_VIOLATION) {
                throw new HttpException({
                    status: HttpStatus.BAD_REQUEST,
                    error: `There was a problem updating role: : ${error.message}`,
                }, HttpStatus.BAD_REQUEST)
            } else {
                throw new HttpException({
                    status: HttpStatus.INTERNAL_SERVER_ERROR,
                    error: `There was a problem updating role: ${error.message}`,
                }, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }


    /* DELETE section */

    async delete(id: number): Promise<void> {
        try {
            await this.roleRepository.delete(id);
        } catch (error) {
            throw new HttpException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                error: `There was a problem deleting role data: ${error.message}`,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    //query builder equivalent of delete shown above
    async deleteRole(roleId: number): Promise<DeleteResult> {
        try {
            return await this.roleRepository.createQueryBuilder()
                .delete()
                .from(Role)
                .where("id = :id", { id: roleId })
                .execute();
        } catch (error) {
            throw new HttpException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                error: `There was a problem deleting role data: ${error.message}`,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * 
     * @param role 
     * Remove the Role specifed. Returns Role removed.
     */
    async remove(role: Role): Promise<Role> {
        try {
            return await this.roleRepository.remove(role);
        } catch (error) {
            throw new HttpException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                error: `There was a problem deleting role data: ${error.message}`,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    /** READ section
     */
    /**
     * You can set options e.g. fields, relations to be returned etc. See https://typeorm.io/#/find-options
     */
    async findAllWithOptions(findOptions: string): Promise<[Role[], number]> {
        try {
            return await this.roleRepository.findAndCount(JSON.parse(findOptions));
        } catch (error) {
            throw new HttpException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                error: `There was a problem accessing roles data: ${error.message}`,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async findAll(): Promise<[Role[], number]> {
        try {
            return await this.roleRepository.findAndCount();
        } catch (error) {
            throw new HttpException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                error: `There was a problem accessing roles data: ${error.message}`,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * 
     * @param id 
     * find one by id
     */
    async findOne(id: number): Promise<Role> {
        try {
            return await this.roleRepository.findOne(id);
        } catch (error) {
            throw new HttpException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                error: `There was a problem accessing role data: ${error.message}`,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }

    /*Let's work on functions to set/add and unset/remove relations. set/unset applies to x-to-one and add/remove applies to x-to-many */
    //1. Users
    async addUserById(roleId: number, userId: number): Promise<Role> {
        try {
            await this.roleRepository.createQueryBuilder()
                .relation(Role, "users")
                .of(roleId)
                .add(userId)
            //return the role just updated.
            return  await this.roleRepository.findOne(roleId);

        } catch (error) {
            if (error && error.code === PG_UNIQUE_CONSTRAINT_VIOLATION) {
                throw new HttpException({
                    status: HttpStatus.BAD_REQUEST,
                    error: `There was a problem adding user to role: ${error.message}`,
                }, HttpStatus.BAD_REQUEST)
            } else {
                throw new HttpException({
                    status: HttpStatus.INTERNAL_SERVER_ERROR,
                    error: `There was a problem with adding user to role: ${error.message}`,
                }, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }

    async addUsersById(roleId: number, userIds: number[]): Promise<void> {
        try {
            return await this.roleRepository.createQueryBuilder()
                .relation(Role, "users")
                .of(roleId)
                .add(userIds)
        } catch (error) {
            if (error && error.code === PG_UNIQUE_CONSTRAINT_VIOLATION) {
                throw new HttpException({
                    status: HttpStatus.BAD_REQUEST,
                    error: `There was a problem adding users to role: ${error.message}`,
                }, HttpStatus.BAD_REQUEST)
            } else {
                throw new HttpException({
                    status: HttpStatus.INTERNAL_SERVER_ERROR,
                    error: `There was a problem with adding users to role: ${error.message}`,
                }, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }

    async removeUserById(roleId: number, userId: number): Promise<void> {
        try {
            return await this.roleRepository.createQueryBuilder()
                .relation(Role, "users")
                .of(roleId)
                .remove(userId)
        } catch (error) {
            throw new HttpException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                error: `There was a problem removing user from role: ${error.message}`,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async removeUsersById(roleId: number, userIds: number[]): Promise<void> {
        try {
            return await this.roleRepository.createQueryBuilder()
                .relation(Role, "users")
                .of(roleId)
                .remove(userIds)
        } catch (error) {
            throw new HttpException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                error: `There was a problem removing users from role: ${error.message}`,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


}

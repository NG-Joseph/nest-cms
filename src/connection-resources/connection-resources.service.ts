import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PG_UNIQUE_CONSTRAINT_VIOLATION } from 'src/global/error.codes';
import { Tenant } from 'src/tenants/models/tenant.entity';
import { DeleteResult, InsertResult, Repository, UpdateResult } from 'typeorm';
import { CreateConnectionResourceDto } from './dto/create/create-connection-resource.dto';
import { UpdateConnectionResourceDto } from './dto/update/update-connection-resource.dto';
import { ConnectionResource } from './models/connection-resource.entity';
import { Request } from 'src/global/custom.interfaces';

@Injectable()
export class ConnectionResourcesService {

    constructor(
        @InjectRepository(ConnectionResource) private connectionResourceRepository: Repository<ConnectionResource>,
        @InjectRepository(Tenant) private tenantRepository: Repository<Tenant>
    ) { }

    async create(createConnectionResourceDto: CreateConnectionResourceDto, req: Request): Promise<ConnectionResource> {
        try {
            const  newConnectionResource = this.connectionResourceRepository.create(createConnectionResourceDto);
            return await this.connectionResourceRepository.save(newConnectionResource);
        } catch (error) {
            if (error && error.code === PG_UNIQUE_CONSTRAINT_VIOLATION) {
                throw new HttpException({
                    status: HttpStatus.BAD_REQUEST,
                    error: `There was a problem with connection resource creation: : ${error.message}`,
                }, HttpStatus.BAD_REQUEST)
            } else {
                throw new HttpException({
                    status: HttpStatus.INTERNAL_SERVER_ERROR,
                    error: `There was a problem with connection resource creation: ${error.message}`,
                }, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }

    //insert using query builder - more efficient than save. Can be used for single or bulk save. See https://github.com/typeorm/typeorm/blob/master/docs/insert-query-builder.md
    async insertConnectionResources(connectionResources: CreateConnectionResourceDto[], req: Request): Promise<InsertResult> {//connection resources is an array of objects
        try {
            const insertResult = await this.connectionResourceRepository.createQueryBuilder()
                .insert()
                .into(ConnectionResource)
                .values(connectionResources)
                .execute();

            return insertResult;

        } catch (error) {
            if (error && error.code === PG_UNIQUE_CONSTRAINT_VIOLATION) {
                throw new HttpException({
                    status: HttpStatus.BAD_REQUEST,
                    error: `There was a problem with connection resource(s) insertion: : ${error.message}`,
                }, HttpStatus.BAD_REQUEST)
            } else {
                throw new HttpException({
                    status: HttpStatus.INTERNAL_SERVER_ERROR,
                    error: `There was a problem with connection resource(s) insertion: ${error.message}`,
                }, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }

    }
    /*UPDATE section*/

    async update(id: number, connectionResource: UpdateConnectionResourceDto): Promise<UpdateResult> {
        try {
            return await this.connectionResourceRepository.update(id, { ...connectionResource })
        } catch (error) {
            if (error && error.code === PG_UNIQUE_CONSTRAINT_VIOLATION) {
                throw new HttpException({
                    status: HttpStatus.BAD_REQUEST,
                    error: `There was a problem updating connection resource data: : ${error.message}`,
                }, HttpStatus.BAD_REQUEST)
            } else {
                throw new HttpException({
                    status: HttpStatus.INTERNAL_SERVER_ERROR,
                    error: `There was a problem updating connection resource data: ${error.message}`,
                }, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }

    /**
     * 
     * @param connectionResource 
     * No partial update allowed here. Saves the role object supplied
     */
    async save(connectionResource: ConnectionResource): Promise<ConnectionResource> {
        try {
            return await this.connectionResourceRepository.save(connectionResource)
        } catch (error) {
            if (error && error.code === PG_UNIQUE_CONSTRAINT_VIOLATION) {
                throw new HttpException({
                    status: HttpStatus.BAD_REQUEST,
                    error: `There was a problem updating connection resource: : ${error.message}`,
                }, HttpStatus.BAD_REQUEST)
            } else {
                throw new HttpException({
                    status: HttpStatus.INTERNAL_SERVER_ERROR,
                    error: `There was a problem updating connection resource: ${error.message}`,
                }, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }

    //Let's also do partial update using query builder. Also more efficient
    async updateConnectionResource(connectionResourceId: number, updateConnectionResourceDto: UpdateConnectionResourceDto): Promise<UpdateResult> {
        try {
            return await this.connectionResourceRepository.createQueryBuilder()
                .update(ConnectionResource)
                .set({ ...updateConnectionResourceDto })
                .where("id = :id", { id: connectionResourceId })
                .execute();
        } catch (error) {
            if (error && error.code === PG_UNIQUE_CONSTRAINT_VIOLATION) {
                throw new HttpException({
                    status: HttpStatus.BAD_REQUEST,
                    error: `There was a problem updating connection resource: : ${error.message}`,
                }, HttpStatus.BAD_REQUEST)
            } else {
                throw new HttpException({
                    status: HttpStatus.INTERNAL_SERVER_ERROR,
                    error: `There was a problem updating connection resource: ${error.message}`,
                }, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }


    /* DELETE section */

    async delete(id: number): Promise<void> {
        try {
            await this.connectionResourceRepository.delete(id);
        } catch (error) {
            throw new HttpException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                error: `There was a problem deleting connection resource data: ${error.message}`,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    //query builder equivalent of delete shown above
    async deleteConnectionResource(connectionResourceId: number): Promise<DeleteResult> {
        try {
            return await this.connectionResourceRepository.createQueryBuilder()
                .delete()
                .from(ConnectionResource)
                .where("id = :id", { id: connectionResourceId })
                .execute();
        } catch (error) {
            throw new HttpException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                error: `There was a problem deleting connection resource data: ${error.message}`,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * 
     * @param connectionResource 
     * Remove the Role specifed. Returns Role removed.
     */
    async remove(connectionResource: ConnectionResource): Promise<ConnectionResource> {
        try {
            return await this.connectionResourceRepository.remove(connectionResource);
        } catch (error) {
            throw new HttpException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                error: `There was a problem deleting connection resource data: ${error.message}`,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    /** READ section
     */
    /**
     * You can set options e.g. fields, relations to be returned etc. See https://typeorm.io/#/find-options
     */
    async findAllWithOptions(findOptions: string): Promise<[ConnectionResource[], number]> {
        try {
            return await this.connectionResourceRepository.findAndCount(JSON.parse(findOptions));
        } catch (error) {
            throw new HttpException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                error: `There was a problem accessing connection resources data: ${error.message}`,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async findAll(): Promise<[ConnectionResource[], number]> {
        try {
            return await this.connectionResourceRepository.findAndCount();
        } catch (error) {
            throw new HttpException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                error: `There was a problem accessing connection resources data: ${error.message}`,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * 
     * @param id 
     * find one by id
     */
    async findOne(id: number): Promise<ConnectionResource> {
        try {
            return await this.connectionResourceRepository.findOne(id);
        } catch (error) {
            throw new HttpException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                error: `There was a problem accessing connection resource data: ${error.message}`,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }

    /*Let's work on functions to set/add and unset/remove relations. set/unset applies to x-to-one and add/remove applies to x-to-many */
    //1. Tenants
    async setTenantById(connectionResourseId: number, tenantId: number): Promise<void> {
        try {
            return await this.connectionResourceRepository.createQueryBuilder()
                .relation(ConnectionResource, "tenant")
                .of(connectionResourseId)
                .set(tenantId)
        } catch (error) {
            throw new HttpException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                error: `There was a problem setting tenant for connection resource: ${error.message}`,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async unsetTenantById(connectionResourceId: number): Promise<void> {
        try {
            return await this.connectionResourceRepository.createQueryBuilder()
                .relation(ConnectionResource, "tenant")
                .of(connectionResourceId)
                .set(null)
        } catch (error) {
            throw new HttpException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                error: `There was a problem unsetting tenant for connection resource: ${error.message}`,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

}

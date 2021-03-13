import { BaseAbstractEntity } from "../../global/base-abstract.entity";
import { Tenant } from "../../tenants/models/tenant.entity";
import { Column, Entity, Generated, Index, JoinColumn, OneToOne } from "typeorm";

@Entity()
@Index(["name", "platform"], {unique: true})//can't have two connections of same name on same platform
export class ConnectionResource extends BaseAbstractEntity{
    
    @Generated("uuid")
    uuid: string;

    @Column()//used as connection name in SaaS platform
    name: string

    @Column()
    description: string

    @Column({default: false})
    active: boolean

    /**
     * Which platform is the tenant assigned to? e.g. p1.peakharmony.com. 
     * There will then be a 301 redirect to the platform from nginx 
     * for requests coming to the tenant's defaultURLSlug or customURLSlug
     */
    @Column()
    platform: string

    @Column("simple-json")
    connectionProperties: {
        type: string,
        host: string,
        port: string,
        username: string,
        password: string,
        database: string,
        schema: string
      }; //for database connection

    @Column()
    rootFileSystem: string; //root of filesystem for uploads for the tenant. It could be a network file system.

    /**
     * Allocation of connection to tenant: one-to-one
     */
    @JoinColumn()
    @OneToOne(type => Tenant, tenant => tenant.connectionResource)
    tenant: Tenant
}
import { TenantAccountOfficerRole } from "src/global/app.settings";
import { BaseAbstractEntity } from "src/global/base-abstract.entity";
import { User } from "src/users/models/user.entity";
import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Tenant } from "./tenant.entity";

/**
 * This entity is a joiner for tenant and user (account officers). For each join, there are roles associated
 */
@Entity()
@Index(["tenant", "user"], { unique: true }) //a user should not appear more than once for a given tenant
export class TenantAccountOfficer extends BaseAbstractEntity{

    @ManyToOne(type => Tenant, tenant => tenant.tenantAccountOfficers)
    @JoinColumn({name: "tenantId"})
    tenant: Tenant

    @ManyToOne(type => User, user => user.accountOfficerForWhichTenants)
    @JoinColumn({name: "userId"})
    user: User

    /**
     * Denormalizing roles  e.g. manager, tech-support, etc.
     */
    @Column("simple-array")
    roles: TenantAccountOfficerRole[]

}
import { TenantTeamRole } from "../../global/app.settings";
import { BaseAbstractEntity } from "../../global/base-abstract.entity";
import { User } from "../../users/models/user.entity";
import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Tenant } from "./tenant.entity";

/**
 * This entity is a joiner for tenant and user (team). For each join, there are roles associated
 */
@Entity()
@Index(["tenant", "user"], { unique: true }) //a user should not appear more than once for a given tenant
export class TenantTeam extends BaseAbstractEntity{

    @ManyToOne(type => Tenant, tenant => tenant.teamMembers)
    @JoinColumn({name: "tenantId"})
    tenant: Tenant

    @ManyToOne(type => User, user => user.tenantTeamMemberships)
    @JoinColumn({name: "userId"})
    user: User

    /**
     * Denormalizing roles  e.g. admin, marketing, content-manager, etc.
     */
    @Column("simple-array")
    roles: TenantTeamRole[]

    /**
     * Denormalizing tenant unique name for efficiency of access for display on the client
     */
    @Column()
    tenantUniqueName: string

     /**
     * Denormalizing tenant unique id for efficiency of access on the client
     */
    @Column()
    tenantUniqueId: number

}
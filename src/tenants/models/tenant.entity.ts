import { BaseAbstractEntity } from "../../global/base-abstract.entity";
import { Column, Entity, Generated, Index, ManyToMany, ManyToOne, OneToMany, OneToOne } from "typeorm";
import { Billing } from "../modules/billings/models/billing.entity";
import { CustomTheme } from "./custom-theme.entity";
import { Theme } from "../modules/themes/models/theme.entity";
import { User } from "../../users/models/user.entity";
import { TenantStatus } from "../../global/custom.interfaces";
import { TenantTeam } from "./tenant-team";
import { TenantAccountOfficer } from "./tenant-account-officer";
import { ConnectionResource } from "../../connection-resources/models/connection-resource.entity";


@Entity()
export class Tenant extends BaseAbstractEntity{
    
    @Generated("uuid")
    uuid: string;

    @Column({unique: true})//used for default URL Slug
    @Index()
    uniqueName: string

    @Column()
    address: string

    @Column({nullable: true})
    moreInfo: string

    @Column({nullable: true})
    logo: string; //logo file location. Use stream to send

    @Column({ nullable: true })
    logoMimeType: string; //save the encoding of uploaded file for content-type use for reply.type as shown above

    @Column({default: false})
    active: boolean

    @Column()
    dateOfRegistration: Date

    @Column({type: 'enum', enum: TenantStatus, default: TenantStatus[TenantStatus.A]})
    status: TenantStatus;

    @ManyToOne(type => User, user => user.primaryContactForWhichTenants, {cascade: true, onUpdate: "CASCADE"})
    primaryContact: User

    @OneToOne(type => CustomTheme, customTheme => customTheme.tenant, {cascade: true})
    customTheme: CustomTheme

    //a user can be a team member of multiple tenants
    @OneToMany(type => TenantTeam, tenantTeam => tenantTeam.tenant, {cascade: true})
    teamMembers: TenantTeam[] //notice the array here

    @OneToMany(type => TenantAccountOfficer, tenantAccountOfficer => tenantAccountOfficer.tenant, {cascade: true})
    tenantAccountOfficers: TenantAccountOfficer[] //notice the array here
    /**
     * Below is used to determine if the tenant has a unique schema as per multitenancy pattern.
     */
    @Column({default: true})
    uniqueSchema: boolean

    //Could not set this as both nullable and unique. With two nulls, there will be constraint violation. Solution is to handle check separately
    @Column({unique: true, nullable: true})
    customURLSlug: string

    @ManyToMany(type => Theme, theme => theme.tenants)
    themes: Theme[]

    @OneToMany(type => Billing, billing => billing.tenant)
    billings: Billing[] //notice the array here

    //Connection for this tenant
    @OneToOne(type => ConnectionResource, connectionResource => connectionResource.tenant)
    connectionResource: ConnectionResource;

}
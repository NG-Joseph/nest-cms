import { BaseAbstractEntity } from "src/global/base-abstract.entity";
import { Column, Entity, Generated, JoinColumn, ManyToOne } from "typeorm";
import { Tenant } from "../../../models/tenant.entity";

@Entity()
export class Billing extends BaseAbstractEntity{

    @Column()
    @Generated("uuid")
    uuid: string

    @Column({unique: true})
    code: string

    @Column()
    description: string

    @Column()
    type: string //could be a categorization.

    @JoinColumn()
    @ManyToOne(type => Tenant, tenant => tenant.billings)
    tenant: Tenant
}
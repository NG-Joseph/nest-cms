import { BaseAbstractEntity } from "src/global/base-abstract.entity";
import { Column, Entity, JoinTable, ManyToMany } from "typeorm";
import { Tenant } from "../../../models/tenant.entity";

@Entity()
export class Theme extends BaseAbstractEntity{

    @Column()
    name: string

    @Column()
    description: string
    
    @Column()
    properties: string
    
    @JoinTable()
    @ManyToMany(type => Tenant, tenant => tenant.themes)
    tenants: Tenant[]
}
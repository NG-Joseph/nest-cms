import { BaseAbstractEntity } from "src/global/base-abstract.entity";
import { Column, Entity, JoinColumn, OneToOne } from "typeorm";
import { Tenant } from "./tenant.entity";

@Entity()
export class CustomTheme extends BaseAbstractEntity{

    @Column()
    name: string

    @Column()
    description: string

    @Column("simple-json")
    properties: string

    @Column("simple-json", {nullable: true})
    bulmaProperties: {primaryColor: string, primaryBackground: string}
    
    @JoinColumn()
    @OneToOne(type => Tenant, tenant => tenant.customTheme, {onDelete: 'CASCADE'})
    tenant: Tenant

}
import { BaseAbstractEntity } from "src/global/base-abstract.entity";
import { Column, Entity, ManyToMany } from "typeorm";
import { User } from "../../users/models/user.entity";

@Entity()//You can change the table name
export class Role extends BaseAbstractEntity{//AuditColumns abstract class contains fields for audit info common to all tables

    @Column({unique: true})
    name: string;

    @Column({nullable: true})//setting primary to true here means that this is unique
    description: string;

    //define many-to-many relationship with user. See https://github.com/typeorm/typeorm/blob/master/docs/many-to-many-relations.md
    @ManyToMany(type => User, user => user.roles, {cascade: true, onDelete: 'CASCADE'})
    users: User[];

    @Column({default: true})
    landlord: boolean; //Is this a role that is unique to landlords

    //Todo permissions relationship for each role

}
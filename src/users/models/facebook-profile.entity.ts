import { BaseAbstractEntity } from "src/global/base-abstract.entity";
import { Column, Entity, Index, JoinColumn, OneToOne } from "typeorm";
import { User } from "./user.entity";

@Entity()
export class FacebookProfile extends BaseAbstractEntity {

    @JoinColumn()
    @OneToOne(type => User, user => user.facebookProfile, {onDelete: 'CASCADE'})
    user: User

    //const { id, displayName, photos, emails, gender, name, profileUrl} = profile;
    @Index()
    @Column({unique: true})
    facebookId: number

    @Column({nullable: true})
    displayName: string

    @Column("simple-array", {nullable: true})
    photos: {value: string}[]

    @Column("simple-array", {nullable: true})
    emails: {value: string, type?: string}[]

    @Column({nullable: true})
    gender: string

    @Column("simple-json", {nullable: true})
    name: {familyName: string, givenName: string}

    @Column()
    profileUrl: string

}
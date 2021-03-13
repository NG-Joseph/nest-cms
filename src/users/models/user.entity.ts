import { BaseAbstractEntity } from "../../global/base-abstract.entity";
import { Gender } from "../../global/custom.interfaces";
import { TenantAccountOfficer } from "../../tenants/models/tenant-account-officer";
import { TenantTeam } from "../../tenants/models/tenant-team";
import { Column, Entity, Index, JoinTable, ManyToMany, OneToMany, OneToOne } from "typeorm";
import { Role } from "../../roles/models/role.entity";
import { Tenant } from "../../tenants/models/tenant.entity";
import { Exclude } from "class-transformer/decorators";
import { FacebookProfile } from "./facebook-profile.entity";

@Entity()
export class User extends BaseAbstractEntity {

    @Column({ default: false })
    landlord: boolean; //Use this to immediately know users that are landlords. But cross-check with role as well for double security.

    @Column()
    firstName: string;

    @Column({ nullable: true })
    middleName: string;

    @Column()
    lastName: string;

    @Column({ nullable: true })
    commonName: string;

    @Column({ nullable: true })
    homeAddress: string;

    @Column({ type: 'enum', enum: Gender })
    gender: Gender;

    @Column({ nullable: true })
    dateOfBirth: Date;

    @Column({ nullable: true })
    nationality: string;

    @Column({ nullable: true })
    stateOfOrigin: string;

    @Column({ nullable: true })
    zip: string;

    /**
     * Plan for photo and other files to be served.
     * Have a global root URL for such files e.g. '/uploads-to-stream'. Could be associated with a network storage
     * Set up a controller endpoint e.g. @Get('/user/:uid/photos/:file')
     * For fastify, the controller should implement the handling e.g.
     * {
            const root = '/uploads-to-stream'
            const stream = fs.createReadStream(`${root}/user/${uid}/photos/${file}`)
            reply.type('image/png').send(stream) //Try https://github.com/mscdex/mmmagic for automatic detection of file mimetype
            //For uploads, send to the same folder above using the file url pattern. Store in database only the name of the file.
            //For fastify based upload tutorial, see https://medium.com/@427anuragsharma/upload-files-using-multipart-with-fastify-and-nestjs-3f74aafef331
            //on upload, save the encoding in photoFileEncoding field below. See https://github.com/fastify/fastify-multipart.   
            
                const data = await req.file()

                data.file // stream
                data.fields // other parsed parts
                data.fieldname
                data.filename
                data.encoding
                data.mimetype
                
        }
     */
    @Column({ nullable: true })
    photo: string; //photo file location. Use stream to send

    @Column({ nullable: true })
    photoMimeType: string; //save the encoding of uploaded file for content-type use for reply.type as shown above

    @Column({ default: true })
    isActive: boolean;

    @Column({ unique: true })
    @Index()
    primaryEmailAddress: string;

    @Column({ nullable: true })
    backupEmailAddress: string;

    @Column("simple-json", { nullable: true })
    phone: { mobile: string[], office: string[], home: string[] }

    @Column({ default: false })
    isPrimaryEmailAddressVerified: boolean;

    @Column({ default: false })
    isBackupEmailAddressVerified: boolean;

    @Column({ nullable: true })
    passwordSalt: string;

    @Column({ select: false }) //don't select password whenever user is called. See https://typeorm.io/#/select-query-builder/hidden-columns
    passwordHash: string;

    //set to true if password change is required
    @Column({ default: false })
    isPasswordChangeRequired: boolean;

    //token to be generated when password change request is made
    @Column({ unique: true, nullable: true })
    resetPasswordToken: string;

    @Column({ nullable: true })
    resetPasswordExpiration: Date;

    @Column({ nullable: true })
    primaryEmailVerificationToken: string;

    @Column({ nullable: true })
    backupEmailVerificationToken: string;

    @Column({ nullable: true })
    emailVerificationTokenExpiration: Date;

    //Incorporating OTP. See https://github.com/speakeasyjs/speakeasy
    @Column({ default: false })
    otpEnabled: boolean

    @Column({ nullable: true })
    otpSecret: string;

    @ManyToMany(type => Role, role => role.users)
    @JoinTable()
    roles: Role[];

    /** one user can be a primary contact for many tenant accounts.
     * Automatically a superadmin that can add team members
    */
    @OneToMany(type => Tenant, tenant => tenant.primaryContact)
    primaryContactForWhichTenants: Tenant[]

    /**
     * Team member of which tenants?
     */
    //a user can be a team member of multiple tenants
    @OneToMany(type => TenantTeam, tenantTeam => tenantTeam.user, { cascade: true })
    tenantTeamMemberships: TenantTeam[] //notice the array here

    /**
     * Landlord account officer for which tenants?
     */
    @OneToMany(type => TenantAccountOfficer, tenantAccountOfficer => tenantAccountOfficer.user, { cascade: true })
    accountOfficerForWhichTenants: TenantAccountOfficer[]

    /** for refresh token save after successful login*/
    @Column({ select: false, nullable: true })
    public refreshTokenHash: string;

    @OneToOne(type => FacebookProfile, facebookProfile => facebookProfile.user, {cascade: true})
    facebookProfile: FacebookProfile
}
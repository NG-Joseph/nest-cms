/**
 * Abstract base type for entities
 */
export interface IBaseAbstract {
    id?: number;
    dateCreated?: Date;
    createdBy?: string;
    dateLastModified?: Date;
    lastModifiedBy?: string;
    lastChangeInfo?: string;
    deletedBy?: string;
}
/**
 * CustomTheme type
 */
export interface ICustomTheme extends IBaseAbstract {
    name?: string;
    description?: string;
    properties?: string;
    bulmaProperties?: { primaryColor: string, primaryBackground: string };
}

export enum TenantStatus {
    A = "active",
    S = "suspended",
    O = "owing"
}

export enum Gender {
    M = "male",
    F = "female"
}

export enum TenantTeamRole {
    A = "admin",
    M = "marketing",
    C = "content-manager"
}

export enum TenantAccountOfficerRole {
    M = "manager",
    T = "tech-support"
}

export interface IUser extends IBaseAbstract {
    landlord?: boolean;
    firstName?: string;
    middleName?: string;
    lastName?: string;
    commonName?: string;
    homeAddress?: string;
    gender?: Gender;
    dateOfBirth?: Date;
    nationality?: string;
    stateOfOrigin?: string;
    zip?: string;
    photo?: string;
    photoMimeType?: string;
    isActive?: boolean;
    primaryEmailAddress?: string;
    backupEmailAddress?: string;
    phone?: { mobile?: string[], office?: string[], home?: string[] }
    isPrimaryEmailAddressVerified?: boolean;
    isBackupEmailAddressVerified?: boolean;
    passwordSalt?: string;
    passwordHash?: string;
    isPasswordChangeRequired?: boolean;
    resetPasswordToken?: string;
    resetPasswordExpiration?: Date;
    primaryEmailVerificationToken?: string;
    backupEmailVerificationToken?: string;
    emailVerificationTokenExpiration?: Date;
    otpEnabled?: boolean
    otpSecret?: string;
    roles?: IRole[];
    primaryContactForWhichTenants?: ITenant[];
    tenantTeamMemberships?: ITenantTeam[];
    accountOfficerForWhichTenants?: ITenantAccountOfficer[];

}

export interface IRole extends IBaseAbstract {
    name?: string;
    description?: string;
    users?: IUser[];
    landlord?: boolean; //Is this a role that is unique to landlords
}

export interface ITenantTeam extends IBaseAbstract {
    tenant?: ITenant
    user?: IUser
    roles?: TenantTeamRole[]
}

export interface ITenantAccountOfficer extends IBaseAbstract{ 
    tenant?: ITenant
    user?: IUser
    roles?: TenantAccountOfficerRole[]
}

export interface ITheme extends IBaseAbstract{
    name?: string;
    description?: string;
    properties?: string;
    tenants?: ITenant[];
}

export interface IBilling extends IBaseAbstract{
    uuid?: string;
    code?: string;
    description?: string;
    type?: string;
    tenant?: ITenant;
}

export interface IConnectionResource extends IBaseAbstract{
    uuid?: string;
    name?: string
    description?: string
    active?: boolean
    platform?: string
    connectionProperties?: {
        type: string,
        host: string,
        port: string,
        username: string,
        password: string,
        database: string,
        schema: string
      }; 
    rootFileSystem?: string;
    tenant?: ITenant;
}

/**
 * Tenant type
 */
export interface ITenant extends IBaseAbstract {
    uuid?: string;
    uniqueName?: string;
    address?: string;
    moreInfo?: string;
    logo?: string;
    logoMimeType?: string;
    status?: TenantStatus;
    customURLSlug?: string | null
    dateOfRegistration?: Date
    active?: boolean;
    customTheme?: ICustomTheme;
    primaryContact?: IUser;
    teamMembers?: ITenantTeam[];
    tenantAccountOfficers?: ITenantAccountOfficer[];
    uniqueSchema?: boolean;
    themes?: ITheme[];
    billings?: IBilling[];
    connectionResource?: IConnectionResource;
    [key: string]: any
}

/**
 * State variable type
 */
export interface IState {
    tenants?: ITenant[];
    tenantsCount?: number; //for total number that corresponds to present find, in case of pagination
    tenant?: ITenant | null; //This can be use for tenant to edit or tenant to view, depending on the function being carried out
    onAddTenant: boolean;
    onViewTenant: boolean;
    onEditTenant: boolean;
    alert: {
        show: boolean,
        message: string,
        type: any //problem making string compatible with type '"info" | "success" | "link" |
    }
}

/**
 * Action type for Reducer
 */
export interface IAction {
    //Indicate possible reducer action types here as you identify them in your codes
    type: 'FetchDataSuccess' | 'FetchDataFailure' | 'HandleOnAddTenant'
    | 'HandleCancelCreate' | 'BeforeCreateTenant' | 'CreateTenantSuccess'
    | 'CreateTenantFailure' | 'BeforeDeleteTenant' | 'DeleteTenantSuccess'
    | 'DeleteTenantFailure' | 'HandleEditTenant' | 'HandleCancelUpdate'
    | 'BeforeUpdateTenant' | 'UpdateTenantSuccess' | 'UpdateTenantFailure'
    | 'HandleCloseAlert' | 'HandleViewTenant' | 'HandleCloseViewTenant';
    payload?: {
        tenants?: ITenant[], tenantsCount?: number, tenant?: ITenant, error?: Error,
        id?: number | string
    }

}

/*
The idea below is to provide room for specifying read
https://github.com/typeorm/typeorm/blob/master/docs/find-options.md
*/
export interface IFindOptions {
    select?: string[];
    relations?: string[];
    skip?: number;
    take?: number;
    cache?: boolean;
    where?: {}[] | {};
    order?: {};

}

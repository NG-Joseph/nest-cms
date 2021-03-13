import { IBaseAbstract } from "../global/app.interfaces";

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

export interface ICreateTenantTeamRolesDto{

     roles: TenantTeamRole[];
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
    [key: string]: any

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
    tenantUniqueName?: string
    tenantUniqueId?: number
}

export interface ITenantAccountOfficer extends IBaseAbstract {
    tenant?: ITenant
    user?: IUser
    roles?: TenantAccountOfficerRole[]
}

export interface ITheme extends IBaseAbstract {
    name?: string;
    description?: string;
    properties?: string;
    tenants?: ITenant[];
}

export interface IBilling extends IBaseAbstract {
    uuid?: string;
    code?: string;
    description?: string;
    type?: string;
    tenant?: ITenant;
}

export interface IConnectionResource extends IBaseAbstract {
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
 * State variable type. This is for the general crud as used in UserApp.tsx
 */
export interface IState {
    users?: IUser[];
    usersCount?: number; //for total number that corresponds to present find, in case of pagination
    user?: ITenant | null; //This can be used for user to edit or user to view, depending on the function being carried out
    onAddUser: boolean;
    onViewUser: boolean;
    onEditUser: boolean;
    alert: {
        show: boolean,
        message: string,
        type: 'info' | 'success' | 'link' | 'danger' | '' | any,
    },
    actionButtonState: 'is-info' | 'is-success' | 'is-loading' | 'is-danger' | 'is-primary' | any //used for deciding whether to show loading button state or not. Change to is-loading 
}


//for EditUser
export interface IEditUserState {
    user: IUser,
    relations: {
        assignableRoles?: IRole[], //this is for roles to be listed in the dropbox
        tenants?: ITenant[], //this is for tenants to be listed in the dropbox. Not in use! I am finding by tenant unique name
        photo: {
            fileToUpload: Blob | string,
            uploadButtonState: string,
            alert: {
                show: boolean,
                type: "info" | "success" | "link" | "primary" | "warning" | "danger" | "light" | "dark" | "white" | "black" | undefined,
                onClickHandler?: () => void
                message: string
            },
            src: string
        },
        userRoles: { //for user roles to be added to and removed from
            rolesToAdd?: number[], //this is for adding one or more roles to user
            submitButtonState: string,
            deleteButtonState: string,
        },
        primaryContactForWhichTenants:{
            uniqueNameOfTenantToAdd?: string | undefined, //doing one by one. This is the unique name of tenant to add
            submitButtonState: string,
            deleteButtonState: string,
        },
        tenantTeamMemberships:{
            uniqueNameOfTenantToAdd?: string | undefined, //doing one by one. This is the unique name of tenant to add
            rolesToAdd?: TenantTeamRole[] //roles as a tenant team member to add
            submitButtonState: string,
            deleteButtonState: string,
            
        }

    }
}

/**
 * Action type for Reducer
 */
export interface IAction {
    //Indicate possible reducer action types here as you identify them in your codes
    type: 'FetchDataSuccess' | 'FetchDataFailure' | 'HandleOnAddUser'
    | 'HandleCancelCreate' | 'BeforeCreateUser' | 'CreateUserSuccess'
    | 'CreateUserFailure' | 'BeforeDeleteUser' | 'DeleteUserSuccess'
    | 'DeleteUserFailure' | 'HandleEditUser' | 'HandleCancelUpdate'
    | 'BeforeUpdateUser' | 'UpdateUserSuccess' | 'UpdateUserFailure'
    | 'HandleCloseAlert' | 'HandleViewUser' | 'HandleCloseViewUser'
    //for relations
    | 'BeforeAddRoleToUser' | 'AddRoleToUserSuccess' | 'AddRoleToUserFailure';

    payload?: {
        users?: IUser[], usersCount?: number, user?: IUser, error?: Error,
        id?: number | string,
        actionButtonState?: 'is-info' | 'is-success' | 'is-loading' | 'is-danger' | 'is-primary' //used for deciding whether to show loading button state or not. Change to is-loading 
    }

}


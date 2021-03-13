import { IBaseAbstract } from "../global/app.interfaces";
import { IUser } from "../user-app/app.interfaces";


export interface IRole extends IBaseAbstract {
    name?: string;
    description?: string;
    users?: IUser[];
    landlord?: boolean; //Is this a role that is unique to landlords
    [key: string]: any
}

/**
 * State variable type
 */
export interface IState {
    roles?: IRole[];
    rolesCount?: number; //for total number that corresponds to present find, in case of pagination
    role?: IRole | null; //This can be used for role to edit or role to view, depending on the function being carried out
    onAddRole: boolean;
    onViewRole: boolean;
    onEditRole: boolean;
    alert: {
        show: boolean,
        message: string,
        type: 'info' | 'success' | 'link' | 'danger' | '' | any,
    },
    actionButtonState: 'is-info' | 'is-success' | 'is-loading' | 'is-danger' | 'is-primary' | any //used for deciding whether to show loading button state or not. Change to is-loading 
}

/**
 * Action type for Reducer
 */
export interface IAction {
    //Indicate possible reducer action types here as you identify them in your codes
    type: 'FetchDataSuccess' | 'FetchDataFailure' | 'HandleOnAddRole'
    | 'HandleCancelCreate' | 'BeforeCreateRole' | 'CreateRoleSuccess'
    | 'CreateRoleFailure' | 'BeforeDeleteRole' | 'DeleteRoleSuccess'
    | 'DeleteRoleFailure' | 'HandleEditRole' | 'HandleCancelUpdate'
    | 'BeforeUpdateRole' | 'UpdateRoleSuccess' | 'UpdateRoleFailure'
    | 'HandleCloseAlert' | 'HandleViewRole' | 'HandleCloseViewRole'
    //below are for relations
    |'BeforeAddUserToRole' | 'AddUserToRoleSuccess' | 'AddUserToRoleFailure';

    payload?: {
        roles?: IRole[], rolesCount?: number, role?: IRole, error?: Error,
        id?: number | string,
        actionButtonState?: 'is-info' | 'is-success' | 'is-loading' | 'is-danger' | 'is-primary', //used for deciding whether to show loading button state or not. Change to is-loading 
        
    }

}
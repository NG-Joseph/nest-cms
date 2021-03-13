import { IState, IAction } from '../app.interfaces';

const reducer = (state: IState, action: IAction) => {
    //alert("reducer called")
    switch (action.type) {
        case 'FetchDataSuccess':
            return {
                ...state, roles: action.payload!.roles, rolesCount: action.payload!.rolesCount, actionButtonState: action.payload!.actionButtonState
            };
        case 'FetchDataFailure':
            return {
                ...state, alert: { show: true, type: 'danger', message: `Could not load remote data: ${action.payload!.error}` }, actionButtonState: action.payload!.actionButtonState
            };
        case 'HandleViewRole':
            return {
                ...state, onViewRole: true, onAddRole: false, onEditRole: false, role: action.payload!.role
            };
        case 'HandleCloseViewRole':
            return{
                ...state, onViewRole: false, role: null
            }
        case 'HandleOnAddRole':
            return {
                ...state, onAddRole: true, onEditRole: false, alert: {...state.alert, show: false}
            };
        case 'HandleCancelCreate':
            return {
                ...state, onAddRole: false
            };
        case 'BeforeCreateRole':
            //goal here is to set alert and/or is-loading button to show creating role message. May be better to simply use is-loading button css
            return {
                ...state, alert: { show: true, type: 'info', message: 'Creating role. Please wait!' }, actionButtonState: action.payload!.actionButtonState
            };
        case 'CreateRoleSuccess': 
            //goal here is to update state with role created
            //React team recommends that state modifications like that shown below should not be in useReducer.
            //Hence, I had to pass currentState to handleCreateRole and modify the currentState there before passing to reducer
            //TODO, do the same for Update and Delete
            /*
            const currentRoles = state.roles!;
            
            currentRoles.push(action.payload!.role!);
            const newRolesCount = state.rolesCount!++;
            */
           
            return {
                //...state, roles: currentRoles, rolesCount: newRolesCount, onAddRole: false, alert: { show: true, type: 'success', message: 'Tenant successfully created!' }, actionButtonState: action.payload!.actionButtonState
                ...state, roles: action.payload!.roles, rolesCount: action.payload!.roles!.length, onAddRole: false, alert: { show: true, type: 'success', message: 'Tenant successfully created!' }, actionButtonState: action.payload!.actionButtonState
            };
        
        case 'CreateRoleFailure':
            //goal here is to set alert to show failure to create
            return {
                ...state, alert: { show: true, type: 'danger', message: `Could not create role: ${action.payload!.error}` }, actionButtonState: action.payload!.actionButtonState
            };
        case 'BeforeDeleteRole':
            //goal here is to set alert and/or is-loading button to show deleting role message
            return { 
                ...state, alert: { show: true, type: 'info', message: 'Deleting role. Please wait!' }, actionButtonState: action.payload!.actionButtonState
            };
        case 'DeleteRoleSuccess':
            //goal here is to remove deleted role from state
            /*
            const currentRoles = state.roles;
            //find the index corresponding to the role with the passed id
            const index = currentRoles!.findIndex((role) => role.id === action.payload!.id);
            currentRoles!.splice(index, 1);
            //decrement roles count
            const newRolesCount = state.rolesCount!-- 
            */
            return { 
                //...state, onViewRole: false, roles: currentRoles, rolesCount: newRolesCount, alert: { show: true, type: 'success', message: 'Role successfully deleted!' }, actionButtonState: action.payload!.actionButtonState
                ...state, onViewRole: false, roles: action.payload!.roles, rolesCount: action.payload!.roles!.length, alert: { show: true, type: 'success', message: 'Role successfully deleted!' }, actionButtonState: action.payload!.actionButtonState
            };
        
        case 'DeleteRoleFailure':
            //goal here is to set alert to show failure to delete
            return { 
                ...state, onViewRole: false, alert: { show: true, type: 'danger', message: `Could not delete role: ${action.payload!.error}` }, actionButtonState: action.payload!.actionButtonState
            };
        case 'BeforeUpdateRole':
            //goal here is to set alert to show updating role message
            return { 
                ...state, alert: { show: true, type: 'info', message: 'Updating role. Please wait!' }, actionButtonState: action.payload!.actionButtonState
            };
        case 'HandleCancelUpdate':
            return { 
                ...state, onEditRole: false 
            };
        case 'HandleEditRole': {
            //goal here is to find the tenant to be edited and set the role in state to be edited
            const currentRoles = state.roles;
            
            const index = currentRoles!.findIndex((role) => role.id === action.payload!.id);
            const role = currentRoles![index];
            return { 
                ...state, onEditRole: true, role: role, onAddRole: false, alert: {...state.alert, show: false} 
            };
        };
        case 'UpdateRoleSuccess':
            //goal here is to update state with tenant updated
            /*
            const currentRoles = state.roles;
            const index = currentRoles!.findIndex((role) => role.id === action.payload!.role!.id);
            //now change the value for that role in state
            currentRoles![index] = action.payload!.role!;
            */
            return { 
                //...state, onViewRole: false, roles: currentRoles, role: action.payload!.role!, onEditRole: false, alert: { show: true, type: 'success', message: 'Role successfully updated!' }, actionButtonState: action.payload!.actionButtonState
                ...state, onViewRole: false, roles: action.payload!.roles, role: action.payload!.role!, onEditRole: false, alert: { show: true, type: 'success', message: 'Role successfully updated!' }, actionButtonState: action.payload!.actionButtonState
            };
        
        case 'UpdateRoleFailure':
            //goal here is to set alert to show failure to update
            return { 
                ...state, onViewRole: false, alert: { show: true, type: 'danger', message: `Could not update role: ${action.payload!.error}` }, actionButtonState: action.payload!.actionButtonState
            };
        case 'HandleCloseAlert':
            return { 
                ...state, alert: { show: false, message: '', type: '' } 
            };

        //below are for relations
        case 'AddUserToRoleSuccess':
            //replace the role that has been updated with the one returned from server after update.
            //goal here is to update state with tenant updated
            const currentRoles = state.roles;
            const index = currentRoles!.findIndex((role) => role.id === action.payload!.role!.id);
            //now change the value for that role in state
            currentRoles![index] = action.payload!.role!;
            return { 
                ...state, roles: currentRoles, role: action.payload!.role!, alert: { show: true, type: 'success', message: 'User successfully added to role!' }, actionButtonState: action.payload!.actionButtonState
            };
            
        default:
            return state; //return state as is if the action type indicated is not handled
    }//close switch statement

}
export default reducer;
import { IState, IAction } from '../app.interfaces';

const reducer = (state: IState, action: IAction) => {
    switch (action.type) {
        case 'FetchDataSuccess':
            return {
                ...state, users: action.payload!.users, usersCount: action.payload!.usersCount, actionButtonState: action.payload!.actionButtonState
            };
        case 'FetchDataFailure':
            return {
                ...state, alert: { show: true, type: 'danger', message: `Could not load remote data: ${action.payload!.error}` }, actionButtonState: action.payload!.actionButtonState
            };
        case 'HandleViewUser':
            return {
                ...state, onViewUser: true, onAddUser: false, onEditUser: false, user: action.payload!.user
            };
        case 'HandleCloseViewUser':
            return {
                ...state, onViewUser: false, user: null
            }
        case 'HandleOnAddUser':
            return {
                ...state, onAddUser: true, onEditUser: false, alert: { ...state.alert, show: false }
            };
        case 'HandleCancelCreate':
            return {
                ...state, onAddUser: false
            };
        case 'BeforeCreateUser':
            //goal here is to set alert and/or is-loading button to show creating user message. May be better to simply use is-loading button css
            return {
                ...state, alert: { show: true, type: 'info', message: 'Creating user. Please wait!' }, actionButtonState: action.payload!.actionButtonState
            };
        case 'CreateUserSuccess':
            //goal here is to update state with user created
            //React team recommends that state modifications like that shown below should not be in useReducer.
            //Hence, I had to pass currentState to handleCreateUser and modify the currentState there before passing to reducer
            /*
            const currentUsers = state.users!;
            
            currentUsers.push(action.payload!.user!);
            const newUsersCount = state.usersCount!++;
            */

            return {
                //...state, users: currentUsers, usersCount: newUsersCount, onAddUser: false, alert: { show: true, type: 'success', message: 'Tenant successfully created!' }, actionButtonState: action.payload!.actionButtonState
                ...state, users: action.payload!.users, usersCount: action.payload!.users!.length, onAddUser: false, onEditUser: true, user: action.payload!.user, alert: { show: true, type: 'success', message: 'User successfully created!' }, actionButtonState: action.payload!.actionButtonState
            };

        case 'CreateUserFailure':
            //goal here is to set alert to show failure to create
            return {
                ...state, alert: { show: true, type: 'danger', message: `Could not create user: ${action.payload!.error}` }, actionButtonState: action.payload!.actionButtonState
            };
        case 'BeforeDeleteUser':
            //goal here is to set alert and/or is-loading button to show deleting user message
            return {
                ...state, alert: { show: true, type: 'info', message: 'Deleting user. Please wait!' }, actionButtonState: action.payload!.actionButtonState
            };
        case 'DeleteUserSuccess':
            //goal here is to remove deleted user from state
            /*
            const currentUsers = state.users;
            //find the index corresponding to the user with the passed id
            const index = currentUsers!.findIndex((user) => user.id === action.payload!.id);
            currentUsers!.splice(index, 1);
            //decrement users count
            const newUsersCount = state.usersCount!-- 
            */
            return {
                //...state, onViewUser: false, users: currentUsers, usersCount: newUsersCount, alert: { show: true, type: 'success', message: 'User successfully deleted!' }, actionButtonState: action.payload!.actionButtonState
                ...state, onViewUser: false, users: action.payload!.users, usersCount: action.payload!.users!.length, alert: { show: true, type: 'success', message: 'User successfully deleted!' }, actionButtonState: action.payload!.actionButtonState
            };

        case 'DeleteUserFailure':
            //goal here is to set alert to show failure to delete
            return {
                ...state, onViewUser: false, alert: { show: true, type: 'danger', message: `Could not delete user: ${action.payload!.error}` }, actionButtonState: action.payload!.actionButtonState
            };
        case 'BeforeUpdateUser':
            //goal here is to set alert to show updating user message
            return {
                ...state, alert: { show: true, type: 'info', message: 'Updating user. Please wait!' }, actionButtonState: action.payload!.actionButtonState
            };
        case 'HandleCancelUpdate':
            return {
                ...state, onEditUser: false
            };
        case 'HandleEditUser': {
            //goal here is to find the tenant to be edited and set the user in state to be edited
            const currentUsers = state.users;

            const index = currentUsers!.findIndex((user) => user.id === action.payload!.id);
            const user = currentUsers![index];
            return {
                ...state, onEditUser: true, user: user, onAddUser: false, alert: { ...state.alert, show: false }
            };
        };
        case 'UpdateUserSuccess':
            //goal here is to update state with tenant updated
            /*
            const currentUsers = state.users;
            const index = currentUsers!.findIndex((user) => user.id === action.payload!.user!.id);
            //now change the value for that user in state
            currentUsers![index] = action.payload!.user!;
            */
            return {
                //...state, onViewUser: false, users: currentUsers, user: action.payload!.user!, onEditUser: false, alert: { show: true, type: 'success', message: 'User successfully updated!' }, actionButtonState: action.payload!.actionButtonState
                ...state, onViewUser: false, users: action.payload!.users, user: action.payload!.user!, onEditUser: false, alert: { show: true, type: 'success', message: 'User successfully updated!' }, actionButtonState: action.payload!.actionButtonState
            };

        case 'UpdateUserFailure':
            //goal here is to set alert to show failure to update
            return {
                ...state, onViewUser: false, alert: { show: true, type: 'danger', message: `Could not update user: ${action.payload!.error}` }, actionButtonState: action.payload!.actionButtonState
            };
        case 'HandleCloseAlert':
            return {
                ...state, alert: { show: false, message: '', type: '' }
            };

        //below are for relations
        case 'AddRoleToUserSuccess':
            //replace the user that has been updated with the one returned from server after update.
            //goal here is to update state with tenant updated
            const currentUsers = state.users;
            const index = currentUsers!.findIndex((user) => user.id === action.payload!.user!.id);
            //now change the value for that user in state
            currentUsers![index] = action.payload!.user!;
            return {
                ...state, users: currentUsers, user: action.payload!.user!, alert: { show: true, type: 'success', message: 'User successfully added to user!' }, actionButtonState: action.payload!.actionButtonState
            };

        default:
            return state; //return state as is if the action type indicated is not handled
    }//close switch statement

}
export default reducer;
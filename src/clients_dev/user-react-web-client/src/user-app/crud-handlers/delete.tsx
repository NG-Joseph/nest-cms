import { DEFAULT_ACTION_BUTTON_STATE } from "../../global/app.settings";
import { IAction, IUser } from "../app.interfaces";

export const handleDeleteUser = async (id: number | string, currentUsers: IUser[], dispatch: React.Dispatch<IAction>) => {
    //You can optionally send an alert at the beginning of this function, in case it takes long to finish.
    dispatch({ type: 'BeforeDeleteUser', payload: { actionButtonState: 'is-loading' } });
    try {
        const response = await fetch(`/v1/users/${id}`, //note this URL
            {
                method: 'DELETE'
            });
        if (!response.ok) throw new Error(response.statusText);//confirm that response is OK
        //Response is ok. Proceed!
        
        //remove user from current state received in this function and to be dispatched
        //find the index corresponding to the user with the passed id
        const index = currentUsers!.findIndex((user) => user.id === id);
        currentUsers!.splice(index, 1);
        //dispatch({ type: 'DeleteUserSuccess', payload: { id: id, actionButtonState: DEFAULT_ACTION_BUTTON_STATE } })
        dispatch({ type: 'DeleteUserSuccess', payload: { id: id, users: currentUsers, actionButtonState: DEFAULT_ACTION_BUTTON_STATE } })
    } catch (error) {
        //problem deleting from backend
        dispatch({ type: 'DeleteUserFailure', payload: { error: error, actionButtonState: DEFAULT_ACTION_BUTTON_STATE } })
    }
}

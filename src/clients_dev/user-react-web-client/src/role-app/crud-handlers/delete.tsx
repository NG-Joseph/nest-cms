import { DEFAULT_ACTION_BUTTON_STATE } from "../../global/app.settings";
import { IAction, IRole } from "../app.interfaces";

export const handleDeleteRole = async (id: number | string, currentRoles: IRole[], dispatch: React.Dispatch<IAction>) => {
    //You can optionally send an alert at the beginning of this function, in case it takes long to finish.
    dispatch({ type: 'BeforeDeleteRole', payload: { actionButtonState: 'is-loading' } });
    try {
        const response = await fetch(`/v1/roles/${id}`, //note this URL
            {
                method: 'DELETE'
            });
        if (!response.ok) throw new Error(response.statusText);//confirm that response is OK
        //Response is ok. Proceed!
        
        //remove role from current state received in this function and to be dispatched
        //find the index corresponding to the role with the passed id
        const index = currentRoles!.findIndex((role) => role.id === id);
        currentRoles!.splice(index, 1);
        //dispatch({ type: 'DeleteRoleSuccess', payload: { id: id, actionButtonState: DEFAULT_ACTION_BUTTON_STATE } })
        dispatch({ type: 'DeleteRoleSuccess', payload: { id: id, roles: currentRoles, actionButtonState: DEFAULT_ACTION_BUTTON_STATE } })
    } catch (error) {
        //problem deleting from backend
        dispatch({ type: 'DeleteRoleFailure', payload: { error: error, actionButtonState: DEFAULT_ACTION_BUTTON_STATE } })
    }
}

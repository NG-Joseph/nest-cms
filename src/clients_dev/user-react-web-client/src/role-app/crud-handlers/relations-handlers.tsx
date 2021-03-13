import { API_VERSION_URL, DEFAULT_ACTION_BUTTON_STATE } from "../../global/app.settings";
import { IAction } from "../app.interfaces";
/*
export const addUserById = async (roleId: number, userId: number, dispatch: React.Dispatch<IActionRelation>) => {
    //You can optionally send an alert at the beginning of this function, in case it takes long to finish.
    //Of course, this alert will only flash if it takes very minimal time to create item
    dispatch({ type: 'BeforeAddUserToRole', payload: {actionButtonState: 'is-loading'} })
    //let's try to write to backend
    try {
        const response = await fetch(`${API_VERSION_URL}/roles/roleId/users/userId`,
            {
                method: 'PATCH',//notice the method
                headers: {
                    'Content-Type': 'application/json'
                }

            });
        if (!response.ok) throw new Error(response.statusText);//confirm that response is OK
        
        await response.json();
        //dispatch to state
        dispatch({ type: 'AddUserToRoleSuccess', payload: { roleId: roleId, userId: userId, actionButtonState: DEFAULT_ACTION_BUTTON_STATE } })
    } catch (error) {
        dispatch({ type: 'AddUserToRoleFailure', payload: { error: error, actionButtonState: DEFAULT_ACTION_BUTTON_STATE } })
    }

}
*/

export class RelationHandlers {

    public static addUserById = async (roleId: number, userId: number, dispatch: React.Dispatch<IAction>) => {
        //You can optionally send an alert at the beginning of this function, in case it takes long to finish.
        //Of course, this alert will only flash if it takes very minimal time to create item
        dispatch({ type: 'BeforeAddUserToRole', payload: {actionButtonState: 'is-loading'} })
        //let's try to write to backend
        try {
            const response = await fetch(`${API_VERSION_URL}/roles/roleId/users/userId`,
                {
                    method: 'PATCH',//notice the method
                    headers: {
                        'Content-Type': 'application/json'
                    }
    
                });
            if (!response.ok) throw new Error(response.statusText);//confirm that response is OK
            
            const data = await response.json();
            //dispatch to state
            dispatch({ type: 'AddUserToRoleSuccess', payload: { role: data, actionButtonState: DEFAULT_ACTION_BUTTON_STATE } })
        } catch (error) {
            dispatch({ type: 'AddUserToRoleFailure', payload: { error: error, actionButtonState: DEFAULT_ACTION_BUTTON_STATE } })
        }
    }    

}
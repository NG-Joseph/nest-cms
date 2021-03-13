import { DEFAULT_ACTION_BUTTON_STATE } from "../../global/app.settings";
import { IAction, IRole } from "../app.interfaces";

//function that handles Create Role
export const handleCreateRole = async (roleToCreate: IRole, currentRoles: IRole[], dispatch: React.Dispatch<IAction>) => {
    //dispatch to state reducer, specifying the action type. Just a message that says 'Creating role ...'
    dispatch({ type: 'BeforeCreateRole', payload: { actionButtonState: 'is-loading' } });
    //let's try to write to backend
    try {
        //I have left a number of init options commented out rather than not have then at, so you can know about them
        //see https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch for info on these options
        const response = await fetch(`/v1/roles`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(roleToCreate) // body data type must match "Content-Type" header

            });
        if (!response.ok) throw new Error(response.statusText);//confirm that response is OK, else throw error
        //Response is ok. Proceed!
        const roleCreated: IRole = await response.json();

        //update the current roles before dispatch
        currentRoles.push(roleCreated);
        //useReducer to dispatch successful role creation, sending roleCreated as payload.
        //dispatch({ type: 'CreateRoleSuccess', payload: { role: roleCreated, actionButtonState: DEFAULT_ACTION_BUTTON_STATE } });
        dispatch({ type: 'CreateRoleSuccess', payload: { roles: currentRoles, actionButtonState: DEFAULT_ACTION_BUTTON_STATE } });
    } catch (error) {
        //dispatch error to state for display
        dispatch({ type: 'CreateRoleFailure', payload: { error: error, actionButtonState: DEFAULT_ACTION_BUTTON_STATE } });
    }
}
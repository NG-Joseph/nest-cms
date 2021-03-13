import { DEFAULT_ACTION_BUTTON_STATE } from "../../global/app.settings";
import { IAction, IRole } from "../app.interfaces";

export const handleUpdateRole = async (editedRole: IRole, currentRoles: IRole[], dispatch: React.Dispatch<IAction>) => {
    //You can optionally send an alert at the beginning of this function, in case it takes long to finish.
    //Of course, this alert will only flash if it takes very minimal time to create item
    dispatch({ type: 'BeforeUpdateRole', payload: { actionButtonState: 'is-loading' } })
    //let's try to write to backend
    try {
        const response = await fetch(`/v1/roles`,
            {
                method: 'PUT',//notice the method
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(editedRole) // body data type must match "Content-Type" header

            });
        if (!response.ok) throw new Error(response.statusText);//confirm that response is OK

        await response.json();
        //dispatch to state
        const index = currentRoles!.findIndex((role) => role.id === editedRole.id);
        //now change the value for that role in state
        currentRoles![index] = editedRole!;
        dispatch({ type: 'UpdateRoleSuccess', payload: { role: editedRole, roles: currentRoles, actionButtonState: DEFAULT_ACTION_BUTTON_STATE } })
    } catch (error) {
        dispatch({ type: 'UpdateRoleFailure', payload: { error: error, actionButtonState: DEFAULT_ACTION_BUTTON_STATE } })
    }

}
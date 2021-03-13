import { DEFAULT_ACTION_BUTTON_STATE } from "../../../global/app.settings";
import { IAction, IUser } from "../../app.interfaces";

export const handleUpdateUser = async (editedUser: IUser, currentUsers: IUser[], dispatch: React.Dispatch<IAction>) => {
    //You can optionally send an alert at the beginning of this function, in case it takes long to finish.
    //Of course, this alert will only flash if it takes very minimal time to create item
    dispatch({ type: 'BeforeUpdateUser', payload: { actionButtonState: 'is-loading' } })
    //let's try to write to backend
    try {
        const response = await fetch(`/v1/users`,
            {
                method: 'PUT',//notice the method
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(editedUser) // body data type must match "Content-Type" header

            });
        if (!response.ok) throw new Error(response.statusText);//confirm that response is OK

        await response.json();
        //dispatch to state
        const index = currentUsers!.findIndex((user) => user.id === editedUser.id);
        //now change the value for that user in state
        currentUsers![index] = editedUser!;
        dispatch({ type: 'UpdateUserSuccess', payload: { user: editedUser, users: currentUsers, actionButtonState: DEFAULT_ACTION_BUTTON_STATE } })
    } catch (error) {
        dispatch({ type: 'UpdateUserFailure', payload: { error: error, actionButtonState: DEFAULT_ACTION_BUTTON_STATE } })
    }

}
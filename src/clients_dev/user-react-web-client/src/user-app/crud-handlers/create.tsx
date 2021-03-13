import { DEFAULT_ACTION_BUTTON_STATE } from "../../global/app.settings";
import { IAction, IUser } from "../app.interfaces";

//function that handles Create User
export const handleCreateUser = async (userToCreate: IUser, currentUsers: IUser[], dispatch: React.Dispatch<IAction>) => {
    //dispatch to state reducer, specifying the action type. Just a message that says 'Creating user ...'
    dispatch({ type: 'BeforeCreateUser', payload: { actionButtonState: 'is-loading' } });
    //let's try to write to backend
    //alert(JSON.stringify(userToCreate))
    try {
        //I have left a number of init options commented out rather than not have then at, so you can know about them
        //see https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch for info on these options
        const response = await fetch(`/v1/users`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userToCreate) // body data type must match "Content-Type" header

            });
        if (!response.ok) throw new Error(response.statusText);//confirm that response is OK, else throw error
        //Response is ok. Proceed!
        const userCreated: IUser = await response.json();

        //update the current users before dispatch
        currentUsers.push(userCreated);
        //useReducer to dispatch successful user creation, sending userCreated as payload.
        //dispatch({ type: 'CreateUserSuccess', payload: { user: userCreated, actionButtonState: DEFAULT_ACTION_BUTTON_STATE } });
        dispatch({ type: 'CreateUserSuccess', payload: { user: userCreated, users: currentUsers, actionButtonState: DEFAULT_ACTION_BUTTON_STATE } });
    } catch (error) {
        //dispatch error to state for display
        dispatch({ type: 'CreateUserFailure', payload: { error: error, actionButtonState: DEFAULT_ACTION_BUTTON_STATE } });
    }
}
import { IAction, ITenant } from "../app.interfaces";

//function that handles Create Tenant
export const handleCreateTenant = async (tenantToCreate: ITenant, createPrimaryContact: boolean, dispatch: React.Dispatch<IAction>) => {
    //dispatch to state reducer, specifying the action type. Just a message that says 'Creating tenant ...'
    dispatch({ type: 'BeforeCreateTenant' });
    //let's try to write to backend
    try {
        //I have left a number of init options commented out rather than not have then at, so you can know about them
        //see https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch for info on these options
        const response = await fetch(`/v1/tenants?createPrimaryContact=${createPrimaryContact}`,
            {
                method: 'POST',
                //mode: 'cors', // no-cors, *cors, same-origin
                //cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                //credentials: 'same-origin', // include, *same-origin, omit
                headers: {
                    'Content-Type': 'application/json'
                    // 'Content-Type': 'application/x-www-form-urlencoded',
                },
                //redirect: 'follow', // manual, *follow, error
                //referrerPolicy: 'no-referrer', // no-referrer, *client
                body: JSON.stringify(tenantToCreate) // body data type must match "Content-Type" header

            });
        if (!response.ok) throw new Error(response.statusText);//confirm that response is OK, else throw error
        //Response is ok. Proceed!
        const tenantCreated: ITenant = await response.json();

        //useReducer to dispatch successful tenant creation, sending tenantCreated as payload.
        dispatch({ type: 'CreateTenantSuccess', payload: { tenant: tenantCreated } });
    } catch (error) {
        //dispatch error to state for display
        dispatch({ type: 'CreateTenantFailure', payload: { error: error } });
    }
}
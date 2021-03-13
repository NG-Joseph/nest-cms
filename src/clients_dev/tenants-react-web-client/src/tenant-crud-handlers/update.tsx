import { IAction, ITenant } from "../app.interfaces";


export const handleUpdateTenant = async (editedTenant: ITenant, dispatch: React.Dispatch<IAction>) => {
    //You can optionally send an alert at the beginning of this function, in case it takes long to finish.
    //Of course, this alert will only flash if it takes very minimal time to create item
    dispatch({ type: 'BeforeUpdateTenant' })
    //let's try to write to backend
    try {
        const response = await fetch(`/v1/tenants`,
            {
                method: 'PUT',//notice the method
                //mode: 'cors', // no-cors, *cors, same-origin
                //cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                //credentials: 'same-origin', // include, *same-origin, omit
                headers: {
                    'Content-Type': 'application/json'
                    // 'Content-Type': 'application/x-www-form-urlencoded',
                },
                //redirect: 'follow', // manual, *follow, error
                //referrerPolicy: 'no-referrer', // no-referrer, *client
                body: JSON.stringify(editedTenant) // body data type must match "Content-Type" header

            });
        if (!response.ok) throw new Error(response.statusText);//confirm that response is OK
        //Response is ok. Proceed with setting state with itemUpdated
        //partial update does not return full object, hence I am not using below to get tenant updated
        //const tenantUpdated = await response.json();
        
        await response.json();
        //dispatch to state
        dispatch({ type: 'UpdateTenantSuccess', payload: { tenant: editedTenant } })
    } catch (error) {
        alert('error zone')
        dispatch({ type: 'UpdateTenantFailure', payload: { error: error } })
    }

}
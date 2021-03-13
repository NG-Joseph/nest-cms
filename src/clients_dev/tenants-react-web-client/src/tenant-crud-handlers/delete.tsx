import { IAction } from "../app.interfaces";

export const handleDeleteTenant = async (id: number | string, dispatch: React.Dispatch<IAction>) => {
    //You can optionally send an alert at the beginning of this function, in case it takes long to finish.
    dispatch({ type: 'BeforeDeleteTenant' });
    try {
        const response = await fetch(`/v1/tenants/${id}`, //note this URL
            {
                method: 'DELETE',
                //mode: 'cors', // no-cors, *cors, same-origin
                //cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                //credentials: 'same-origin', // include, *same-origin, omit
                //redirect: 'follow', // manual, *follow, error
                //referrerPolicy: 'no-referrer', // no-referrer, *client
            });
        if (!response.ok) throw new Error(response.statusText);//confirm that response is OK
        //Response is ok. Proceed!
        //remove tenant from state
        dispatch({ type: 'DeleteTenantSuccess', payload: { id: id } })
    } catch (error) {
        //problem deleting from backend
        dispatch({ type: 'DeleteTenantFailure', payload: { error: error } })
    }
}

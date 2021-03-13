/** This component is for displaying each item in the record, passed to it from TenantList */
import React, { useContext } from 'react';
import { ITenant } from '../app.interfaces';
import { AppContext } from '../App';

type Props = {
    tenant: ITenant,
}

const Tenant: React.FC<Props> = ({tenant}) => {

    //declare applicable contexts
    const appContext = useContext(AppContext);

    //callback function for delete button onClick event. We could have also embedded this function definition directly rather than define it first here
    const onDeleteTenant = () => {
        appContext!.handleDeleteTenant!(tenant.id, appContext!.dispatch); ////notice here that we are invoking the handleDeleteTenant() via appContext. The exclamation mark is because of the possible null which will not really happen
    };

    //callback function for edit button
    const onEditTenant = () => {
        //appContext!.handleEditTenant!(tenant.id, appContext!.dispatch); //notice here that we are invoking the handleEditTenant() via appContext. The exclamation mark is because of the possible null which will not really happen
        appContext!.dispatch({ type: 'HandleEditTenant', payload: {id: tenant.id} });
    };

    const onViewTenant = () => {
        appContext!.dispatch({type: 'HandleViewTenant', payload: {tenant}})
    }

    return (
        <tr>
            <td>{tenant.uniqueName}</td>
            <td>{tenant.primaryContact?.firstName}</td>
            <td>{tenant.primaryContact?.lastName}</td>
            <td>{tenant.primaryContact?.primaryEmailAddress}</td>
            <td>{tenant.status}</td>
            <td>
                
                <div className="buttons are-small">
                    <button className="button is-link" onClick={onViewTenant}>View Detail</button>
                    <button className="button is-warning" onClick={onEditTenant}>Edit</button>
                    <button className="button is-danger" onClick={() => { if (window.confirm('This action cannot be reversed! Are you sure you want to delete?')) onDeleteTenant() }}>Delete</button>
                </div>
                
            </td>
            
        </tr>
    );
}

export default Tenant;

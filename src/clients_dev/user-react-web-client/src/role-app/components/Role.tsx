/** This component is for displaying each item in the record, passed to it from RoleList */
import React, { useContext } from 'react';
import { IRole } from '../app.interfaces';
import { AppContext } from '../RoleApp';

type Props = {
    role: IRole,
}

const Role: React.FC<Props> = ({role}) => {

    //declare applicable contexts
    const appContext = useContext(AppContext);

    //callback function for delete button onClick event. We could have also embedded this function definition directly rather than define it first here
    const onDeleteRole = () => {
        appContext!.handleDeleteRole!(role.id, appContext!.currentRoles, appContext!.dispatch); ////notice here that we are invoking the handleDeleteRole() via appContext. The exclamation mark is because of the possible null which will not really happen
    };

    //callback function for edit button
    const onEditRole = () => {
        //appContext!.handleEditRole!(role.id, appContext!.dispatch); //notice here that we are invoking the handleEditRole() via appContext. The exclamation mark is because of the possible null which will not really happen
        appContext!.dispatch({ type: 'HandleEditRole', payload: {id: role.id} });
    };

    const onViewRole = () => {
        appContext!.dispatch({type: 'HandleViewRole', payload: {role}})
    }

    return (
        <tr>
            <td>{role.name}</td>
            <td>{role.description}</td>
            <td>{role.landlord? 'Yes' : 'No'}</td>
            <td>
                
                <div className="buttons are-small">
                    <button className="button is-link" onClick={onViewRole}>View Detail</button>
                    <button className="button is-warning" onClick={onEditRole}>Edit</button>
                    <button className="button is-danger" onClick={() => { if (window.confirm('This action cannot be reversed! Are you sure you want to delete?')) onDeleteRole() }}>Delete</button>
                </div>
                
            </td>
            
        </tr>
    );
}

export default Role;

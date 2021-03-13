/** This component is for displaying each item in the record, passed to it from UserList */
import React, { useContext } from 'react';
import { IUser } from '../app.interfaces';
import { AppContext } from '../UserApp';

type Props = {
    user: IUser,
}

const User: React.FC<Props> = ({user}) => {

    //declare applicable contexts
    const appContext = useContext(AppContext);

    //callback function for delete button onClick event. We could have also embedded this function definition directly rather than define it first here
    const onDeleteUser = () => {
        appContext!.handleDeleteUser!(user.id, appContext!.currentUsers, appContext!.dispatch); ////notice here that we are invoking the handleDeleteUser() via appContext. The exclamation mark is because of the possible null which will not really happen
    };

    //callback function for edit button
    const onEditUser = () => {
        //appContext!.handleEditUser!(user.id, appContext!.dispatch); //notice here that we are invoking the handleEditUser() via appContext. The exclamation mark is because of the possible null which will not really happen
        appContext!.dispatch({ type: 'HandleEditUser', payload: {id: user.id} });
    };

    const onViewUser = () => {
        appContext!.dispatch({type: 'HandleViewUser', payload: {user}})
    }

    return (
        <tr>
            <td>{user.firstName}</td>
            <td>{user.lastName}</td>
            <td>{user.commonName}</td>
            <td>{user.gender}</td>
            <td>{user.primaryEmailAddress}</td>
            <td>{user.landlord? 'Yes' : 'No'}</td>
            <td>
                
                <div className="buttons are-small">
                    <button className="button is-link" onClick={onViewUser}>View Detail</button>
                    <button className="button is-warning" onClick={onEditUser}>Edit</button>
                    <button className="button is-danger" onClick={() => { if (window.confirm('This action cannot be reversed! Are you sure you want to delete?')) onDeleteUser() }}>Delete</button>
                </div>
                
            </td>
            
        </tr>
    );
}

export default User;

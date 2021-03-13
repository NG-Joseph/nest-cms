import React from 'react';
import { IUser } from '../app.interfaces';
import User from './User';
import UserListHeader from './UserListHeader';


//declare type for Props passed to this 
type Props = {
    users: IUser[],
}

const UserList: React.FC<Props> = (props) => {

    //prepare users for display in a table
    let userListRows:any = null;
    
    userListRows = props.users.map((user) => {
        return <User user={user} key={user.id}/>
    })
    

    return (
        <table className="table is-striped is-narrow is-hoverable" >
            <caption><h3>Available users</h3></caption>
            <UserListHeader />
            <tbody>
                {userListRows}
            </tbody>
        </table>
    );
}

export default UserList;

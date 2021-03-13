import React from 'react';
import { IRole } from '../app.interfaces';
import Role from './Role';
import RoleListHeader from './RoleListHeader';


//declare type for Props passed to this 
type Props = {
    roles: IRole[],
}

const RoleList: React.FC<Props> = (props) => {

    //prepare roles for display in a table
    let roleListRows:any = null;
    
    roleListRows = props.roles.map((role) => {
        return <Role role={role} key={role.id}/>
    })
    

    return (
        <table className="table is-striped is-narrow is-hoverable" >
            <caption><h3>Available roles</h3></caption>
            <RoleListHeader />
            <tbody>
                {roleListRows}
            </tbody>
        </table>
    );
}

export default RoleList;

/** This component is for displaying each item in the record, passed to it from UserList */
import React, { useContext } from 'react';
import { IRole, ITenant, ITenantTeam, IUser } from '../app.interfaces';
import { AppContext } from '../UserApp';

type Props = {
    user: IUser,
}

type UserRolesDisplayProps = {
    role: IRole,
}

const UserRolesDisplay: React.FC<UserRolesDisplayProps> = ({ role }) => {
    return (
        <div className="columns">
            <div className="column">
                {role.name}
            </div>
        </div>
    )
}

type PrimaryContactForTenantDisplayProps = {
    tenant: ITenant,
}
const PrimaryContactForWhichTenantsDisplay: React.FC<PrimaryContactForTenantDisplayProps> = ({ tenant }) => {

    return (
        <div className="columns">
            <div className="column">
                {tenant.uniqueName}
            </div>
        </div>

    )
}

type TenantTeamMembershipsDisplayProps = {
    tenantTeam: ITenantTeam, //tenantteam contains roles and name of tenant
}
const TenantTeamMembershipsDisplay: React.FC<TenantTeamMembershipsDisplayProps> = ({ tenantTeam }) => {
    return (
        <div className="columns">
            <div className="column">
                {tenantTeam.tenantUniqueName}
            </div>
            <div className="column">
                <div>Roles:</div>
                {tenantTeam.roles!.map((role) => {//iterate through roles
                    return `${role} ` //display the role. TODO: make team membership role removable
                })}
            </div>
        </div>

    )
}



const ViewUser: React.FC<Props> = ({ user }) => {

    //declare applicable contexts
    const appContext = useContext(AppContext);

    //callback function for delete button onClick event. We could have also embedded this function definition directly rather than define it first here
    const onDeleteUser = () => {
        appContext!.handleDeleteUser!(user.id, appContext!.dispatch); ////notice here that we are invoking the handleDeleteUser() via appContext. The exclamation mark is because of the possible null which will not really happen
    };

    //callback function for edit button
    const onEditUser = () => {
        //appContext!.handleEditUser!(user.id, appContext!.dispatch); //notice here that we are invoking the handleEditUser() via appContext. The exclamation mark is because of the possible null which will not really happen
        appContext!.dispatch({ type: 'HandleEditUser', payload: { id: user.id } });
    };

    const onClickCloseButton = () => {
        appContext!.dispatch({ type: 'HandleCloseViewUser' })
    }

    return (
        <div className="modal modal-full-screen modal-fx-fadeInScale is-active">
            <div className="modal-background"></div>
            <div className="modal-content">
                <header className="modal-card-head">
                    <p className="modal-card-title">{`Details of ${user.firstName}`}</p>
                    <button className="delete" aria-label="close" onClick={onClickCloseButton} />
                </header>
                <section className="modal-card-body">
                    {/*<!-- Content ... -->*/}
                    <div className="columns">
                        <div className="column is-two-thirds">
                            <div className="columns">
                                <div className="column is-two-fifths">
                                    First name:
                                </div>
                                <div className="column">
                                    {user.firstName}
                                </div>
                            </div>
                            <div className="columns">
                                <div className="column is-two-fifths">
                                    Last name:
                                </div>
                                <div className="column">
                                    {user.lastName}
                                </div>
                            </div>
                            <div className="columns">
                                <div className="column is-two-fifths">
                                    Middle name:
                                </div>
                                <div className="column">
                                    {user.middleName}
                                </div>
                            </div>
                            <div className="columns">
                                <div className="column is-two-fifths">
                                    Common name:
                                </div>
                                <div className="column">
                                    {user.commonName}
                                </div>
                            </div>
                            <div className="columns">
                                <div className="column is-two-fifths">
                                    Gender:
                                </div>
                                <div className="column">
                                    {user.gender}
                                </div>
                            </div>
                            <div className="columns">
                                <div className="column is-two-fifths">
                                    Home address:
                                </div>
                                <div className="column">
                                    {user.homeAddress}
                                </div>
                            </div>
                            <div className="columns">
                                <div className="column is-two-fifths">
                                    Phone numbers:
                                </div>
                                <div className="column">
                                    <div className="columns">
                                        <div className="column">
                                            Office:
                                        </div>
                                        <div className="column">
                                            {user.phone!.office![0]}
                                        </div>
                                        <div className="column">
                                            {user.phone!.office![1]}
                                        </div>
                                    </div>
                                    <div className="columns">
                                        <div className="column">
                                            Mobile:
                                        </div>
                                        <div className="column">
                                            {user.phone!.mobile![0]}
                                        </div>
                                        <div className="column">
                                            {user.phone!.mobile![1]}
                                        </div>
                                    </div>
                                    <div className="columns">
                                        <div className="column">
                                            Home:
                                        </div>
                                        <div className="column">
                                            {user.phone!.home![0]}
                                        </div>
                                        <div className="column">
                                            {user.phone!.home![1]}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="columns">
                                <div className="column is-two-fifths">
                                    Nationality:
                                </div>
                                <div className="column">
                                    {user.nationality}
                                </div>
                            </div>
                            <div className="columns">
                                <div className="column is-two-fifths">
                                    State:
                                </div>
                                <div className="column">
                                    {user.state}
                                </div>
                            </div>
                            <div className="columns">
                                <div className="column is-two-fifths">
                                    Zip:
                                </div>
                                <div className="column">
                                    {user.zip}
                                </div>
                            </div>
                            <div className="columns">
                                <div className="column is-two-fifths">
                                    Landlord user?:
                                </div>
                                <div className="column">
                                    {user.landlord ? 'Yes' : 'No'}
                                </div>
                            </div>
                        </div>
                        <div className="column">
                            <div className="columns">
                                <div className="column">
                                    <div className="box">
                                        <h5>Photo</h5>
                                        <div className="columns">
                                            <div className="column">
                                                <img alt="user" src={`/v1/users/${user.id}/photo`} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="columns">
                                <div className="column">
                                    <div className="box">
                                        <h5>Assigned Roles</h5>
                                        <div className="columns">
                                            <div className="column">
                                                <div className="field">
                                                    {user.roles! && user.roles!.length > 0 ?
                                                        user.roles!.map((role) => { return <UserRolesDisplay role={role} /> }) :
                                                        <div>No roles assigned to user yet</div>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {!user.landlord &&
                                <div className="columns">
                                    <div className="column">
                                        <div className="box">
                                            <h5 className="label">Primary contact for</h5>
                                            <div className="columns">
                                                <div className="column">
                                                    <div className="field">
                                                        {user.primaryContactForWhichTenants! && user.primaryContactForWhichTenants!.length > 0 ?
                                                            user.primaryContactForWhichTenants!.map((tenant) => { return <PrimaryContactForWhichTenantsDisplay tenant={tenant} /> }) :
                                                            <div>Not a primary contact for any tenant</div>}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            }
                            {!user.landlord &&
                                <div className="columns">
                                    <div className="column">
                                        <div className="box">
                                            <h5>Tenant Team Membership for</h5>
                                            <div className="columns">
                                                <div className="column">
                                                    <div className="field">
                                                        {user.tenantTeamMemberships! && user.tenantTeamMemberships!.length > 0 ?
                                                            user.tenantTeamMemberships!.map((tenantTeam) => { return <TenantTeamMembershipsDisplay tenantTeam={tenantTeam} /> }) :
                                                            <div>Not a team member of any tenant</div>}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            }
                        </div>
                    </div>

                </section>
                <footer className="modal-card-foot">
                    <div className="buttons are-small">
                        <button className="button is-warning" onClick={onEditUser}>Edit</button>
                        <button className="button is-danger" onClick={() => { if (window.confirm('This action cannot be reversed! Are you sure you want to delete?')) onDeleteUser() }}>Delete</button>
                    </div>
                </footer>
            </div>
        </div>
    );
}

export default ViewUser;

/** This component is for displaying each user in the record, passed to it from UserList */
import React, { useEffect, useState } from 'react';
import { DEFAULT_ACTION_BUTTON_STATE } from '../../global/app.settings';
import { Gender, IAction, IEditUserState, IRole, ITenant, ITenantTeam, IUser, TenantTeamRole } from '../app.interfaces';
import { RelationsHandlers } from '../crud-handlers/update/relations-handlers';
//Below is for role select control. Requires npm install react-select @types/react-select
//import Select from 'react-select'; //I am handling multiple select the raw javascript way for now

//create the type for the anticipated props to be passed from parent component UserApp
type Props = {
    user: IUser,
    handleUpdateUser: Function,
    currentUsers: IUser[],
    dispatch: React.Dispatch<IAction>
}

//Below is for User roles display. Could have been in another file
type UserRolesDisplayProps = {
    role: IRole,
    state: IEditUserState,
    setState: React.Dispatch<React.SetStateAction<IEditUserState>>
}

//This could be in an entirely different file
const UserRolesDisplay: React.FC<UserRolesDisplayProps> = ({ role, state, setState }) => {

    const removeRoleFromUser = (roleId: number) => {
        //TODO: Here, I will have to invoke the static method in relationsHandlers
        RelationsHandlers.removeRoleFromUser(roleId, state, setState);
    }

    return (
        <div className="columns">
            <div className="column">
                <button className={state.relations.userRoles.deleteButtonState} onClick={() => { if (window.confirm('This action cannot be reversed! Are you sure you want to delete?')) removeRoleFromUser(role.id!) }}></button>
                {role.name}
            </div>
        </div>

    )
}

//Below is for User primary contact for tenants display. Could have been in another file
type PrimaryContactForTenantDisplayProps = {
    tenant: ITenant,
    state: IEditUserState,
    setState: React.Dispatch<React.SetStateAction<IEditUserState>>
}
const PrimaryContactForWhichTenantsDisplay: React.FC<PrimaryContactForTenantDisplayProps> = ({ tenant, state, setState }) => {
    const removeAsPrimaryContactForATenantByTenantId = (tenantId: number) => {
        RelationsHandlers.removeAsPrimaryContactForATenantByTenantId(tenantId, state, setState);
    }

    return (
        <div className="columns">
            <div className="column">
                <button className={state.relations.primaryContactForWhichTenants.deleteButtonState} onClick={() => { if (window.confirm('This action cannot be reversed! Are you sure you want to delete?')) removeAsPrimaryContactForATenantByTenantId(tenant.id!) }}></button>
                {tenant.uniqueName}
            </div>
        </div>

    )
}
//TODO type for TenantTeamMembershipsDisplayProps
//Below is for User primary contact for tenants display. Could have been in another file
type TenantTeamMembershipsDisplayProps = {
    tenantTeam: ITenantTeam, //tenantteam contains roles and name of tenant
    state: IEditUserState,
    setState: React.Dispatch<React.SetStateAction<IEditUserState>>
}
const TenantTeamMembershipsDisplay: React.FC<TenantTeamMembershipsDisplayProps> = ({ tenantTeam, state, setState }) => {
    const deleteTenantTeamMemberShipById = (tenantId: number) => {
        RelationsHandlers.deleteTenantTeamMemberShipById(tenantId, state, setState);
    }

    return (
        <div className="columns">
            <div className="column">
                <button className={state.relations.tenantTeamMemberships.deleteButtonState} onClick={() => { if (window.confirm('This action cannot be reversed! Are you sure you want to delete?')) deleteTenantTeamMemberShipById(tenantTeam.tenantUniqueId!) }}></button>
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


//main component here
const EditUser: React.FC<Props> = ({ user, handleUpdateUser, currentUsers, dispatch }) => {

    const initialState: IEditUserState = {
        user: {
            id: user.id,
            landlord: user.landlord,
            firstName: user.firstName,
            middleName: user.middleName,
            lastName: user.lastName,
            commonName: user.commonName,
            homeAddress: user.homeAddress,
            gender: user.gender,
            dateOfBirth: user.dateOfBirth,
            nationality: user.nationality,
            stateOfOrigin: user.stateOfOrigin,
            zip: user.zip,
            isActive: user.isActive,
            primaryEmailAddress: user.primaryEmailAddress,
            backupEmailAddress: user.backupEmailAddress,
            //passwordSalt: '',
            //passwordHash: user.passwordHash,
            isPasswordChangeRequired: user.isPasswordChangeRequired,
            phone: user.phone || { mobile: [], office: [], home: [] }, //in case phone is null, the || is used for alternative so that the render does not fail as it references the inner arrays
            /* fields involving after creation, at edit time. */
            photo: user.photo,
            photoMimeType: user.photoMimeType,
            isPrimaryEmailAddressVerified: user.isPrimaryEmailAddressVerified,
            isBackupEmailAddressVerified: user.isBackupEmailAddressVerified,
            //resetPasswordToken: '',
            //resetPasswordExpiration: new Date(),
            //primaryEmailVerificationToken: '',
            //backupEmailVerificationToken: '',
            //emailVerificationTokenExpiration: new Date(),
            otpEnabled: user.otpEnabled,
            //otpSecret: '',
            roles: user.roles,
            primaryContactForWhichTenants: user.primaryContactForWhichTenants,
            tenantTeamMemberships: user.tenantTeamMemberships,
            accountOfficerForWhichTenants: user.accountOfficerForWhichTenants
        },
        relations: {//line up relations related state variables here
            assignableRoles: [], //for the roles drop down for add roles
            tenants: [], //for the tenants drop down for associating with tenants. May not use this because the tenant list could be too long. Better to enter name and let the server find it and associate.
            photo: { //all about photo upload and img src.
                fileToUpload: "",
                uploadButtonState: "",
                alert: {
                    show: false,
                    type: undefined,
                    message: ""
                },
                src: `/v1/users/${user.id}/photo`,
            },
            userRoles: { //for user roles to be added to user
                rolesToAdd: [], //this is for adding one or more roles to user
                submitButtonState: DEFAULT_ACTION_BUTTON_STATE,
                deleteButtonState: 'delete'
            },
            primaryContactForWhichTenants: {
                submitButtonState: DEFAULT_ACTION_BUTTON_STATE,
                deleteButtonState: 'delete'
            },
            tenantTeamMemberships: {
                submitButtonState: DEFAULT_ACTION_BUTTON_STATE,
                deleteButtonState: 'delete',
            }
        }

    }

    //declare the state variables involved in component
    const [state, setState] = useState<IEditUserState>({ ...initialState });

    //create a general onChange event handler for form inputs that fire onChange event
    //See https://reactjs.org/docs/events.html? for all kinds of events that can be handled in react
    const onChange = (event: React.FormEvent) => {
        const currentUser = state.user;//check out user in state as is
        //modify element in the state which has the same name as the input that fired this event. Pass the new value
        const target: HTMLInputElement | HTMLSelectElement = event.target as HTMLInputElement | HTMLSelectElement; //as is used here to cast
        currentUser[target.name] = target.value;
        setState({ ...state, user: currentUser });//checkin the modified user state
    }

    //function to handle user form onSubmit event
    const onSubmit = (event: React.FormEvent) => {
        event.preventDefault();//do not do the default form submit to the server
        handleUpdateUser(state.user, currentUsers, dispatch);//call the handleUpdateUser function passed via props.
    }

    //function to handle user form onCancel
    const onCancel = () => {
        //dispatch to state
        dispatch({ type: 'HandleCancelUpdate' })
    }

    const handleLandlordCheckbox = () => {
        //toggle choice in state
        const landlord = state.user.landlord ? false : true
        setState({ ...state, user: { ...state.user, landlord } })
    }

    const officePhone1Change = (event: React.FormEvent) => {
        const currentUser = state.user;//check out user in state as is
        const target: HTMLInputElement | HTMLSelectElement = event.target as HTMLInputElement | HTMLSelectElement; //as is used here to cast
        currentUser.phone!.office![0] = target.value;
        setState({ ...state, user: currentUser })
    }

    const officePhone2Change = (event: React.FormEvent) => {
        const currentUser = state.user;//check out user in state as is
        const target: HTMLInputElement | HTMLSelectElement = event.target as HTMLInputElement | HTMLSelectElement; //as is used here to cast
        currentUser.phone!.office![1] = target.value;
        setState({ ...state, user: currentUser })
    }

    const mobilePhone1Change = (event: React.FormEvent) => {
        const currentUser = state.user;//check out user in state as is
        const target: HTMLInputElement | HTMLSelectElement = event.target as HTMLInputElement | HTMLSelectElement; //as is used here to cast
        currentUser.phone!.mobile![0] = target.value;
        setState({ ...state, user: currentUser })
    }

    const mobilePhone2Change = (event: React.FormEvent) => {
        const currentUser = state.user;//check out user in state as is
        const target: HTMLInputElement | HTMLSelectElement = event.target as HTMLInputElement | HTMLSelectElement; //as is used here to cast
        currentUser.phone!.mobile![1] = target.value;
        setState({ ...state, user: currentUser })
    }

    const homePhone1Change = (event: React.FormEvent) => {
        const currentUser = state.user;//check out user in state as is
        const target: HTMLInputElement | HTMLSelectElement = event.target as HTMLInputElement | HTMLSelectElement; //as is used here to cast
        currentUser.phone!.home![0] = target.value;
        setState({ ...state, user: currentUser })
    }

    const homePhone2Change = (event: React.FormEvent) => {
        const currentUser = state.user;//check out user in state as is
        const target: HTMLInputElement | HTMLSelectElement = event.target as HTMLInputElement | HTMLSelectElement; //as is used here to cast
        currentUser.phone!.home![1] = target.value;
        setState({ ...state, user: currentUser })
    }

    const onPhotoChange = (event: any) => {
        //setRelationsState({ ...relationsState, photo: { ...relationsState.photo, fileToUpload: event.target.files[0] } })
        setState({ ...state, relations: { ...state.relations, photo: { ...state.relations.photo, fileToUpload: event.target.files[0] } } })
    }

    const onPhotoSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        const data = new FormData();
        data.append('file', state.relations.photo.fileToUpload);
        RelationsHandlers.submitPhoto(state.user.id!, data, state, setState);
    }

    /* Add and remove roles section */
    const onAddRolesChange = async (event: React.FormEvent) => {
        event.preventDefault();
        let target: any = document.getElementById('add-roles');
        let roleIds = [];
        let options = target && target.options;

        for (const option of options) {
            if (option.selected) {
                roleIds.push(option.value)
            }
        }

        setState({ ...state, relations: { ...state.relations, userRoles: { ...state.relations.userRoles, rolesToAdd: roleIds } } });

    }

    const onAddRolesSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        RelationsHandlers.addRolesById(user.id!, state.relations.userRoles.rolesToAdd!, state, setState);
    }

    /* Add and remove primary contact for which tenants section */

    const onAddPrimaryContactForWhichTenantsChange = async (event: React.FormEvent) => {
        event.preventDefault();
        const target: HTMLInputElement | HTMLSelectElement = event.target as HTMLInputElement | HTMLSelectElement; //as is used here to cast
        //set in state the uniqueName of tenant to find and add
        setState({
            ...state,
            relations: {
                ...state.relations,
                primaryContactForWhichTenants: { ...state.relations.primaryContactForWhichTenants, uniqueNameOfTenantToAdd: target.value }
            }
        })
    }

    const onAddPrimaryContactForWhichTenantsSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        //invoke the handler
        RelationsHandlers.setAsPrimaryContactForATenantByTenantUniqueName(state.relations.primaryContactForWhichTenants.uniqueNameOfTenantToAdd!, state, setState);
    }

    /* Add and remove tenant teams for which tenants section */

    const onAddTenantTeamMembershipUniqueNameChange = async (event: React.FormEvent) => {
        event.preventDefault();
        const target: HTMLInputElement | HTMLSelectElement = event.target as HTMLInputElement | HTMLSelectElement; //as is used here to cast
        //set in state the uniqueName of tenant to find and add
        setState({
            ...state,
            relations: {
                ...state.relations,
                tenantTeamMemberships: { ...state.relations.tenantTeamMemberships, uniqueNameOfTenantToAdd: target.value }
            }
        })
    }

    /* Add and remove roles section */
    const onAddTenantTeamMembershipRolesChange = async (event: React.FormEvent) => {
        event.preventDefault();
        let target: any = document.getElementById('add-tenant-team-roles');
        let roles: TenantTeamRole[] = [];
        let options = target && target.options;

        for (const option of options) {
            if (option.selected) {
                roles.push(option.value)
            }
        }
        setState({ ...state, relations: { ...state.relations, tenantTeamMemberships: { ...state.relations.tenantTeamMemberships, rolesToAdd: roles } } });
    }

    const onAddTenantTeamMembershipSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        //invoke the handler
        RelationsHandlers.setTenantTeamMembershipByTenantUniqueName(
            state.relations.tenantTeamMemberships.uniqueNameOfTenantToAdd!,
            state.relations.tenantTeamMemberships.rolesToAdd!,
            state,
            setState);
    }


    useEffect(() => {

        //load roles needed for roles dropdown. This should include all roles excluding those the user already has
        //alert('useEffect called');
        RelationsHandlers.getAssignableRoles(state, setState)
        // eslint-disable-next-line
    }, [state.user.roles, state.user.landlord]);//call whenever user role  or landlord state changes


    //prepare TenantTeamRole enum list
    const tenantTeamRoleEnumValues = () => {
        //iterate through the enum TenantTeamRole and get the values
        let values: JSX.Element[] = [];

        for (const value of Object.values(TenantTeamRole)) {
            values.push(<option value={value}>{value}</option>)
        }
        /* Below will also work
        Object.values(TenantTeamRole).forEach((value) => {
            values.push( <option value={value}>{value}</option>)
        });
        */
        return values

    }
    //Note where the above functions are used below within the return statement
    return (
        <div className="columns is
        -mobile">
            <div className="column is-two-thirds">
                <form onSubmit={onSubmit}>
                    <div className="box">
                        <div className="columns is-mobile">
                            <h2>Edit User</h2>
                        </div>
                        <div className="columns is-mobile">
                            <div className="column">
                                <div className="box">
                                    <div className="field">
                                        <label className="label">Landlord?</label>
                                        <div className="control">
                                            <input type="checkbox" name="landlord" value="" checked={state.user.landlord} onChange={handleLandlordCheckbox} />
                                        </div>
                                    </div>
                                    <div className="field is-horizontal">
                                        <div className="field-body">
                                            <div className="field">
                                                <label className="label">Primary Email Address</label>
                                                <div className="control">
                                                    <input name="primaryEmailAddress" className="input" type="email" placeholder="Enter valid email here" maxLength={30} value={state.user.primaryEmailAddress} onChange={onChange} required />
                                                </div>
                                                <p className="help">The email address should not be more than 30 letters</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="field">
                                        <label className="label">First Name</label>
                                        <div className="control">
                                            <input name="firstName" className="input" type="text" placeholder="Enter first name here" maxLength={30} value={state.user.firstName} onChange={onChange} required />
                                        </div>
                                        <p className="help">The first name should not be more than 30 letters</p>
                                    </div>
                                    <div className="field">
                                        <label className="label">Last Name</label>
                                        <div className="control">
                                            <input name="lastName" className="input" type="text" placeholder="Enter last name here" maxLength={30} value={state.user.lastName} onChange={onChange} required />
                                        </div>
                                        <p className="help">The last name should not be more than 30 letters</p>
                                    </div>
                                    <div className="field">
                                        <label className="label">Middle Name</label>
                                        <div className="control">
                                            <input name="middleName" className="input" type="text" placeholder="Enter middle name here" maxLength={30} value={state.user.middleName} onChange={onChange} />
                                        </div>
                                        <p className="help">Even though optional, it is advisable to enter middle name</p>
                                    </div>
                                    <div className="field">
                                        <label className="label">Common Name</label>
                                        <div className="control">
                                            <input name="commonName" className="input" type="text" placeholder="Enter common name here" maxLength={20} value={state.user.commonName} onChange={onChange} />
                                        </div>
                                        <p className="help">What is the user commonly called. The common name should not be more than 20 letters</p>
                                    </div>
                                    <div className="field">
                                        <label className="label">Gender</label>
                                        <div className="control">
                                            <div className="select">
                                                <select name="gender" value={state.user.gender} onChange={onChange}>
                                                    <option value="notSelected">Select Gender</option>
                                                    <option value={Gender.F}>Female</option>
                                                    <option value={Gender.M}>Male</option>
                                                </select>
                                            </div>
                                        </div>
                                        <p className="help">Select the Gender</p>
                                    </div>
                                    <div className="field">
                                        <label className="label">Date of Birth: {new Date(state.user.dateOfBirth!).toLocaleDateString("en-GB")}</label>
                                        <div className="control">
                                            <input name="dateOfBirth" id="dateOfBirth" className="input" type="date"
                                                pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}" max={new Date().toLocaleString()} value={state.user.dateOfBirth?.toLocaleString()} onChange={onChange} />
                                        </div>
                                        <p className="help">The date of birth of the user. Pattern of entry is YYYY-MM-DD</p>
                                    </div>
                                    <div className="field">
                                        <label className="label">Home Address</label>
                                        <div className="control">
                                            <textarea name="homeAddress" className="input" rows={6} placeholder="Enter home address here" maxLength={100} value={state.user.homeAddress} onChange={onChange}></textarea>
                                        </div>
                                        <p className="help">The home address should not be more than 100 letters</p>
                                    </div>
                                    <div className="field is-horizontal">
                                        <div className="field-label is-normal">
                                            <label className="label">Phone numbers</label>
                                        </div>
                                        <div className="field-body">
                                            <div className="control">
                                                <label className="label">Office</label>
                                                <input name="office-phone1" className="input" type="text" placeholder="Enter office phone 1 here" maxLength={10} value={state.user.phone!.office![0]} onChange={officePhone1Change} />
                                                <input name="office-phone2" className="input" type="text" placeholder="Enter office phone 2 here" maxLength={10} value={state.user.phone!.office![1]} onChange={officePhone2Change} disabled={state.user.phone!.office![0] === undefined || state.user.phone!.office![0] === '' ? true : false} />
                                            </div>
                                            <div className="control">
                                                <label className="label">Mobile</label>
                                                <input name="mobile-phone1" className="input" type="text" placeholder="Enter mobile phone 1 here" maxLength={10} value={state.user.phone!.mobile![0]} onChange={mobilePhone1Change} />
                                                <input name="mobile-phone2" className="input" type="text" placeholder="Enter mobile phone 2 here" maxLength={10} value={state.user.phone!.mobile![1]} onChange={mobilePhone2Change} disabled={state.user.phone!.mobile![0] === undefined || state.user.phone!.mobile![0] === '' ? true : false} />
                                            </div>
                                            <div className="control">
                                                <label className="label">Home</label>
                                                <input name="home-phone1" className="input" type="text" placeholder="Enter home phone 1 here" maxLength={10} value={state.user.phone!.home![0]} onChange={homePhone1Change} />
                                                <input name="home-phone2" className="input" type="text" placeholder="Enter home phone 2 here" maxLength={10} value={state.user.phone!.home![1]} onChange={homePhone2Change} disabled={state.user.phone!.home![0] === undefined || state.user.phone!.home![0] === '' ? true : false} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="field">
                                        <label className="label">Nationality</label>
                                        <div className="control">
                                            <input name="nationality" className="input" type="text" placeholder="Enter nationality here" maxLength={30} value={state.user.nationality} onChange={onChange} />
                                        </div>
                                        <p className="help">The nationality should not be more than 30 letters</p>
                                    </div>

                                    <div className="field">
                                        <label className="label">State</label>
                                        <div className="control">
                                            <input name="stateOfOrigin" className="input" type="text" placeholder="Enter state here" maxLength={30} value={state.user.stateOfOrigin} onChange={onChange} />
                                        </div>
                                        <p className="help">The state should not be more than 30 letters</p>
                                    </div>

                                    <div className="field">
                                        <label className="label">Zip code</label>
                                        <div className="control">
                                            <input name="zip" className="input" type="text" placeholder="Enter zip code here" maxLength={6} value={state.user.zip} onChange={onChange} />
                                        </div>
                                        <p className="help">The zip code should not be more than 6 letters</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="columns is-mobile">
                            <div className="field is-grouped">
                                <div className="control">
                                    <button className="button is-link">Submit</button>
                                </div>
                                <div className="control">
                                    <button className="button is-link is-light" onClick={onCancel}>Cancel</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
            <div className="column">
                <div className="columns">
                    <div className="column">
                        <div className="box">
                            <h5>Photo</h5>
                            <div className="columns">
                                <div className="column">
                                    <img alt="user" src={`${state.relations.photo!.src}`} />
                                </div>
                            </div>
                            <form className="columns" onSubmit={onPhotoSubmit}>
                                <div className="column">
                                    <div className="box">
                                        <h6>Upload photo</h6>
                                        <div className="field">

                                            <div className="control">
                                                <input type="file" name="file" onChange={onPhotoChange} required />
                                            </div>
                                        </div>
                                        <div className="field">
                                            {state.relations.photo.alert && alert}
                                        </div>
                                        <div className="field control">
                                            <button className={`button is-link is-small ${state.relations.photo.uploadButtonState}`} type="submit" >Submit</button>
                                        </div>
                                    </div>
                                </div>
                            </form>
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
                                        {state.user.roles! && state.user.roles!.length > 0 ?
                                            state.user.roles!.map((role) => { return <UserRolesDisplay role={role} state={state} setState={setState} /> }) :
                                            <div>No roles assigned to user yet</div>}
                                    </div>
                                </div>
                            </div>
                            {state.relations.assignableRoles!.length > 0 &&
                                <form className="columns" onSubmit={onAddRolesSubmit}>
                                    <div className="column">
                                        <div className="box">
                                            <h6>Add roles</h6>
                                            <div className="field">
                                                <select name="roles" id="add-roles" multiple className="control" onChange={onAddRolesChange} style={{minWidth: '50%'}}>
                                                    {state.relations.assignableRoles!.map((role) => {
                                                        return <option value={role.id}>{role.name}</option>
                                                    })}
                                                </select>
                                            </div>
                                            <div className="field control">
                                                <button className={`button is-link is-small ${state.relations.userRoles.submitButtonState}`} type="submit" >Submit</button>
                                            </div>
                                        </div>
                                    </div>
                                </form>}
                        </div>
                    </div>
                </div>
                {!state.user.landlord &&
                    <div className="columns">
                        <div className="column">
                            <div className="box">
                                <h5 className="label">Primary contact for</h5>
                                <div className="columns">
                                    <div className="column">
                                        <div className="field">
                                            {state.user.primaryContactForWhichTenants! && state.user.primaryContactForWhichTenants!.length > 0 ?
                                                state.user.primaryContactForWhichTenants!.map((tenant) => { return <PrimaryContactForWhichTenantsDisplay tenant={tenant} state={state} setState={setState} /> }) :
                                                <div>Not a primary contact for any tenant</div>}
                                        </div>
                                    </div>
                                </div>
                                <form className="columns" onSubmit={onAddPrimaryContactForWhichTenantsSubmit}>
                                    <div className="column">
                                        <div className="box">
                                            <h6 className="label">Add tenant</h6>
                                            <div className="field">
                                                <label className="label">Unique tenant name:</label>
                                                <input className="control" type="text" name="uniqueName" placeholder="Unique name here" onChange={onAddPrimaryContactForWhichTenantsChange} />
                                            </div>
                                            <div className="field control">
                                                <button className={`button is-link is-small ${state.relations.primaryContactForWhichTenants.submitButtonState}`} type="submit" >Submit</button>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                }
                {!state.user.landlord &&
                    <div className="columns">
                        <div className="column">
                            <div className="box">
                                <h5>Tenant Team Membership for</h5>
                                <div className="columns">
                                    <div className="column">
                                        <div className="field">
                                            {state.user.tenantTeamMemberships! && state.user.tenantTeamMemberships!.length > 0 ?
                                                state.user.tenantTeamMemberships!.map((tenantTeam) => { return <TenantTeamMembershipsDisplay tenantTeam={tenantTeam} state={state} setState={setState} /> }) :
                                                <div>Not a team member of any tenant</div>}
                                        </div>
                                    </div>
                                </div>
                                <form className="columns" onSubmit={onAddTenantTeamMembershipSubmit}>
                                    <div className="column">
                                        <div className="box">
                                            <h6>Add tenant</h6>
                                            <div className="field">
                                                <label className="label">Unique tenant name:</label>
                                                <input className="control" type="text" name="uniqueName" placeholder="Unique name here" onChange={onAddTenantTeamMembershipUniqueNameChange} />
                                            </div>
                                            <div className="field">
                                                <label className="label">Roles as a team member:</label>
                                                <select name="add-tenant-team-roles" id="add-tenant-team-roles" multiple className="control" style={{minWidth: '50%'}} onChange={onAddTenantTeamMembershipRolesChange}>
                                                    {tenantTeamRoleEnumValues()}
                                                </select>
                                            </div>
                                            <div className="field control">
                                                <button className={`button is-link is-small ${state.relations.tenantTeamMemberships.submitButtonState}`} type="submit" >Submit</button>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                }
                {state.user.landlord &&
                    <div className="columns">
                        <div className="column">
                            <div className="box">
                                <div className="field">
                                    <label className="label">Account Officer For:</label>
                                    {state.user.accountOfficerForWhichTenants! && state.user.accountOfficerForWhichTenants!.length > 0 ? state.user.accountOfficerForWhichTenants!.entries : <div>Not an account officer</div>}
                                    <div className="control">
                                        <button onClick={() => { alert('Yet to be implemented'); return false }} className="button is-link is-small">Make an account officer</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>}

            </div>
        </div>
    );
}

export default EditUser;

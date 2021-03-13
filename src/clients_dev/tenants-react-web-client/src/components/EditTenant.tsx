/** This component is for displaying each tenant in the record, passed to it from TenantList */
import React, { useState } from 'react';
import { IAction, ITenant, TenantStatus } from '../app.interfaces';

//create the type for the anticipated props to be passed from parent component
type Props = {
    tenant: ITenant,
    handleUpdateTenant: Function,
    dispatch: React.Dispatch<IAction>
}

const EditTenant: React.FC<Props> = (props) => {

    const initialTenantState: ITenant = {
        id: props.tenant.id,
        uniqueName: props.tenant.uniqueName,
        address: props.tenant.address,
        moreInfo: props.tenant.moreInfo,
        status: props.tenant.status,
        customURLSlug: props.tenant.customURLSlug,
        dateOfRegistration: props.tenant.dateOfRegistration,
        active: props.tenant.active,
        uniqueSchema: props.tenant.uniqueSchema,
        primaryContact: props.tenant.primaryContact,
        teamMembers: props.tenant.teamMembers,
        tenantAccountOfficers: props.tenant.tenantAccountOfficers,
        connectionResource: props.tenant.connectionResource,
        customTheme: props.tenant.customTheme,
    }

    //declare the state variable for tenant to be added from form. Notice that we are using an object containing the individual elements
    //We need to interact with them individually as state variable that will change in response to input onChange 
    const [tenant, setTenant] = useState<ITenant>({ ...initialTenantState });

    //create a general onChange event handler for form inputs that fire onChange event
    //See https://reactjs.org/docs/events.html? for all kinds of events that can be handled in react
    const onChange = (event: React.FormEvent) => {
        const tenantState = tenant;//check out tenant in state as is
        //modify element in the state which has the same name as the input that fired this event. Pass the new value
        const target: HTMLInputElement | HTMLSelectElement = event.target as HTMLInputElement | HTMLSelectElement; //as is used here to cast
        tenantState[target.name] = target.value;
        setTenant({ ...tenantState });//checkin the modified state
    }

    //function to handle form onSubmit event
    const onSubmit = (event: React.FormEvent) => {
        event.preventDefault();//do not do the default form submit to the server
        props.handleUpdateTenant(tenant, props.dispatch);//call the handleAddTenant function passed via props.
    }

    //function to handle form onCancel
    const onCancel = () => {
        //props.handleCancelUpdate(props.dispatch);//call the function handleCancelAdd passed via props
        //simply set state to make displayUpdate disappear
        props.dispatch({ type: 'HandleCancelUpdate' });
    }

    //prepare team members to show (one to many)
    const teamMembers: any =
        tenant.teamMembers!.forEach((teamMember, index) => {
            return (
                <div className="columns">
                    <tr>
                        <td>{index}</td>
                        <td>{teamMember.user!.primaryEmailAddress}</td>
                        <td>{teamMember.user!.firstName}</td>
                        <td>{teamMember.user!.lastName}</td>
                        <td>{teamMember.user!.primaryEmailAddress}</td>
                        <td>{teamMember.roles!.toString()}</td>
                        <td>
                            <div className="buttons are-small">
                                <button className="button is-link" onClick={() => { alert('Yet to be implemented'); return false }}>View Detail</button>
                                <button className="button is-warning" onClick={() => { alert('Yet to be implemented'); return false }}>Edit</button>
                                <button className="button is-danger" onClick={() => { alert('Yet to be implemented'); return false }}>Delete</button>
                            </div>

                        </td>
                    </tr>
                </div>
            )
        })

    //prepare tenant account officers to show (one to many)
    const tenantAccountOfficers: any =
        tenant.tenantAccountOfficers!.forEach((tenantAccountOfficer, index) => {
            return (
                <div className="columns">
                    <tr>
                        <td>{index}</td>
                        <td>{tenantAccountOfficer.user!.primaryEmailAddress}</td>
                        <td>{tenantAccountOfficer.user!.firstName}</td>
                        <td>{tenantAccountOfficer.user!.lastName}</td>
                        <td>{tenantAccountOfficer.user!.primaryEmailAddress}</td>
                        <td>{tenantAccountOfficer.roles!.toString()}</td>
                        <td>
                            <div className="buttons are-small">
                                <button className="button is-link" onClick={() => { alert('Yet to be implemented'); return false }}>View Detail</button>
                                <button className="button is-warning" onClick={() => { alert('Yet to be implemented'); return false }}>Edit</button>
                                <button className="button is-danger" onClick={() => { alert('Yet to be implemented'); return false }}>Delete</button>
                            </div>

                        </td>
                    </tr>
                </div>
            )
        })

    //Note where the above functions are used below within the return statement
    return (
        <div className="columns is-mobile">
            <div className="column">
                <form onSubmit={onSubmit}>
                    <div className="box">
                        <div className="columns is-mobile">
                            <h2>Edit Tenant</h2>
                        </div>
                        <div className="columns is-mobile">
                            <div className="column">
                                <div className="box">
                                    <div className="field">
                                        <label className="label">Unique Name</label>
                                        <div className="control">
                                            <input className="input" type="text" placeholder="Unique name input" name="uniqueName" value={tenant.uniqueName} onChange={onChange} required />
                                        </div>
                                    </div>
                                    <div className="field">
                                        <label className="label">Address</label>
                                        <div className="control">
                                            <input className="input" type="text" placeholder="Address input" name="address" value={tenant.address} onChange={onChange} required />
                                        </div>
                                    </div>
                                    <div className="field">
                                        <label className="label">More Information</label>
                                        <div className="control">
                                            <textarea className="input" placeholder="More information input" rows={10} name="moreInfo" value={tenant.moreInfo} onChange={onChange} />
                                        </div>
                                    </div>
                                    <div className="select">
                                        <select name="status" onChange={onChange} value={tenant.status}>
                                            <option value="notSelected">Select tenant status</option>
                                            <option value={TenantStatus.A}>Active</option>
                                            <option value={TenantStatus.O}>Owing</option>
                                            <option value={TenantStatus.S}>Suspended</option>
                                        </select>
                                    </div>
                                    <div className="field">
                                        <label className="label">Date of Registration: {new Date (tenant.dateOfRegistration!).toLocaleDateString("en-GB")}</label>
                                        <div className="control">
                                            <input className="input" type="date" required pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}" max="{{todaysDate}}" placeholder="Date of registration" name="dateOfRegistration" onChange={onChange} />
                                        </div>
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
                    <form className="column">
                        <div className="box">
                            <div className="field">
                                <label className="label">Change Primary Contact:</label>
                                <div className="control">
                                    <input name="primaryEmailAddress" className="input" type="text" placeholder="Enter valid email here" maxLength={30} value={tenant.primaryContact!.primaryEmailAddress} required />
                                </div>
                                <p className="help">The email address should not be more than 30 letters</p>
                            </div>
                            <div className="control">
                                <button onClick={() => { alert('Yet to be implemented'); return false }} className="button is-link is-small">Submit</button>
                            </div>
                        </div>
                    </form>
                </div>
                <div className="columns">
                    <form className="column">
                        <div className="box">
                            <div className="field">
                                <label className="label">Change Team Members:</label>
                                {tenant.teamMembers!.length > 0 ? teamMembers : <div>No team members yet</div>}
                                <div className="control">
                                    <button onClick={() => { alert('Yet to be implemented'); return false }} className="button is-link is-small">Add New</button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
                <div className="columns">
                    <form className="column">
                        <div className="box">
                            <div className="field">
                                <label className="label">Change Account Officers:</label>
                                {tenant.tenantAccountOfficers!.length > 0 ? tenantAccountOfficers : <div>No account officers yet</div>}
                                <div className="control">
                                    <button onClick={() => { alert('Yet to be implemented'); return false }} className="button is-link is-small">Add New</button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default EditTenant;

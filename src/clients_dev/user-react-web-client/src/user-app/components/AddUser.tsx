/** This component is for displaying each user in the record, passed to it from UserList */
import React, { useState } from 'react';
import { Gender, IAction, IUser } from '../app.interfaces';

//create the type for the anticipated props to be passed from parent component
type Props = {
    handleCreateUser: Function,
    currentUsers: IUser[],
    dispatch: React.Dispatch<IAction>
}

type IState = {
    user: IUser
}

const AddUser: React.FC<Props> = (props) => {

    const initialState: IState = {
        /*
        user: {
            //fields for first page of add new.
            landlord: false,
            firstName: '',
            middleName: '',
            lastName: '',
            commonName: '',
            homeAddress: '',
            gender: Gender.F,
            dateOfBirth: new Date(),
            nationality: '',
            stateOfOrigin: '',
            zip: '',
            isActive: true,
            primaryEmailAddress: '',
            backupEmailAddress: '',
            //passwordSalt: '',
            passwordHash: '',
            isPasswordChangeRequired: false,
            phone: { mobile: [], office: [], home: [] },
            /* fields involving after creation, at edit time. Hence commented out
            photo: undefined,
            photoMimeType: '',
            isPrimaryEmailAddressVerified: false,
            isBackupEmailAddressVerified: false,
            resetPasswordToken: '',
            resetPasswordExpiration: new Date(),
            primaryEmailVerificationToken: '',
            backupEmailVerificationToken: '',
            emailVerificationTokenExpiration: new Date(),
            otpEnabled: false,
            otpSecret: '',
            roles: [],
            primaryContactForWhichTenants: [],
            tenantTeamMemberships: [],
            accountOfficerForWhichTenants: []
            */

        //}
        user:{
            //Not really necessary to put all except the fields that have children to be referenced in form
            phone:{
                office:[], 
                mobile:[], 
                home:[]
            },
            roles: []
        }

    }

    //declare the state variable for user to be added from form. Notice that we are using an object containing the individual elements
    //We need to interact with them individually as state variable that will change in response to input onChange 
    const [state, setState] = useState<IState>({ ...initialState });


    //create a general onChange event handler for form inputs that fire onChange event
    //See https://reactjs.org/docs/events.html? for all kinds of events that can be handled in react
    const onChange = (event: React.FormEvent) => {
        const currentUser = state.user;//check out user in state as is
        //modify element in the state which has the same name as the input that fired this event. Pass the new value
        const target: HTMLInputElement | HTMLSelectElement = event.target as HTMLInputElement | HTMLSelectElement; //as is used here to cast
        currentUser[target.name] = target.value;
        setState({ ...state, user: currentUser });//checkin the modified user state
    }

    //function to handle form onSubmit event
    const onSubmit = (event: React.FormEvent) => {
        event.preventDefault();//do not do the default form submit to the server
        //alert('about to call handleCreateUser')
        props.handleCreateUser(state.user, props.currentUsers, props.dispatch);//call the handleAddUser function passed via props.
    }

    //function to handle form onCancel
    const onCancel = () => {
        //dispatch to state
        props.dispatch({ type: 'HandleCancelCreate' })
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

    //Note where the above functions are used below within the return statement
    return (
        <form onSubmit={onSubmit}>
            <div className="box">
                <div className="columns is-mobile">
                    <h2>Add User</h2>
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
                                <div className="field-label is-normal">
                                    <label className="label">Login information</label>
                                </div>
                                <div className="field-body">
                                    <div className="field">
                                        <label className="label">Primary Email Address</label>
                                        <div className="control">
                                            <input name="primaryEmailAddress" className="input" type="email" placeholder="Enter valid email here" maxLength={30} value={state.user.primaryEmailAddress} onChange={onChange} required />
                                        </div>
                                        <p className="help">The email address should not be more than 30 letters</p>
                                    </div>
                                    <div className="field">
                                        <label className="label">Password</label>
                                        <div className="control">
                                            <input name="passwordHash" className="input" type="password" placeholder="Enter password here" maxLength={128} value={state.user.passwordHash} onChange={onChange} required />
                                        </div>
                                        <p className="help">The password should not be more than 128 letters</p>
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
                                <label className="label">Date of Birth</label>
                                <div className="control">
                                    <input name="dateOfBirth" id="dateOfBirth" className="input" type="date"
                                        required pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}" max={new Date().toLocaleString()} value={state.user.dateOfBirth?.toLocaleString()} onChange={onChange} />
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

    );
}

export default AddUser;

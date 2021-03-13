/** This component is for displaying each role in the record, passed to it from RoleList */
import React, { useState } from 'react';
import { IAction, IRole } from '../app.interfaces';

//create the type for the anticipated props to be passed from parent component
type Props = {
    role: IRole,
    handleUpdateRole: Function,
    currentRoles: IRole[],
    dispatch: React.Dispatch<IAction>
}

type IState = {
    role: IRole
}

const EditRole: React.FC<Props> = (props) => {

    const initialState: IState = {
        role: {
            id: props.role.id,
            name: props.role.name,
            description: props.role.description,
            landlord: props.role.landlord,
            //users: []
        }

    }

    //declare the state variable for role to be added from form. Notice that we are using an object containing the individual elements
    //We need to interact with them individually as state variable that will change in response to input onChange 
    const [state, setState] = useState<IState>({ ...initialState });


    //create a general onChange event handler for form inputs that fire onChange event
    //See https://reactjs.org/docs/events.html? for all kinds of events that can be handled in react
    const onChange = (event: React.FormEvent) => {
        const currentRole = state.role;//check out role in state as is
        //modify element in the state which has the same name as the input that fired this event. Pass the new value
        const target: HTMLInputElement | HTMLSelectElement = event.target as HTMLInputElement | HTMLSelectElement; //as is used here to cast
        currentRole[target.name] = target.value;
        setState({ ...state, role: currentRole });//checkin the modified role state
    }

    //function to handle form onSubmit event
    const onSubmit = (event: React.FormEvent) => {
        event.preventDefault();//do not do the default form submit to the server
        props.handleUpdateRole(state.role, props.currentRoles, props.dispatch);//call the handleUpdateRole function passed via props.
    }

    //function to handle form onCancel
    const onCancel = () => {
        //dispatch to state
        props.dispatch({ type: 'HandleCancelUpdate' })
    }

    const handleLandlordCheckbox = () => {
        //toggle choice in state
        const landlord = state.role.landlord? false : true
        setState({...state, role: {...state.role, landlord} })
    }

    //Note where the above functions are used below within the return statement
    return (
        <form onSubmit={onSubmit}>
            <div className="box">
                <div className="columns is-mobile">
                    <h2>Add Role</h2>
                </div>
                <div className="columns is-mobile">
                    <div className="column">
                        <div className="box">
                            <div className="field">
                                <label className="label">Name</label>
                                <div className="control">
                                    <input className="input" type="text" placeholder="Name input" name="name" value={state.role.name} onChange={onChange} required />
                                </div>
                            </div>
                            <div className="field">
                                <label className="label">Description</label>
                                <div className="control">
                                    <input className="input" type="text" placeholder="Description input" name="description" value={state.role.description} onChange={onChange} required />
                                </div>
                            </div>
                            <div className="field">
                                <div className="control">
                                    <span><input type="checkbox" name="landlord" value="" checked={state.role.landlord} onChange={handleLandlordCheckbox} />&nbsp;Landlord role?</span>
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

    );
}

export default EditRole;

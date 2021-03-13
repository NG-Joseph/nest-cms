/** This component is for displaying each item in the record, passed to it from TenantList */
import React, { useContext, useState } from 'react';
import { ITenant } from '../app.interfaces';
import { AppContext } from '../App';
import Alert from './Alert';

type Props = {
    tenant: ITenant,
}

type IState = {
    upload: {
        fileToUpload: Blob | string,
        uploadButtonState: string
    }
    alert: {
        show: boolean,
        type: "info" | "success" | "link" | "primary" | "warning" | "danger" | "light" | "dark" | "white" | "black" | undefined,
        onClickHandler?: () => void
        message: string
    },
    logo: {
        src: string,
        //cacheClearer: number
    }
}

const ViewTenant: React.FC<Props> = ({ tenant }) => {

    const initialState: IState = {
        upload: {
            fileToUpload: "",
            uploadButtonState: ""
        },
        alert: {
            show: false,
            type: undefined,
            message: ""
        },
        logo: {
            src: `/v1/tenants/${tenant.id}/logo`,
            //cacheClearer: Date.now()
        }
    }

    const [state, setState] = useState<IState>({ ...initialState })

    //declare applicable contexts
    const appContext = useContext(AppContext);

    //callback function for delete button onClick event. We could have also embedded this function definition directly rather than define it first here
    const onDeleteTenant = () => {
        appContext!.handleDeleteTenant!(tenant.id, appContext!.dispatch); ////notice here that we are invoking the handleDeleteTenant() via appContext. The exclamation mark is because of the possible null which will not really happen
    };

    //callback function for edit button
    const onEditTenant = () => {
        //appContext!.handleEditTenant!(tenant.id, appContext!.dispatch); //notice here that we are invoking the handleEditTenant() via appContext. The exclamation mark is because of the possible null which will not really happen
        appContext!.dispatch({ type: 'HandleEditTenant', payload: { id: tenant.id } });
    };

    const onClickCloseButton = () => {
        appContext!.dispatch({ type: 'HandleCloseViewTenant' })
    }

    const onChange = (event: any) => {
        setState({ ...state, upload: { ...state.upload, fileToUpload: event.target.files[0] } })
    }

    const onSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        const data = new FormData();
        data.append('file', state.upload.fileToUpload);
        try {
            //show loading sign on submit button
            setState({ ...state, upload: { ...state.upload, uploadButtonState: 'is-loading' } })
            const response = await fetch(`/v1/tenants/${tenant.id}/logo`,
                {
                    method: 'POST',
                    //don't use below, else you have to have a way to add boundary between multiparts. Let the browser detect and do that automatically
                    //headers: {
                    //    'Content-Type': 'multipart/form-data'
                    // 'Content-Type': 'application/x-www-form-urlencoded',
                    //},
                    body: data
                });
            if (!response.ok) throw new Error(response.statusText);//confirm that response is OK, else throw error
            //Response is ok. Proceed!
            //clear loading sign and fileToUpload. Set browser img src to clear cache
            setState({ ...state, logo: { ...state.logo, src:`${state.logo.src}?&${Date.now()}`  }, upload: { fileToUpload: '', uploadButtonState: '' } })
        } catch (error) {
            setState({ ...state, alert: { show: true, type: 'danger', message: `logo upload failed: ${error.message}` } })
        }
    }

    /*Additional handler functions here*/
    //Below is called by Alert component.
    const handleCloseAlert = () => {
        setState({ 
            ...state, alert: { show: false, message: '', type: undefined } 
        });
    }

    const alert = (
        <Alert type={state.alert.type} message={state.alert.message} onClickHandler={handleCloseAlert} />
    )

    return (
        <div className="modal modal-full-screen modal-fx-fadeInScale is-active">
            <div className="modal-background"></div>
            <div className="modal-content">
                <header className="modal-card-head">
                    <p className="modal-card-title">{`Details of ${tenant.uniqueName}`}</p>
                    <button className="delete" aria-label="close" onClick={onClickCloseButton} />
                </header>
                <section className="modal-card-body">
                    {/*<!-- Content ... -->*/}
                    <div className="columns">
                        <div className="column is-two-thirds">
                            <div className="columns">
                                <div className="column is-two-fifths">
                                    Address:
                                </div>
                                <div className="column">
                                    {tenant.address}
                                </div>
                            </div>
                            <div className="columns">
                                <div className="column is-two-fifths">
                                    More Information:
                                </div>
                                <div className="column">
                                    {tenant.moreInfo}
                                </div>
                            </div>
                            <div className="columns">
                                <div className="column is-two-fifths">
                                    Contact firstname:
                                </div>
                                <div className="column">
                                    {tenant.primaryContact!.firstName}
                                </div>
                            </div>
                            <div className="columns">
                                <div className="column is-two-fifths">
                                    Contact lastname:
                                </div>
                                <div className="column">
                                    {tenant.primaryContact!.lastName}
                                </div>
                            </div>
                            <div className="columns">
                                <div className="column is-two-fifths">
                                    Contact email:
                                </div>
                                <div className="column">
                                    {tenant.primaryContact!.primaryEmailAddress}
                                </div>
                            </div>
                            <div className="columns">
                                <div className="column is-two-fifths">
                                    Status:
                                </div>
                                <div className="column">
                                    {tenant.status}
                                </div>
                            </div>
                            <div className="columns">
                                <div className="column is-two-fifths">
                                    Active:
                                </div>
                                <div className="column">
                                    {tenant.active ? "Yes" : "No"}
                                </div>
                            </div>
                        </div>
                        <div className="column">
                            <div className="columns">
                                <div className="column">
                                    Logo
                                </div>
                            </div>
                            <div className="columns">
                                <div className="column">
                                    <img src={`${state.logo.src}`} />
                                </div>
                            </div>
                            <form className="columns" onSubmit={onSubmit}>
                                <div className="field">
                                    <label className="label">Upload logo</label>
                                    <div className="control">
                                        <input type="file" name="file" onChange={onChange} required/>
                                    </div>
                                    <div className="field">
                                        {state.alert.show && alert}
                                    </div>
                                    <div className="field control">
                                        <button className={`button is-link is-small ${state.upload.uploadButtonState}`} type="submit" >Submit</button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </section>
                <footer className="modal-card-foot">
                    <div className="buttons are-small">
                        <button className="button is-warning" onClick={onEditTenant}>Edit</button>
                        <button className="button is-danger" onClick={() => { if (window.confirm('This action cannot be reversed! Are you sure you want to delete?')) onDeleteTenant() }}>Delete</button>
                    </div>
                </footer>
            </div>
        </div>

    );
}

export default ViewTenant;

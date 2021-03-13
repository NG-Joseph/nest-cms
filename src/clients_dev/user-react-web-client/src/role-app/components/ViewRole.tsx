/** This component is for displaying each item in the record, passed to it from RoleList */
import React, { useContext } from 'react';
import { IRole } from '../app.interfaces';
import { AppContext } from '../RoleApp';

type Props = {
    role: IRole,
}

const ViewRole: React.FC<Props> = ({ role }) => {

    //declare applicable contexts
    const appContext = useContext(AppContext);

    //callback function for delete button onClick event. We could have also embedded this function definition directly rather than define it first here
    const onDeleteRole = () => {
        appContext!.handleDeleteRole!(role.id, appContext!.dispatch); ////notice here that we are invoking the handleDeleteRole() via appContext. The exclamation mark is because of the possible null which will not really happen
    };

    //callback function for edit button
    const onEditRole = () => {
        //appContext!.handleEditRole!(role.id, appContext!.dispatch); //notice here that we are invoking the handleEditRole() via appContext. The exclamation mark is because of the possible null which will not really happen
        appContext!.dispatch({ type: 'HandleEditRole', payload: { id: role.id } });
    };

    const onClickCloseButton = () => {
        appContext!.dispatch({ type: 'HandleCloseViewRole' })
    }

    return (
        <div className="modal modal-full-screen modal-fx-fadeInScale is-active">
            <div className="modal-background"></div>
            <div className="modal-content">
                <header className="modal-card-head">
                    <p className="modal-card-title">{`Details of ${role.uniqueName}`}</p>
                    <button className="delete" aria-label="close" onClick={onClickCloseButton} />
                </header>
                <section className="modal-card-body">
                    {/*<!-- Content ... -->*/}
                    <div className="columns">
                        <div className="column is-two-thirds">
                            <div className="columns">
                                <div className="column is-two-fifths">
                                    Name:
                                </div>
                                <div className="column">
                                    {role.name}
                                </div>
                            </div>
                            <div className="columns">
                                <div className="column is-two-fifths">
                                    Description:
                                </div>
                                <div className="column">
                                    {role.description}
                                </div>
                            </div>
                            <div className="columns">
                                <div className="column is-two-fifths">
                                    Landlord role?:
                                </div>
                                <div className="column">
                                    {role.landlord? 'Yes' : 'No'}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <footer className="modal-card-foot">
                    <div className="buttons are-small">
                        <button className="button is-warning" onClick={onEditRole}>Edit</button>
                        <button className="button is-danger" onClick={() => { if (window.confirm('This action cannot be reversed! Are you sure you want to delete?')) onDeleteRole() }}>Delete</button>
                    </div>
                </footer>
            </div>
        </div>
    );
}

export default ViewRole;

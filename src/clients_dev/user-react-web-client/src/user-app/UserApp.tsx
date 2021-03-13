import React, { useEffect, useReducer } from 'react';
import { IAction, IUser, IState } from './app.interfaces';
import reducer from './reducers/app.reducer';

import { DEFAULT_ACTION_BUTTON_STATE } from '../global/app.settings';
import { IFindOptions } from '../global/app.interfaces';
import { handleReadUsers } from './crud-handlers/read';
import Alert from '../global/components/Alert';
import { handleUpdateUser } from './crud-handlers/update/update';
import { handleDeleteUser } from './crud-handlers/delete';
import { handleCreateUser } from './crud-handlers/create';
import UserList from './components/UserList';
import AddUser from './components/AddUser';
import EditUser from './components/EditUser';
import ViewUser from './components/ViewUser';

/*Below is type definition for our context type.*/
//Restricts Context type to null or Object containing functions; null is used only for initialization of context in App.
//Using Object because we have two or more parameters to pass and we want to carry them together within one context instead of two
//different ones.
type AppContextType = null | { dispatch: React.Dispatch<IAction>, handleDeleteUser: Function, currentUsers: IUser[] };

//create a context to be used to pass handlers like delete, edit handlers to subcomponents.
//We are also going to pass dispatch returned by useReducer.
export const AppContext = React.createContext<AppContextType>(null);

/*Let us define type for our reducer so that we can easily pass any type of previous state and action.
Reducer is simply a type of function that takes previous state and action and returns a new state as represented
We don't have to do this. But it is good to know.*/
type Reducer<S, A> = (prevState: S, action: A) => S;

const UserApp: React.FC<IState> = (props) => {//assuming that props passed will be initial state values

  /*let us organize state, using useReducer*/
  //Prepare initial state values
  const initialState: IState =
  {
    users: [],
    usersCount: 0, //for total number that corresponds to present find, in case of pagination
    user: null, //This can be used for user to edit or user to view, depending on the function being carried out
    onAddUser: false,
    onViewUser: false,
    onEditUser: false,
    alert: {
      show: false,
      message: '',
      type: ''
    },
    actionButtonState: DEFAULT_ACTION_BUTTON_STATE
  };

  //using useReducer instead of useState
  const [state, dispatch] = useReducer<Reducer<IState, IAction>>(reducer, initialState);

  /*Additional handler functions here*/
  //Below is called by Alert component.
  const handleCloseAlert = () => {
    dispatch({ type: 'HandleCloseAlert' });
  }

  //let findOptions: IFindOptions = {}
  let findOptions: IFindOptions = { "relations": ["roles","primaryContactForWhichTenants","tenantTeamMemberships"] };
  /**
   * useEffect to be run once, hence the second parameter []. Loads data at componentDidMount life cycle stage
   */
  useEffect(() => {
    handleReadUsers(dispatch, findOptions);
    // eslint-disable-next-line
  }, []);

  //scroll to top each time alert state changes
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [state.alert])

  /*Time to logically decide what to show.*/
  //Setup alert component as a variable so we don't keep repeating
  const myAlert = (
    <Alert type={state.alert.type} message={state.alert.message} onClickHandler={handleCloseAlert} />
  )

  //check if editUser should be loaded or not since it is conditional loading
  if (state.onEditUser && state.user !== null) {
    return (
      <div className="container ">
        <div className="content is-medium">
          <p>
            {state.alert.show && myAlert}
          </p>
          <p>
            <EditUser user={state.user!} handleUpdateUser={handleUpdateUser} currentUsers={state.users!} dispatch={dispatch} />
          </p>
          <p>
            <AppContext.Provider value={{ dispatch, handleDeleteUser, currentUsers: state.users! }}>
              <UserList users={state.users!} />
            </AppContext.Provider>
          </p>
        </div>
      </div>
    );
  } else if (state.onAddUser) {//Display AddUser along with UserList if onAddUser is true
    return (
      <div className="container ">
        <div className="content is-medium">
          <p>
            {state.alert.show && myAlert}
          </p>
          <p>
            <AddUser handleCreateUser={handleCreateUser} currentUsers={state.users!} dispatch={dispatch} />
          </p>
          <p>
            <AppContext.Provider value={{ dispatch, handleDeleteUser, currentUsers: state.users! }}>
              <UserList users={state.users!} />
            </AppContext.Provider>
          </p>
        </div>
      </div>
    );
  } else if (state.onViewUser && state.user != null) {
    return (
      <div className="container ">
        <div className="content is-medium">
          <p>
            <AppContext.Provider value={{ dispatch, handleDeleteUser, currentUsers: state.users! }}>
              <ViewUser user={state.user!} />
            </AppContext.Provider>
          </p>
        </div>
      </div>
    );
  } else {//onAddUser is false
    return (
      <div className="container ">
        <div className="content is-medium">
          <p>
            <button className="button is-outline" onClick={() => { dispatch({ type: 'HandleOnAddUser' }) }}>+ Add User</button>
          </p>
          <p>
            {state.alert.show && myAlert}
          </p>
          <p>
            <AppContext.Provider value={{ dispatch, handleDeleteUser, currentUsers: state.users! }}>
              <UserList users={state.users!} />
            </AppContext.Provider>
          </p>
        </div>
      </div>
    );
  }

}

export default UserApp;

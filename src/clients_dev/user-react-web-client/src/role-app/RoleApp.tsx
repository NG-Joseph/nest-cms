import React, { useEffect, useReducer } from 'react';
import { IAction, IRole, IState } from './app.interfaces';
import reducer from './reducers/app.reducer';

import { DEFAULT_ACTION_BUTTON_STATE } from '../global/app.settings';
import { IFindOptions } from '../global/app.interfaces';
import { handleReadRoles } from './crud-handlers/read';
import Alert from '../global/components/Alert';
import { handleUpdateRole } from './crud-handlers/update';
import { handleDeleteRole } from './crud-handlers/delete';
import { handleCreateRole } from './crud-handlers/create';
import RoleList from './components/RoleList';
import AddRole from './components/AddRole';
import EditRole from './components/EditRole';
import ViewRole from './components/ViewRole';

/*Below is type definition for our context type.*/
//Restricts Context type to null or Object containing functions; null is used only for initialization of context in App.
//Using Object because we have two or more parameters to pass and we want to carry them together within one context instead of two
//different ones.
type AppContextType = null | { dispatch: React.Dispatch<IAction>, handleDeleteRole: Function, currentRoles: IRole[] };

//create a context to be used to pass handlers like delete, edit handlers to subcomponents.
//We are also going to pass dispatch returned by useReducer.
export const AppContext = React.createContext<AppContextType>(null);

/*Let us define type for our reducer so that we can easily pass any type of previous state and action.
Reducer is simply a type of function that takes previous state and action and returns a new state as represented
We don't have to do this. But it is good to know.*/
type Reducer<S, A> = (prevState: S, action: A) => S;

const RoleApp: React.FC<IState> = (props) => {//assuming that props passed will be initial state values

  /*let us organize state, using useReducer*/
  //Prepare initial state values
  const initialState: IState =
  {
    roles: [],
    rolesCount: 0, //for total number that corresponds to present find, in case of pagination
    role: null, //This can be used for role to edit or role to view, depending on the function being carried out
    onAddRole: false,
    onViewRole: false,
    onEditRole: false,
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
  let findOptions: IFindOptions = {"relations":["users"]};
  /**
   * useEffect to be run once, hence the second parameter []. Loads data at componentDidMount life cycle stage
   */
  useEffect(() => {
    handleReadRoles(dispatch, findOptions);
    // eslint-disable-next-line
  }, []);

  /*Time to logically decide what to show.*/
  //Setup alert component as a variable so we don't keep repeating
  const myAlert = (
    <Alert type={state.alert.type} message={state.alert.message} onClickHandler={handleCloseAlert} />
  )

  //check if editRole should be loaded or not since it is conditional loading
  if (state.onEditRole && state.role !== null) {
    return (
      <div className="container ">
        <div className="content is-medium">
          <p>
            <EditRole role={state.role!} handleUpdateRole={handleUpdateRole} currentRoles={state.roles!} dispatch={dispatch} />
          </p>
          <p>
            {state.alert.show && myAlert}
          </p>
          <p>
            <AppContext.Provider value={{ dispatch, handleDeleteRole, currentRoles: state.roles! }}>
              <RoleList roles={state.roles!} />
            </AppContext.Provider>
          </p>
        </div>
      </div>
    );
  } else if (state.onAddRole) {//Display AddRole along with RoleList if onAddRole is true
    return (
      <div className="container ">
        <div className="content is-medium">
          <p>
            <AddRole handleCreateRole={handleCreateRole} currentRoles={state.roles!} dispatch={dispatch} />
          </p>
          <p>
            {state.alert.show && myAlert}
          </p>
          <p>
            <AppContext.Provider value={{ dispatch, handleDeleteRole, currentRoles: state.roles! }}>
              <RoleList roles={state.roles!} />
            </AppContext.Provider>
          </p>
        </div>
      </div>
    );
  } else if (state.onViewRole && state.role != null) {
    return (
      <div className="container ">
        <div className="content is-medium">
          <p>
            <AppContext.Provider value={{dispatch, handleDeleteRole, currentRoles: state.roles! }}>
              <ViewRole role={state.role!} />
            </AppContext.Provider>
          </p>
        </div>
      </div>
    );
  } else {//onAddRole is false
    return (
      <div className="container ">
        <div className="content is-medium">
          <p>
            <button className="button is-outline" onClick={() => { dispatch({ type: 'HandleOnAddRole' }) }}>+ Add Role</button>
          </p>
          <p>
            {state.alert.show && myAlert}
          </p>
          <p>
            <AppContext.Provider value={{ dispatch, handleDeleteRole, currentRoles: state.roles! }}>
              <RoleList roles={state.roles!} />
            </AppContext.Provider>
          </p>
        </div>
      </div>
    );
  }

}

export default RoleApp;

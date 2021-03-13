import { IFindOptions } from "../../global/app.interfaces";
import { IAction } from "../app.interfaces";

//function to fetch data
//See https://github.com/typeorm/typeorm/blob/master/docs/find-options.md for find options
//findOptions defaults to empty {}
export const handleReadRoles = async (dispatch: React.Dispatch<IAction>, findOptions: IFindOptions = {}) => {
    try {
      //Rather than use absolute URL, we are using relative below because we have made a proxy entry into package.json
      //i.e. "proxy": "http://localhost:3003". In this way, our code is more like how it will be at production deployment
      //when we serve both the client react application and the backend from the same domain.
      const response = await fetch(`/v1/roles?findOptions=${encodeURI(JSON.stringify(findOptions))}`);
      
      if (!response.ok) throw new Error(response.statusText);

      const data = await response.json();
      //set in state  
      dispatch({type: 'FetchDataSuccess', payload: {rolesCount: data[1], roles: data[0]}})
    } catch (error) {
      //set state
      dispatch({type: 'FetchDataFailure', payload: {error: error}})
    }
  };

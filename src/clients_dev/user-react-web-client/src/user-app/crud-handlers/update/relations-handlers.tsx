import { API_VERSION_URL, DEFAULT_ACTION_BUTTON_STATE } from "../../../global/app.settings";
import { IEditUserState, IRole, TenantTeamRole } from "../../app.interfaces";

export class RelationsHandlers {

    /**
     * Called from EditRoles useEffect to get roles that will be in dropdown for selection
     * When successful, the roles in relationsState will be set accordingly and be available for selection
     * in order to add roles.
     * @param state 
     * @param setState 
     */
    public static getAssignableRoles = async (state: IEditUserState, setState: React.Dispatch<React.SetStateAction<IEditUserState>>) => {

        try {

            const response = await fetch(`${API_VERSION_URL}/roles`,
                {
                    method: 'GET',//notice the method
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

            if (!response.ok) throw new Error(response.statusText);//confirm that response is OK

            const data = await response.json(); //the server returns an array of Roles along with count.

            //filter out roles that user already has and also considering whether user/role is landlord or not
            let assignableRoles: IRole[] = [];
            data[0].map((role: IRole) => {
                //check landlord status congruence
                if (state.user.landlord === role.landlord) {
                    //check to see if the user already has the role. Only show if user does not have the role
                    const index = state.user.roles!.findIndex((assignedRole) => assignedRole.id === role.id);
                    if (index === -1)//if not found index of -1 is returned.
                        assignableRoles.push(role);
                }
            })
            setState({ ...state, relations: { ...state.relations, assignableRoles } });
        } catch (error) {
            //strange error
            console.log(error);

        }
    }


    /**
     * This is for compositing the roleIds of roles to be added to user. Called from EditUser
     * @param userId 
     * @param roleIds 
     * @param state 
     * @param setState 
     */
    public static addRolesById = async (userId: number, roleIds: number[], state: IEditUserState, setState: React.Dispatch<React.SetStateAction<IEditUserState>>) => {
        //The query should contain an array of roleIds in query key named roleid e.g. ?roleid=1&roleid=2&roleid=3...
        let query: string = '';
        for (const roleId of roleIds) {
            query += `roleid=${roleId}&`
        }
        try {
            //Add is-loading to submit button
            setState({ ...state, relations: { ...state.relations, userRoles: { ...state.relations.userRoles, submitButtonState: 'is-loading' } } })
            const response = await fetch(`${API_VERSION_URL}/users/${userId}/roles?${query}`,
                {
                    method: 'PATCH',//notice the method
                    headers: {
                        //'Content-Type': 'application/json'
                    }

                });
            if (!response.ok) throw new Error(response.statusText);//confirm that response is OK

            const data = await response.json(); //the data returned from server is an array of user roles.

            setState({ ...state, user: { ...state.user, roles: data }, relations: { ...state.relations, userRoles: { ...state.relations.userRoles, submitButtonState: DEFAULT_ACTION_BUTTON_STATE } } })

        } catch (error) {
            //simply reset the button state
            setState({ ...state, relations: { ...state.relations, userRoles: { ...state.relations.userRoles, submitButtonState: DEFAULT_ACTION_BUTTON_STATE } } })
            console.log(error);
        }
    }

    public static removeRoleFromUser = async (roleId: number, state: IEditUserState, setState: React.Dispatch<React.SetStateAction<IEditUserState>>) => {
        try {
            //Add is-loading to submit button
            setState({ ...state, relations: { ...state.relations, userRoles: { ...state.relations.userRoles, deleteButtonState: 'is-loading' } } })
            const response = await fetch(`${API_VERSION_URL}/users/${state.user.id}/roles/${roleId}`,
                {
                    method: 'DELETE',//notice the method
                    headers: {
                        //'Content-Type': 'application/json'
                    }

                });
            if (!response.ok) throw new Error(response.statusText);//confirm that response is OK

            const data = await response.json(); //the data returned from server is an array of user roles.

            setState({ ...state, user: { ...state.user, roles: data }, relations: { ...state.relations, userRoles: { ...state.relations.userRoles, deleteButtonState: 'delete' } } })

        } catch (error) {
            //simply reset the button state
            setState({ ...state, relations: { ...state.relations, userRoles: { ...state.relations.userRoles, deleteButtonState: 'delete' } } })
            console.log(error);
        }

    }

    public static setAsPrimaryContactForATenantByTenantUniqueName = async (uniqueNameOfTenantToAdd: string, state: IEditUserState, setState: React.Dispatch<React.SetStateAction<IEditUserState>>) => {
        try {
            //Add is-loading to submit button
            setState({ ...state, relations: { ...state.relations, primaryContactForWhichTenants: { ...state.relations.primaryContactForWhichTenants, submitButtonState: 'is-loading' } } })
            const response = await fetch(`${API_VERSION_URL}/users/${state.user.id}/primary-contact-for-by-unique-name/${uniqueNameOfTenantToAdd}`,
                {
                    method: 'PATCH',//notice the method
                    headers: {
                        //'Content-Type': 'application/json'
                    }

                });
            if (!response.ok) throw new Error(response.statusText);//confirm that response is OK

            const data = await response.json(); //the data returned from server is an array of user primaryContactForWhichTenants.

            //alert(JSON.stringify(data))

            setState({ ...state, user: { ...state.user, primaryContactForWhichTenants: data }, relations: { ...state.relations, primaryContactForWhichTenants: { ...state.relations.primaryContactForWhichTenants, submitButtonState: DEFAULT_ACTION_BUTTON_STATE } } })

        } catch (error) {
            //simply reset the button state
            setState({ ...state, relations: { ...state.relations, primaryContactForWhichTenants: { ...state.relations.primaryContactForWhichTenants, submitButtonState: DEFAULT_ACTION_BUTTON_STATE } } })
            console.log(error);
            alert(error)
        }

    }

    public static removeAsPrimaryContactForATenantByTenantId = async (tenantId: number, state: IEditUserState, setState: React.Dispatch<React.SetStateAction<IEditUserState>>) => {
        try {
            //Add is-loading to submit button
            setState({ ...state, relations: { ...state.relations, primaryContactForWhichTenants: { ...state.relations.primaryContactForWhichTenants, deleteButtonState: 'is-loading' } } })
            const response = await fetch(`${API_VERSION_URL}/users/${state.user.id}/primary-contact-for/${tenantId}`,
                {
                    method: 'DELETE',//notice the method
                    headers: {
                        //'Content-Type': 'application/json'
                    }

                });
            if (!response.ok) throw new Error(response.statusText);//confirm that response is OK

            const data = await response.json(); //the data returned from server is an array of user primaryContactForWhichTenants.

            setState({ ...state, user: { ...state.user, primaryContactForWhichTenants: data }, relations: { ...state.relations, primaryContactForWhichTenants: { ...state.relations.primaryContactForWhichTenants, deleteButtonState: 'delete' } } })

        } catch (error) {
            //simply reset the button state
            setState({ ...state, relations: { ...state.relations, primaryContactForWhichTenants: { ...state.relations.primaryContactForWhichTenants, deleteButtonState: 'delete' } } })
            console.log(error);
            alert(error)
        }
    }

    public static setTenantTeamMembershipByTenantUniqueName = async (uniqueNameOfTenantToAdd: string, rolesToAdd: TenantTeamRole[], state: IEditUserState, setState: React.Dispatch<React.SetStateAction<IEditUserState>>) => {
        try {
            //Add is-loading to submit button
            setState({ ...state, relations: { ...state.relations, tenantTeamMemberships: { ...state.relations.tenantTeamMemberships, submitButtonState: 'is-loading' } } })
            const response = await fetch(`${API_VERSION_URL}/users/${state.user.id}/team-membership-by-uniqueName/${uniqueNameOfTenantToAdd}`,
                {
                    method: 'PATCH',//notice the method
                    headers: {
                        //'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(rolesToAdd)//received in a dto on the server

                });
            if (!response.ok) throw new Error(response.statusText);//confirm that response is OK

            const data = await response.json(); //the data returned from server is an array of user tenantTeamMemberships.

            //alert(JSON.stringify(data))

            setState({ ...state, user: { ...state.user, tenantTeamMemberships: data }, relations: { ...state.relations, tenantTeamMemberships: { ...state.relations.tenantTeamMemberships, submitButtonState: DEFAULT_ACTION_BUTTON_STATE } } })

        } catch (error) {
            //simply reset the button state
            setState({ ...state, relations: { ...state.relations, tenantTeamMemberships: { ...state.relations.tenantTeamMemberships, submitButtonState: DEFAULT_ACTION_BUTTON_STATE } } })
            console.log(error);
            alert(error)
        }
    }

    public static deleteTenantTeamMemberShipById = async (tenantId: number, state: IEditUserState, setState: React.Dispatch<React.SetStateAction<IEditUserState>>) => {
        try {
            //Add is-loading to submit button
            setState({ ...state, relations: { ...state.relations, tenantTeamMemberships: { ...state.relations.tenantTeamMemberships, deleteButtonState: 'is-loading' } } })
            const response = await fetch(`${API_VERSION_URL}/users/${state.user.id}/team-membership/${tenantId}`,
                {
                    method: 'DELETE',//notice the method
                    headers: {
                        //'Content-Type': 'application/json'
                    }

                });
            if (!response.ok) throw new Error(response.statusText);//confirm that response is OK

            const data = await response.json(); //the data returned from server is an array of user primaryContactForWhichTenants.

            setState({ ...state, user: { ...state.user, tenantTeamMemberships: data }, relations: { ...state.relations, tenantTeamMemberships: { ...state.relations.tenantTeamMemberships, deleteButtonState: 'delete' } } })

        } catch (error) {
            //simply reset the button state
            setState({ ...state, relations: { ...state.relations, tenantTeamMemberships: { ...state.relations.tenantTeamMemberships, deleteButtonState: 'delete' } } })
            console.log(error);
            //alert(error)
        }
    }

    /**
     * Called from EditUser to submit photo selected for a user
     * @param userId 
     * @param data 
     * @param relationsState 
     * @param setRelationsState 
     */
    public static submitPhoto = async (userId: number, data: FormData, state: IEditUserState, setState: React.Dispatch<React.SetStateAction<IEditUserState>>) => {
        try {
            //show loading sign on submit button
            setState({ ...state, relations: { ...state.relations, photo: { ...state.relations.photo, uploadButtonState: 'is-loading' } } })
            const response = await fetch(`/v1/users/${userId}/photo`,
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
            //clear loading sign and fileToUpload. Set browser img src with date query to clear cache
            setState({ ...state, relations: { ...state.relations, photo: { ...state.relations.photo, src: `${state.relations.photo.src}?&${Date.now()}`, fileToUpload: '', uploadButtonState: '' } } })
        } catch (error) {
            setState({ ...state, relations: { ...state.relations, photo: { ...state.relations.photo, alert: { show: true, type: 'danger', message: `photo upload failed: ${error.message}` } } } })
        }
    }



}
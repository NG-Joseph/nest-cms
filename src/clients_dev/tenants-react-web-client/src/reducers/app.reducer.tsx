import { IState, IAction } from '../app.interfaces';

const reducer = (state: IState, action: IAction) => {
    switch (action.type) {
        case 'FetchDataSuccess':
            return {
                ...state, tenants: action.payload!.tenants, tenantsCount: action.payload!.tenantsCount
            };
        case 'FetchDataFailure':
            return {
                ...state, alert: { show: true, type: "danger", message: `Could not load remote data: ${action.payload!.error}` }
            };
        case 'HandleViewTenant':
            return {
                ...state, onViewTenant: true, onAddTenant: false, onEditTenant: false, tenant: action.payload!.tenant
            };
        case 'HandleCloseViewTenant':
            return{
                ...state, onViewTenant: false, tenant: null
            }
        case 'HandleOnAddTenant':
            return {
                ...state, onAddTenant: true, onEditTenant: false, alert: {...state.alert, show: false}
            };
        case 'HandleCancelCreate':
            return {
                ...state, onAddTenant: false
            };
        case 'BeforeCreateTenant':
            //goal here is to set alert to show creating tenant message
            return {
                ...state, alert: { show: true, type: "info", message: 'Creating tenant. Please wait!' }
            };
        case 'CreateTenantSuccess': {
            //goal here is to update state with tenant created
            const currentTenants = state.tenants!;
            currentTenants.push(action.payload!.tenant!);
            const newTenantsCount = state.tenantsCount!++;
            return {
                ...state, tenants: currentTenants, tenantsCount: newTenantsCount, onAddTenant: false, alert: { show: true, type: "success", message: 'Tenant successfully created!' }
            };
        };
        case 'CreateTenantFailure':
            //goal here is to set alert to show failure to create
            return {
                ...state, alert: { show: true, type: "danger", message: `Could not create tenant: ${action.payload!.error}` }
            };
        case 'BeforeDeleteTenant':
            //goal here is to set alert to show creating tenant message
            return { 
                ...state, alert: { show: true, type: "info", message: 'Deleting tenant. Please wait!' } 
            };
        case 'DeleteTenantSuccess': {
            //goal here is to remove deleted tenant from state
            const currentTenants = state.tenants;
            //find the index corresponding to the tenant with the passed id
            const index = currentTenants!.findIndex((tenant) => tenant.id === action.payload!.id);
            currentTenants!.splice(index, 1);
            const newTenantsCount = state.tenantsCount!-- 
            return { 
                ...state, onViewTenant: false, tenants: currentTenants, tenantsCount: newTenantsCount, alert: { show: true, type: "success", message: 'Tenant successfully deleted!' } 
            };
        };
        case 'DeleteTenantFailure':
            //goal here is to set alert to show failure to delete
            return { 
                ...state, onViewTenant: false, alert: { show: true, type: "danger", message: `Could not delete tenant: ${action.payload!.error}` } 
            };
        case 'BeforeUpdateTenant':
            //goal here is to set alert to show updating tenant message
            return { 
                ...state, alert: { show: true, type: "info", message: 'Updating tenant. Please wait!' } 
            };
        case 'HandleCancelUpdate':
            return { 
                ...state, onEditTenant: false 
            };
        case 'HandleEditTenant': {
            //alert(JSON.stringify(action.payload!.tenant))
            //goal here is to find the tenant to be edited and set the tenant in state to be edited
            const currentTenants = state.tenants;
            
            const index = currentTenants!.findIndex((tenant) => tenant.id === action.payload!.id);
            const tenant = currentTenants![index];
            return { 
                ...state, onEditTenant: true, tenant: tenant, onAddTenant: false, alert: {...state.alert, show: false} 
            };
        };
        case 'UpdateTenantSuccess': {
            //goal here is to update state with tenant updated
            const currentTenants = state.tenants;
            const index = currentTenants!.findIndex((tenant) => tenant.id === action.payload!.tenant!.id);
            //now change the value for that tenant in state
            currentTenants![index] = action.payload!.tenant!;
            return { 
                ...state, onViewTenant: false, tenants: currentTenants, tenant: action.payload!.tenant!, onEditTenant: false, alert: { show: true, type: "success", message: 'Tenant successfully updated!' } 
            };
        };
        case 'UpdateTenantFailure':
            //goal here is to set alert to show failure to update
            return { 
                ...state, onViewTenant: false, alert: { show: true, type: "danger", message: `Could not update tenant: ${action.payload!.error}` } 
            };
        case 'HandleCloseAlert':
            return { 
                ...state, alert: { show: false, message: '', type: '' } 
            };
            
        default:
            return state; //return state as is if the action type indicated is not handled
    }//close switch statement

}
export default reducer;
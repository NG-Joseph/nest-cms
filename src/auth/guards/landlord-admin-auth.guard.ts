import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { LandLordRoles } from "src/global/app.settings";
import { AuthTokenPayload } from "src/global/custom.interfaces";

@Injectable()
export default class LandlordAdminGuard implements CanActivate{

    /**
     * Override canActivate method.
     * Get the req object from ExecutionContext
     * Examine if the req.user has the requisite user and roles to qualify
     * return true if qualified, else throw an unauthorized access exception
     * @param context 
     */
    canActivate(context: ExecutionContext){

        const req = context.switchToHttp().getRequest();
        const user: AuthTokenPayload = req.user;

        if(user && user.sub.landlord && user.sub.roles.includes(LandLordRoles.Admin)){
            return true
        }

        throw new HttpException('Unauthorized access', HttpStatus.UNAUTHORIZED)
    }
}

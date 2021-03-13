import { CreateBaseAbstractDto } from "src/global/create-base-abstract.dto";
import { User } from "src/users/models/user.entity";

//This is deconstructed from entity which is deconstructed from profile
export class FacebookProfileDto {

    user?: User
    facebookId?: number
    displayName?: string
    photos?: {value: string}[]
    emails?: {value: string, type?: string}[]
    gender?: string
    name?: {familyName: string, givenName: string}
    profileUrl?: string


}
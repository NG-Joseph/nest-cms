import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Profile, Strategy } from "passport-facebook";
import { fbConstants } from "src/global/app.settings";
import { FacebookProfile } from "src/users/models/facebook-profile.entity";
import { FacebookProfileDto } from "../dtos/facebook-profile.dto";

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, "facebook") {
    constructor() {
        super({
            clientID: fbConstants.APP_ID,
            clientSecret: fbConstants.APP_SECRET,
            callbackURL: fbConstants.CALLBACK_URL,
            scope: fbConstants.SCOPE,
            profileFields: fbConstants.PROFILE_FIELDS,
            return_scopes: true //to know which scopes the facebook user has permitted
        });
    }

    async validate(
        accessToken: string,
        refreshToken: string,
        profile: Profile,
        done: (err: any, user: any, info?: any) => void
    ): Promise<any> {

        //console.log(JSON.stringify(profile));

        const { id, displayName, photos, emails, gender, name, profileUrl } = profile;

        const facebookProfile: FacebookProfileDto = {
            emails,
            name,
            profileUrl,
            facebookId: parseInt(id),
            gender,
            photos,
            displayName,
        };
        
        const payload = {
            facebookProfile,
            accessToken,
            refreshToken
        };
        done(null, payload);
    }
}
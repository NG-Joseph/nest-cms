import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { User } from '../users/models/user.entity';
import { JwtService } from '@nestjs/jwt';
import { API_VERSION, fbConstants, jwtConstants } from '../global/app.settings';
import { AuthTokenPayload, Reply, Request } from '../global/custom.interfaces';
import { FacebookProfileDto } from './dtos/facebook-profile.dto';


@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private jwtService: JwtService
    ) { }

    /**
     * this function will be called each time a user is to be validated on the basis of primaryEmailAddress and password
     * It takes for granted that the password stored in database is hashed with bcrypt and the password being passed here
     * is a plain password, received from the client request, hopefully through a secure tls channel
     * @param email 
     * @param password 
     */
    async validateUser(email: string, passwordPlainText: string) {
        const user = await this.usersService.findByPrimaryEmailAddress(email);

        if (user) {
            //use bcrypt to compare plaintext password and the hashed one in database
            const isPasswordMatched = await bcrypt.compare(
                passwordPlainText,
                user.passwordHash
            );

            if (!isPasswordMatched) {
                return null; //password does not match
            }

            //read off passwordHash, tokens, etc. so that they are not carried around with user object.
            const { passwordHash, passwordSalt, resetPasswordToken,
                primaryEmailVerificationToken, backupEmailVerificationToken,
                emailVerificationTokenExpiration, otpSecret, refreshTokenHash,
                ...restOfUserFields } = user;

            return restOfUserFields;//alternatively, consider returning just a few necessary fields to avoid overfetching.
        } else {
            return null; //user does not exist
        }
    }

    /**
     * This login module, called to sign the user and return token, requires that JwtModule is properly registered 
     * in auth.module.ts.
     * @param user 
     */
    async login(user: User) {
        const access_token = await this.createAccessToken(user);
        //we need to generate refresh token, save to database and send it with the primary
        const refresh_token = await this.createRefreshToken(user);

        //below we return both tokens in an object
        return {
            access_token, refresh_token
        };
    }
    /**
     * 
     * @param user 
     */
    //async refresh(user: User, refreshToken: string) {//still send back the previous refresh token.
    async refresh(user: User) {//no need to send back refreshToken. Client already has it
        //We just need to refresh the accessToken. No creation of new refreshToken and saving to database is required.
        const access_token = await this.createAccessToken(user);

        return {
            access_token
        };
    }
    /**
     * This is also a login module like above. But it is for returning tokens in cookie. 
     * Suitable for Web browser access. Invoked from loginweb in AuthController!
     * @param user 
     */
    async loginAndReturnCookies(user: User) {
        const access_token = await this.createAccessToken(user);
        const accessTokenCookie = `Authentication=${access_token}; HttpOnly; Path=/; Max-Age=${jwtConstants.SECRET_KEY_EXPIRATION}`;
        const refresh_token = await this.createRefreshToken(user);
        const refreshTokenCookie = `Refresh=${refresh_token}; HttpOnly; Path=/; Max-Age=${jwtConstants.REFRESH_SECRET_KEY_EXPIRATION}`;
        //return the two cookies in an array.
        return [accessTokenCookie, refreshTokenCookie]
    }
    /**
     * Invoked by login to create token for user
     * @param user 
     */
    async createAccessToken(user: User) {
        /**
         * Here you decide what should be returned along with the standard exp and iat. See https://scotch.io/tutorials/the-anatomy-of-a-json-web-token
         * The sub is the conventional name for packaging the subject of the token. You can put there
         * whatever user data will be useful for setting up your control guards, etc. See mine below.
         * I created AccessTokenPayload as interface for it.
         */
        const payload: AuthTokenPayload = {
            username: user.primaryEmailAddress,
            sub: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                landlord: user.landlord,
                roles: user.roles.map((role) => { return role.name })
            }
        }

        const access_token = this.jwtService.sign(payload, {
            secret: jwtConstants.SECRET,
            expiresIn: jwtConstants.SECRET_KEY_EXPIRATION
        });

        return access_token;
    }

    /**
     * refresh is used to generate a refresh token, saved to database and returned. It is called from login above
     * @param user 
     */
    async createRefreshToken(user: User) {
        /**
         * Here you decide what should be returned along with the standard exp and iat. See https://scotch.io/tutorials/the-anatomy-of-a-json-web-token
         * The sub is the conventional name for packaging the subject of the token. You can put there
         * whatever user data will be useful for setting up your control guards, etc. See mine below.
         * I created AccessTokenPayload as interface for it.
         */
        const payload: AuthTokenPayload = {
            username: user.primaryEmailAddress,
            sub: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                landlord: user.landlord,
                roles: user.roles.map((role) => { return role.name })
            }
        }

        const refresh_token = this.jwtService.sign(payload, {
            secret: jwtConstants.REFRESH_SECRET,
            expiresIn: jwtConstants.REFRESH_SECRET_KEY_EXPIRATION
        });

        //save it to database before return. //Note: it will be more efficient to have used redis cache
        await this.usersService.setRefreshTokenHash(refresh_token, user.id);

        return refresh_token
    }

    /**
     * Equivalent of validateUser above as this does not require username and password but only refreshToken, to validate the user
     * But called by the strategy to do validation before return
     * @param refreshToken 
     * @param userId 
     */
    async validateRefreshToken(refreshToken: string, userId: number) {
        //I created the findById in UsersService for this purpose and included addSelect for the refreshTokenHash
        const user = await this.usersService.findById(userId);//Note: it will be more efficient to have used redis cache


        const isRefreshTokenMatched = await bcrypt.compare(
            refreshToken,
            user.refreshTokenHash
        );

        if (isRefreshTokenMatched) {
            const { passwordHash, passwordSalt, resetPasswordToken,
                primaryEmailVerificationToken, backupEmailVerificationToken,
                emailVerificationTokenExpiration, otpSecret, refreshTokenHash,
                ...restOfUserFields } = user;

            return restOfUserFields;
        } else {
            return null; //invalid refresh token
        }
    }
    /**
     * Called from controller to delete refreshToken from database on logout
     * @param userId 
     */
    async logout(userId: number) {
        //Delete refreshToken from database or redis, depending on what is in use
        await this.usersService.updateUser(userId, { refreshTokenHash: null })
        const redirectUrl = `/${API_VERSION}`
        return redirectUrl //return where the client should redirect to. This can be a setting.
    }

    /* Time to setup login that will return jwt for authenticated facebook user */
    async loginFacebookUser(req: Request) {

        const facebookProfile: FacebookProfileDto  = req.user.facebookProfile;

        //get user if already in database, and send
        let user = await this.usersService.findByFacebookId(facebookProfile.facebookId)

        if(!user){
            //check to see if the user with the facebook email address as primaryEmailAddress exists
            user = await this.usersService.findByPrimaryEmailAddress(facebookProfile.emails[0].value);

            if(user){
                if(user.isPrimaryEmailAddressVerified){
                    //this user has a verified primary email address which is the same as that of Facebook. Associate them
                    this.usersService.addFacebookProfile(user.id, facebookProfile);
                }else{
                    //problem: throw constraint exception. May be better to advice confirmation but consider security
                    this.usersService.confirmEmailRequest(user.primaryEmailAddress, null, true, req)
                    throw new UnauthorizedException("Confirmation of email already associated with your account is required")
    
                }
            } 
        }

        //user does not exist at all
        if (!user && fbConstants.CREATE_USER_IF_NOT_EXISTS) {
            //create the user
            user = await this.usersService.createFromFacebookProfile(facebookProfile)
        }

        if (user) {
            const access_token = await this.createAccessToken(user);
            //we need to generate refresh token, save to database and send it with the primary
            const refresh_token = await this.createRefreshToken(user);

            //below we return both tokens in an object
            
            return {
                access_token, refresh_token
            };
        } else {
            throw new UnauthorizedException;
        }
    }
}


import { Controller, Get, Req, Post, UseGuards, Res, Redirect, Query, HttpStatus } from '@nestjs/common';
import { API_VERSION } from 'src/global/app.settings';
import { AuthTokenPayload, Reply, Request } from 'src/global/custom.interfaces';
import { AuthService } from './auth.service';
import JwtRefreshGuard from './guards/jwt-refresh-auth.guard';
import LocalAuthGuard from './guards/local-auth.guard';
import jwt_decode from "jwt-decode";
import { AuthUser } from './decorators/authenticated-user.decorator';
import { LandlordAdminAuth } from './decorators/landlord-admin-auth.decorator';
import FacebookAuthGuard from './guards/facebook-auth.guard';
import { FacebookProfileDto } from './dtos/facebook-profile.dto';

@Controller('auth')
export class AuthController {

    constructor(private authService: AuthService) { }

    /**
     * Below is a login form invoked when username and password need to be supplied in a Web from, for login from browser
     * @param reply 
     */
    @Get('login')
    loginForm(@Res() reply: Reply, @Query() query: string) {
        //get the next param and pass to login.html for rendering below
        const next = query['next'];
        reply.view('auth/login.html',
            {
                apiVersion: API_VERSION !== null ? `${API_VERSION}` : '',
                loginUrl: API_VERSION !== null ? `/${API_VERSION}/auth/login` : '/auth/login',
                forgotPasswordUrl: API_VERSION !== null ? `/${API_VERSION}/users/reset-password-request` : '/users/reset-password-request',
                title: 'SGVI-1 Mini CMS Login',
                loginActive: 'true',
                next: next ? next : `/${API_VERSION}`
            })
    }

    /**
     *This route is for ajax login Post call. 
     e.g. curl -X POST http://localhost:3003/v1/auth/login -d '{"username": "piusono@gmail.com", "password": "password"}' -H "Content-Type: application/json"
     or from fetch() or axios(), etc.
     On success here, redirect is handled by the client
     * @param req 
     */
    //@UseGuards(AuthGuard('local')) //This works but better to first define a custom guard for it and use it here as I have used below
    @UseGuards(LocalAuthGuard)//LocalAuthGuard was defined in auth/guards/local-auth.guard.ts. Check it out
    @Post('login') //this does not conflict with the login url above for displaying login form. That is a Get and this is a Post.
    async login(@Req() req: Request) {
        //return req.user; //returns user directly
        return this.authService.login(req.user);//returns jwt
    }

    /**
     * This route is for Web form Post. On success, redirect is handled here by the server
     * Optionally use cookie if endpoints will be accessed only from browser without ajax. Else, stick to bearer token as used above.
     * @param req 
     * @param reply 
     */
    @Redirect(`/${API_VERSION}`)//default page to redirect to on successful login.
    @UseGuards(LocalAuthGuard)//LocalAuthGuard was defined in auth/guards/local-auth.guard.ts. Check it out
    @Post('loginweb') //this does not conflict with the login url above for displaying login form. That is a Get and this is a Post.
    async loginweb(@Req() req: Request, @Res() reply: Reply) {
        //call login and return cookies in array
        const cookies = await this.authService.loginAndReturnCookies(req.user)
        reply.header('Set-Cookie', cookies)
        return (`/${API_VERSION}`)//the url here can override the @Redirect declaration above. There could be some logic to it, passed in req. e.g next page to go
    }

    /**
     * Below was just for testing JwtAuthGuard. After invoking login to get token, below should return our user object as in payload
     * curl http://localhost:3003/v1/auth/profile -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InBpdXNvbm9AZ21haWwuY29tIiwic3ViIjoxLCJpYXQiOjE2MDUwMjQxNDQsImV4cCI6MTYwNTAyNDIwNH0.zqBbd1JuTLF87zZxeJNg5d8vS663f_RfBZ7NY1t3Wpg"
     * @param req 
     */
    @LandlordAdminAuth() //I created this decorator to combine the two guards below. See auth.decorators folder
    //@UseGuards(JwtAuthGuard, LandlordAdminGuard)
    @Get('profile')
    async testJwt(@Req() req: Request, @AuthUser() user: AuthTokenPayload) {
        //return req.user; //Note that this user is not the User in database. This is post authentication user packaged as payload signed by jwtService
        return user;
    }

    /**
     * This endpoint should be invoked from client when access_token has expired but exists. It is only deleted from localStorage when the user logs out.
     * When invoked, it will renew the tokens without asking for username or password.
     * @param req 
     */
    @UseGuards(JwtRefreshGuard)
    @Get('refresh')
    //async refresh(@Req() req: any) {//using any here because it'sn not only user that is being returned by jwt-referesh-stategy
    async refresh(@Req() req: Request) {//using any here because it'sn not only user that is being returned by jwt-referesh-stategy
        //const data = req.user; //this is if refreshToken is being returned as well
        //return this.authService.refresh(req.user, data.refreshToken); //parameters as passed by refresh-strategy validate()
        return this.authService.refresh(req.user); //refreshToken not being sent because the client already has it.
    }

    /**
     * Ajax called. Return URL to redirect to
     * @param req 
     */
    @Get('logout')
    async logout(@Req() req: Request, @Query() query: string) {
        const accessToken = req.headers.authorization;
        //console.log(accessToken)
        //get the user from the accessToken
        const decodedAccessToken: AuthTokenPayload = jwt_decode(accessToken) as AuthTokenPayload

        const redirectUrl = await this.authService.logout(decodedAccessToken.sub.id)
        //get the next param and pass to login.html for rendering below
        const next = query['next'];
        //console.log(next)
        return next ? { redirectUrl: next } : { redirectUrl }; //override the default redirect declared above
    }


    @Redirect(`/${API_VERSION}`)//default page to redirect to on successful web logout, when cookie is in use.
    @Get('logoutweb')
    async logoutweb(@Req() req: Request, @Res() reply: Reply, @Query() query: string) {
        //get accessToken from cookie
        const accessToken = req.cookies.Authentication;
        //decode to get userId from it
        const decodedAccessToken: AuthTokenPayload = jwt_decode(accessToken) as AuthTokenPayload
        //clear the cookies that will be returned
        const cookies = [
            'Authentication=; HttpOnly; Path=/; Max-Age=0',
            'Refresh=; HttpOnly; Path=/; Max-Age=0'
        ];
        reply.header('Set-Cookie', cookies);
        const redirectUrl = await this.authService.logout(decodedAccessToken.sub.id)
        //get the next param and pass to login.html for rendering below
        const next = query['next'];
        return next ? next : redirectUrl; //override the default redirect declared above
    }

    @Get("/facebook")
    @UseGuards(FacebookAuthGuard)
    async facebookLogin(): Promise<any> {
        return HttpStatus.OK;
    }

    @Get("/facebook/redirect")
    @UseGuards(FacebookAuthGuard)
    async facebookLoginRedirect(@Req() req: Request, @Res() reply: Reply): Promise<any> {
        /* Instead of returning, I to call authService.facebookLogin to do the final job if checking if the user already exists.
        If not, it will optionally create a new user. jwt will then be created as usual for this new or existing authenticated user
        return {
            statusCode: HttpStatus.OK,
            data: req.user,
        };
        */
       const tokens = await this.authService.loginFacebookUser(req);//pass req that has user being passed by FacebookStrategy is FacebookProfileDto

       //reply.headers([{access_token: tokens.access_token,refresh_token: tokens.refresh_token}])
       reply.view('auth/login.html',
            {
                apiVersion: API_VERSION !== null ? `${API_VERSION}` : '',
                loginUrl: API_VERSION !== null ? `/${API_VERSION}/auth/login` : '/auth/login',
                forgotPasswordUrl: API_VERSION !== null ? `/${API_VERSION}/users/reset-password-request` : '/users/reset-password-request',
                title: 'SGVI-1 Mini CMS Logging you in.',
                loginActive: 'true',
                access_token: tokens.access_token,
                refresh_token: tokens.refresh_token,
                saveTokensInClient: 'true'
            })

    }
}

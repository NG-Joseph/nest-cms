import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { jwtConstants } from '../../global/app.settings';
import { AuthTokenPayload, Request } from '../../global/custom.interfaces';
import { AuthService } from '../auth.service';

/**
 * This illustrates the use of cookie-based strategy for Web only. Not really using it. Using the bearer token approach 
 */
@Injectable()
export class JwtCookieBasedRefreshStrategy extends PassportStrategy(Strategy, 'jwt-cookie-based-refresh-token') {
  constructor(private authService: AuthService) {

    //below, we expect to read token from cookie
    super({
        jwtFromRequest: ExtractJwt.fromExtractors([(req: any) => {
          return req.cookies.Refresh;//notice the Refresh name here
        }]),
        secretOrKey: jwtConstants.REFRESH_SECRET,
        passReqToCallback: true //pass request to callback
      });
      

  }

  /**
   * override validate. This is the equivalent of local.strategy.ts validate. This requires no password.
   * @param request //request sent on call back as indicated in line 20 above
   * @param payload 
   */
  async validate(request: Request, payload: AuthTokenPayload) {
    
    //Get the refresh token sent in request from cookie
    const refreshToken = request.cookies?.Refresh;

    const user = await this.authService.validateRefreshToken(refreshToken, payload.sub.id); //note that this call will return User, if valid

    if(!user){
      throw new UnauthorizedException();
    }else{
      return user;
    }
  }
}
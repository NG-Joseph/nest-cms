import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { jwtConstants } from '../../global/app.settings';
import { AuthTokenPayload } from '../../global/custom.interfaces';
import { AuthService } from '../auth.service';
import { Request } from '../../global/custom.interfaces'


@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh-token') {//this name, jwt-refresh-token will be used in the equivalent guard
  constructor(private authService: AuthService) {
    
    //below, we expect token to be sent from client as bearer token
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.REFRESH_SECRET, //it is about refresh
      passReqToCallback: true //pass request to callback
    });

  }

  /**
   * override validate. This is the equivalent of local.strategy.ts validate. This requires no password.
   * @param request //request sent on call back as indicated in line 20 above
   * @param payload 
   */
  async validate(request: Request, payload: AuthTokenPayload) {
    //Get the refresh token sent in request
    const authorization = request.headers.authorization; // 'Bearer <JWT-refresh-token>'
    const refreshToken = authorization.split(' ')[1]//tokenize and take the second part

    const user = await this.authService.validateRefreshToken(refreshToken, payload.sub.id);

    if(!user){
      throw new UnauthorizedException();
    }else{
      //return {user, refreshToken};//returning the old refresh along with user. creating a new refresh token will be too costly
      //no need to return refreshToken as above the client already has it.
      return user;
    }
  }
}
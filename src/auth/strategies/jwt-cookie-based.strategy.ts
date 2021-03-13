import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { jwtConstants } from 'src/global/app.settings';
import { AuthTokenPayload } from 'src/global/custom.interfaces';

/**
 * This illustrates the use of cookie-based strategy for Web only. Not really using it. Using the bearer token approach 
 */
@Injectable()
export class JwtCookieBasedStrategy extends PassportStrategy(Strategy, 'jwt-cookie-based-token') {
  constructor() {

    //below, we expect to read token from cookie
    super({
        jwtFromRequest: ExtractJwt.fromExtractors([(req: any) => {
          return req.cookies.Authentication;//notice the Authentication name here
        }]),
        secretOrKey: jwtConstants.SECRET,
      });
      

  }

  /**
   * override validate
   * @param payload 
   */
  async validate(payload: AuthTokenPayload) {
    return { sub: payload.sub, username: payload.username };
  }
}
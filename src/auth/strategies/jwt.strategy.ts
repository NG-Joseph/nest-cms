import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { jwtConstants } from 'src/global/app.settings';
import { AuthTokenPayload } from 'src/global/custom.interfaces';


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    
    //below, we expect token to be sent from client as bearer token
    
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
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
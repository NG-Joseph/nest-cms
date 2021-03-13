import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
 
@Injectable()
export default class JwtCookieBasedGuard extends AuthGuard('jwt-cookie-based-token') {}
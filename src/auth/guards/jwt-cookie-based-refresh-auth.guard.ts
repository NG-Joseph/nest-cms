import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
 
@Injectable()
export default class JwtCookieBasedRefreshGuard extends AuthGuard('jwt-cookie-based-refresh-token') {}
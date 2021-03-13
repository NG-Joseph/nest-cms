import { applyDecorators, UseGuards } from '@nestjs/common';
import JwtAuthGuard from '../guards/jwt-auth.guard';
import LandlordAdminGuard from '../guards/landlord-admin-auth.guard';

/**
 * Combine guards more neatly
 */
export function LandlordAdminAuth() {
  return applyDecorators(
    UseGuards(JwtAuthGuard, LandlordAdminGuard)
  );
}
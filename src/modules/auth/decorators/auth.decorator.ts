import { applyDecorators, UseGuards } from '@nestjs/common';
import { ValidRoles } from '../interfaces';
import { RolesProtected } from './roles-protected.decorator';
import { AuthGuard } from '@nestjs/passport';
import { UserRoleGuard } from '../guard/user-role/user-role.guard';

export function Auth(...roles: ValidRoles[]) {
  return applyDecorators(
    RolesProtected(...roles),
    UseGuards(AuthGuard(), UserRoleGuard),
  );
}

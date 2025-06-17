import { Reflector } from '@nestjs/core';
import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class UserRoleGuard implements CanActivate {
  constructor(private readonly _reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const validRoles: string[] = this._reflector.get(
      'META_ROLES',
      context.getHandler(),
    );

    if (!validRoles) return true;

    if (validRoles.length === 0) return true;

    const req = context.switchToHttp().getRequest();

    const user = req.user;

    if (!user) throw new BadRequestException('User not found');

    for (const role of user.roles) {
      if (validRoles.includes(role)) {
        return true;
      }
    }

    throw new BadRequestException(
      `User ${user.fullName} need a valid role: [${validRoles}]`,
    );
  }
}

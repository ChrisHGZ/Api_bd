import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from '../entity/user.entity';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../interfaces';
import { status } from 'src/modules/shared/status-entity.enum';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    configService: ConfigService,
  ) {
    super({
      secretOrKey: configService.get('JWT_SECRET'),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  public async validate(payload: JwtPayload) {
    const { id } = payload;

    const queryBuilder = this.userRepository.createQueryBuilder('user');

    const user = await queryBuilder
      .where('user.id = :id', { id: id })
      .andWhere('user.status = :status', { status: status.ACTIVE })
      .getOne();

    if (!user) throw new UnauthorizedException('Token not valid');

    delete user.password;

    return user;
  }
}

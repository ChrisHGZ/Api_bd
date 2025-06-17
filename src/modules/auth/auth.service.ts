import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dtos/create-user.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces';
import { LoginUserDto } from './dtos/login-user.dto';
import { status } from '../shared/status-entity.enum';


@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly _jwtService: JwtService,
  ) {}

  public async register(createUserDto: CreateUserDto) {
    try {
      const { password, ...rest } = createUserDto;
      const salt = 10;
      const user = this.userRepository.create({
        ...rest,
        password: bcrypt.hashSync(password, salt),
      });

      await this.userRepository.save(user);

      delete user.password;

      return {
        ...user,
        token: this.getJwtToken({ id: user.id }),
      };
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  public async login(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;

    const queryBuilder = this.userRepository.createQueryBuilder('user');

    const user = await queryBuilder
      .where('user.email = :email', { email: email })
      .getOne();

    if (!user) throw new BadRequestException('Credentials are not valid');

    if (!bcrypt.compare(password, user.password))
      throw new BadRequestException('Credentials are not valid');

    delete user.password;

    return {
      ...user,
      token: this.getJwtToken({ id: user.id }),
    };
  }

  public async checkAuthStatus(user: User) {
    return {
      ...user,
      token: this.getJwtToken({ id: user.id }),
    };
  }

  public getOne(id: string) {
    const queryBuilder = this.userRepository.createQueryBuilder('user');

    const user = queryBuilder
      .where('user.id = :id', { id: id })
      .andWhere('user.status = :status', { status: status.ACTIVE })
      .getOne();

    if (!user) throw new BadRequestException('User not found');

    return user;
  }

  private getJwtToken(payload: JwtPayload) {
    const token = this._jwtService.sign(payload);
    return token;
  }

  private handleDBErrors(error: any): never {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new BadRequestException(error.sqlMessage);
    }
    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  }
}

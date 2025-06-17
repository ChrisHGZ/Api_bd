import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dtos/register.dto';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly _userRepository: Repository<User>,
    ) {}

    public async register(registerDto: RegisterDto){
        const {email, password} = registerDto;
        const salt = 10
        const hash = bcrypt.hashSync(password, salt)
        const user = this._userRepository.create({
            email,
            password: hash,
        })
         await this._userRepository.save(user)
         delete user.password
         return user
    }
}

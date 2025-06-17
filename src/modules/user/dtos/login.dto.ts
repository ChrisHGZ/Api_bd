import { IsEmail, IsNotEmpty, IsString, isString, MinLength } from "class-validator";

export class LoginDto {
    @IsNotEmpty()
    @IsString()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(6) 
    password: string;
}

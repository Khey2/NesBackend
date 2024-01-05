import { IsEmail, IsString, MinLength } from "class-validator";

export class CreateUserDto {
    //que informacion yo necesito para crear un usuario?
    //que informacion NECESITO RECIBIR DEL FRONTEND 
    //para crear un usuario

    @IsEmail()
    email: string;

    @IsString()
    name: string;

    @MinLength(6)
    password: string;

}

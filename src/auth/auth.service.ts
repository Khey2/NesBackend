import { BadRequestException, Body, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './entities/user.entity';
import { Model } from 'mongoose';

import * as bcryptjs from "bcryptjs";
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload';
import { LoginResponse } from './interfaces/login-response';
import { RegisterUserDto } from './dto/register-user.dto';

@Injectable()
export class AuthService {

  constructor(
    //injectando modelo, para poder interactuar con la Data Base
    @InjectModel(User.name) private userModel: Model<User>,
    //JWT service
    private jwtService: JwtService

  ){}


  async create(@Body() createUserDto: CreateUserDto): Promise<User> {

    try{
      const { password, ...userData  } = createUserDto;

      const newUser = new this.userModel({
        password: bcryptjs.hashSync( password, 10),
        ...userData
      });
      

      await newUser.save();
      const { password:_, ...user } = newUser.toJSON();

      return user;
    }catch(error){
      // 11000 = error de duplicated key(email)
      if( error.code === 11000){
        throw new BadRequestException(`${ createUserDto.email} already exist!`)
      }
      console.log(error)
      throw new InternalServerErrorException("Something terrible happen!!")
    }

    
  }

  async login(loginDto: LoginDto): Promise<LoginResponse>{
     const {email, password} = loginDto

     //el esquema te da metodos para interactuar con la tabla! (bueno Mongoose)
     //asi que estas diciendo, dentro de user guardame el resultado que encuentres
     //de buscar en la tabla (userModel) alguna fila que coincida exactamente el email
     const user = await this.userModel.findOne( { email: email })

     if( ! user ){
      throw new UnauthorizedException(" Not valid credentials - email");
     }

     //validacion contraseña
     //este metodo te permite comparar las contraseñas
     // " si no hacen match la comparacion"
     if( !bcryptjs.compareSync( password, user.password )){
        throw new UnauthorizedException("Not valid Credentials - Password");
     }

     const { password:_, ...rest } = user.toJSON();

     return {
      user: rest,
      token: this.getJwtToke({ id: user.id })
     }
  }
  
  // Promise<LoginResponse>
  async register(registerUserDto: RegisterUserDto){
    //registro de usuario
    /*
      usa el metodo de crear usuario y RETORNA una login reponse (token, user)
    */
    const user = await this.create(registerUserDto);
    console.log(user)

     return{
        user: user,
        token: this.getJwtToke({ id: user._id })
    }

  }


  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }



  getJwtToke( payload: JwtPayload ){
    //firmando el token con el payload
    const token = this.jwtService.sign( payload );
    return token;
  }
}

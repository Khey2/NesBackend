import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MongooseModule, SchemaFactory } from '@nestjs/mongoose';
import { User, UserSchema } from './entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports:[
    //acceso a variables de entorno (para que esten listas)
    ConfigModule.forRoot(),

    //modelos (entidades/schemas) permitidos
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema
      }
    ]),

    //configuracion de JWT
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SEED,
      signOptions: { expiresIn: '6h'} //expira en 6 horas
    })
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}

import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { userSchema } from './schema/user.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
    imports: [
    MongooseModule.forFeature([
      {schema: userSchema, name: 'user'}
    ])
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}

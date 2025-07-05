import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from './schema/user.schema';
import { QueryParamsDto } from './dto/query-params.dto';

@Injectable()
export class UserService {
  constructor(@InjectModel('user') private userModel: Model<User>) {}

  async create({ age, gender, fullName }: CreateUserDto) {
    const newUser = await this.userModel.create({ age, gender, fullName });

    return { success: 'ok', data: newUser };
  }

  async onModuleInit() {
    const { faker } = await import('@faker-js/faker');
    const count = await this.userModel.countDocuments();

    if (count === 0) {
      const dataToInsert: any = [];
      const genders = ['male', 'female', 'bidzinasexual', 'other'];

      for (let i = 0; i < 30_000; i++) {
        dataToInsert.push({
          fullName: faker.person.fullName(),
          age: faker.number.int({ min: 10, max: 30 }),
          gender: genders[Math.floor(Math.random() * genders.length)],
        });
      }

      await this.userModel.insertMany(dataToInsert);
      console.log('inserted successfully');
    }
  }

  async findUsersAmount() {
    const userCount = await this.userModel.countDocuments();
    return { message: `there is ${userCount} fake accounts` };
  }

  async findAll({
    fullName,
    gender,
    ageFrom,
    ageTo,
    age,
    page,
    take,
  }: QueryParamsDto) {
    const filter: any = {};
    if (fullName) {
      filter.fullName = { $regex: fullName, $options: 'i' };
    }
    if (gender) {
      filter.gender = { $regex: `\\b${gender}`, $options: 'i' };
    }

    if (age !== undefined && age !== null) {
      filter.age = age;
    } else {
      if (ageFrom !== undefined && ageFrom !== null) {
        filter.age = { ...filter.age, $gte: ageFrom };
      }
      if (ageTo !== undefined && ageTo !== null) {
        filter.age = { ...filter.age, $lte: ageTo };
      }
    }

    console.log(filter);
    const users = await this.userModel
      .find(filter)
      .skip((page - 1) * take)
      .limit(take);

    return users;
  }

  async findOne(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid user ID');
    }

    const user = await this.userModel.findById(id);
    console.log(user);

    if (!user) {
      throw new NotFoundException('No User Found With Matching Id');
    }

    return user;
  }

  async updateUserById(id: string, updateUserDto: UpdateUserDto) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid user ID');
    }

    const existingUser = await this.userModel.findById(id);

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    if (updateUserDto.fullName !== undefined) {
      existingUser.fullName = updateUserDto.fullName;
    }

    if (updateUserDto.age !== undefined) {
      existingUser.age = updateUserDto.age;
    }

    if (updateUserDto.gender !== undefined) {
      existingUser.gender = updateUserDto.gender;
    }

    await existingUser.save();

    return {
      message: 'User updated successfully',
      user: existingUser,
    };
  }

  async remove(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid user ID');
    }

    const user = await this.userModel.findByIdAndDelete(id);

    if (!user) {
      throw new NotFoundException('No User Found with that id');
    }
    return { message: 'deleted successfully', user };
  }
}

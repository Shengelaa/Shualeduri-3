import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class QueryParamsDto {
  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsString()
  age?: number;

  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  ageFrom?: number;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  ageTo?: number;

  @IsOptional()
  @Transform(({ value }) => Math.max(Number(value), 1))
  @IsNumber()
  page: number = 1;

  @IsOptional()
  @Transform(({ value }) => Math.min(value, 30))
  @IsNumber()
  take: number = 30;
}

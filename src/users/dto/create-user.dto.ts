import { ArrayNotEmpty, IsArray, IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  username!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsBoolean()
  isTestUser?: boolean;

  @IsArray()
  @ArrayNotEmpty()
  roleIds!: string[];
}

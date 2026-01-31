export class UserResponseDto {
  id!: string;
  username!: string;
  fullName!: string;
  isActive!: boolean;
  isTestUser!: boolean;
  roles!: string[];
  lastLoginAt!: Date | null;
}

export class UserResponseDto {
  id!: string;
  username!: string;
  isActive!: boolean;
  isTestUser!: boolean;
  roles!: string[];
  lastLoginAt!: Date | null;
}

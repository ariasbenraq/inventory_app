import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ministry } from './ministry.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Ministry])],
})
export class MinistriesModule {}

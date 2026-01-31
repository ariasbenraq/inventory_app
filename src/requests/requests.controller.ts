import { Body, Controller, Param, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import { AuthenticatedRequest } from '../common/types';
import { CreateRequestDto } from './dto/create-request.dto';
import { RequestResponseDto } from './dto/request-response.dto';
import { RequestsService } from './requests.service';

@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createRequest(
    @Req() request: AuthenticatedRequest,
    @Body() body: CreateRequestDto,
  ): Promise<RequestResponseDto> {
    const created = await this.requestsService.createRequest(
      request.user?.userId ?? '',
      body,
    );

    return {
      id: created.id,
      status: created.status,
      createdAt: created.createdAt,
    };
  }

  @Post(':id/fulfill')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('REQ_ADMIN')
  async fulfill(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
  ): Promise<void> {
    await this.requestsService.fulfillRequest(id, request.user?.userId ?? '');
  }
}

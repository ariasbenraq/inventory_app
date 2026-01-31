import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import { AuthenticatedRequest } from '../common/types';
import { CreateRequestDto } from './dto/create-request.dto';
import { RequestResponseDto } from './dto/request-response.dto';
import { RequestsService } from './requests.service';
import { UpdateRequestDto } from './dto/update-request.dto';
import { RequestDetailDto } from './dto/request-detail.dto';

@Controller('requests')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Post()
  @Roles('USER')
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

  @Patch(':id')
  @Roles('USER')
  async updateRequest(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: UpdateRequestDto,
  ): Promise<RequestDetailDto> {
    return this.requestsService.updateRequest(request.user?.userId ?? '', id, body);
  }

  @Patch(':id/cancel')
  @Roles('USER')
  async cancelRequest(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
  ): Promise<RequestDetailDto> {
    return this.requestsService.cancelRequest(request.user?.userId ?? '', id);
  }

  @Get('my')
  @Roles('USER')
  async getMyRequests(
    @Req() request: AuthenticatedRequest,
  ): Promise<RequestDetailDto[]> {
    return this.requestsService.getMyRequests(request.user?.userId ?? '');
  }

  @Get()
  @Roles('REQ_ADMIN')
  async getAllRequests(): Promise<RequestDetailDto[]> {
    return this.requestsService.getAllRequests();
  }

  @Post(':id/fulfill')
  @Roles('REQ_ADMIN')
  async fulfill(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
  ): Promise<void> {
    await this.requestsService.fulfillRequest(id, request.user?.userId ?? '');
  }

  @Post(':id/confirm-received')
  @Roles('USER')
  async confirmReceived(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
  ): Promise<RequestDetailDto> {
    return this.requestsService.confirmReceived(request.user?.userId ?? '', id);
  }
}

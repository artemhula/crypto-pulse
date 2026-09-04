import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard, type AuthenticatedRequest } from '../guards';
import { CreateAlertDto, UpdateAlertDto } from './dtos';
import { AlertService } from './alert.service';

@Controller('alerts')
@UseGuards(JwtAuthGuard)
@ApiTags('alerts')
@ApiBearerAuth('access-token')
export class AlertController {
  constructor(private readonly alertService: AlertService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user alerts' })
  @ApiOkResponse({ description: 'List of alerts' })
  findAll(@Req() request: AuthenticatedRequest) {
    return this.alertService.findAll(request.user!.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an alert by id' })
  findOne(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.alertService.findOne(id, request.user!.sub);
  }

  @Post()
  @ApiOperation({ summary: 'Create an alert' })
  @ApiCreatedResponse({ description: 'Created alert' })
  create(
    @Body() dto: CreateAlertDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.alertService.create(request.user!.sub, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an alert' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateAlertDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.alertService.update(id, request.user!.sub, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an alert' })
  remove(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.alertService.remove(id, request.user!.sub);
  }
}

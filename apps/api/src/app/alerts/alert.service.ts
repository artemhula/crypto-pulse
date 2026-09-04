import { Injectable, NotFoundException } from '@nestjs/common';
import { AlertRepository } from './alert.repository';
import { CreateAlertDto, UpdateAlertDto } from './dtos';

@Injectable()
export class AlertService {
  constructor(private readonly alertRepository: AlertRepository) {}

  findAll(userId: string) {
    return this.alertRepository.findAllByUserId(userId);
  }

  async findOne(id: string, userId: string) {
    const alert = await this.alertRepository.findByIdAndUserId(id, userId);
    if (!alert) {
      throw new NotFoundException('Alert not found');
    }
    return alert;
  }

  create(userId: string, dto: CreateAlertDto) {
    return this.alertRepository.create(userId, dto);
  }

  async update(id: string, userId: string, dto: UpdateAlertDto) {
    await this.findOne(id, userId);
    await this.alertRepository.update(id, userId, dto);
    return this.findOne(id, userId);
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    await this.alertRepository.delete(id, userId);
    return { success: true };
  }
}

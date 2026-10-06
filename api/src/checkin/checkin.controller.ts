import { Body, Controller, Get, Post } from '@nestjs/common';
import { CheckinService } from './checkin.service';
import { CreateCheckinDto } from './dto/create-checkin.dto';

@Controller('checkins') // todas as rotas começam com /checkins
export class CheckinController {
  constructor(private readonly checkinService: CheckinService) {}

  @Post() // POST /checkins  { "cpf": "11111111111" }
  criar(@Body() dto: CreateCheckinDto) {
    return this.checkinService.criar(dto.cpf);
  }

  @Get() // GET /checkins
  listar() {
    return this.checkinService.listar();
  }
}

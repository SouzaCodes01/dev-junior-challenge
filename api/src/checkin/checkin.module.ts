import { Module } from '@nestjs/common';
import { CadastroModule } from '../cadastro/cadastro.module';
import { CheckinController } from './checkin.controller';
import { CheckinService } from './checkin.service';

@Module({
  imports: [CadastroModule],
  controllers: [CheckinController],
  providers: [CheckinService],
})
export class CheckinModule {}

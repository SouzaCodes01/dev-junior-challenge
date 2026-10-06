import { Module } from '@nestjs/common';
import { CadastroService } from './cadastro.service';

@Module({
  providers: [CadastroService],
  exports: [CadastroService], // permite que outros módulos (checkin) usem o service
})
export class CadastroModule {}

import { Injectable } from '@nestjs/common';
import { CadastroService } from '../cadastro/cadastro.service';
import { Checkin } from './checkin.entity';

@Injectable()
export class CheckinService {
  // Persistência em MEMÓRIA: some quando a API reinicia (permitido no desafio).
  private readonly fila: Checkin[] = [];
  private proximoId = 1;

  // O Nest injeta o CadastroService aqui (injeção de dependência).
  constructor(private readonly cadastro: CadastroService) {}

  async criar(cpf: string): Promise<Checkin> {
    // Se o CPF não existir, o CadastroService lança erro e nada é salvo.
    const paciente = await this.cadastro.buscarPacientePorCpf(cpf);

    const checkin: Checkin = {
      id: this.proximoId++,
      cpf: paciente.cpf,
      nome: paciente.nome,
      chegadaEm: new Date().toISOString(),
    };
    this.fila.push(checkin);
    return checkin;
  }

  // Só os check-ins de HOJE, em ordem de chegada (o primeiro a chegar fica no topo).
  // "Hoje" segue o fuso do servidor; ao virar o dia a fila "zera" sozinha.
  listar(): Checkin[] {
    const hoje = new Date().toDateString();
    return this.fila.filter(
      (c) => new Date(c.chegadaEm).toDateString() === hoje,
    );
  }
}

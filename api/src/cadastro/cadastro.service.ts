import {
  BadGatewayException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';

export interface Paciente {
  cpf: string;
  nome: string;
  dataNascimento: string;
}

// Responsável por conversar com o serviço EXTERNO de cadastro (mock-service).
// Fica separado do check-in para que a regra de negócio não dependa de HTTP.
@Injectable()
export class CadastroService {
  private readonly logger = new Logger(CadastroService.name);
  private readonly baseUrl = process.env.CADASTRO_URL ?? 'http://localhost:4000';

  async buscarPacientePorCpf(cpf: string): Promise<Paciente> {
    let resposta: Response;
    try {
      resposta = await fetch(`${this.baseUrl}/pacientes/${cpf}`);
    } catch (erro) {
      // Serviço fora do ar / rede: não é culpa do usuário, então não é 4xx.
      this.logger.error(`Falha ao acessar o cadastro: ${String(erro)}`);
      throw new BadGatewayException('Serviço de cadastro indisponível');
    }

    if (resposta.status === 404) {
      throw new NotFoundException('CPF não encontrado no cadastro');
    }
    if (!resposta.ok) {
      this.logger.error(`Cadastro respondeu ${resposta.status}`);
      throw new BadGatewayException('Erro ao consultar o serviço de cadastro');
    }

    return (await resposta.json()) as Paciente;
  }
}

import { NotFoundException } from '@nestjs/common';
import { CadastroService } from '../cadastro/cadastro.service';
import { CheckinService } from './checkin.service';

describe('CheckinService', () => {
  let cadastro: { buscarPacientePorCpf: jest.Mock };
  let service: CheckinService;

  beforeEach(() => {
    // "Mock" do serviço externo: o teste não depende do mock-service estar no ar.
    cadastro = { buscarPacientePorCpf: jest.fn() };
    service = new CheckinService(cadastro as unknown as CadastroService);
  });

  it('registra o check-in com o nome vindo do cadastro', async () => {
    cadastro.buscarPacientePorCpf.mockResolvedValue({
      cpf: '11111111111',
      nome: 'Ana Souza',
      dataNascimento: '1988-03-12',
    });

    const checkin = await service.criar('11111111111');

    expect(checkin).toMatchObject({
      id: 1,
      nome: 'Ana Souza',
      cpf: '11111111111',
    });
    expect(service.listar()).toHaveLength(1);
  });

  it('não registra nada quando o CPF não existe', async () => {
    cadastro.buscarPacientePorCpf.mockRejectedValue(new NotFoundException());

    await expect(service.criar('99999999999')).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(service.listar()).toHaveLength(0);
  });

  it('mantém a ordem de chegada na fila', async () => {
    cadastro.buscarPacientePorCpf
      .mockResolvedValueOnce({ cpf: '1', nome: 'Primeiro' })
      .mockResolvedValueOnce({ cpf: '2', nome: 'Segundo' });

    await service.criar('1');
    await service.criar('2');

    expect(service.listar().map((c) => c.nome)).toEqual([
      'Primeiro',
      'Segundo',
    ]);
  });
});

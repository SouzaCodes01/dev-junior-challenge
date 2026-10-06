import { BadGatewayException, NotFoundException } from '@nestjs/common';
import { CadastroService } from './cadastro.service';

describe('CadastroService', () => {
  let service: CadastroService;
  let fetchMock: jest.SpyInstance;

  beforeEach(() => {
    // Simula o fetch: o teste não depende do mock-service estar no ar.
    fetchMock = jest.spyOn(global, 'fetch');
    service = new CadastroService();
    // Silencia o log de erro esperado nos cenários de falha.
    jest.spyOn(service['logger'], 'error').mockImplementation(() => undefined);
  });

  afterEach(() => jest.restoreAllMocks());

  it('retorna o paciente quando o cadastro responde 200', async () => {
    const paciente = {
      cpf: '11111111111',
      nome: 'Ana Souza',
      dataNascimento: '1988-03-12',
    };
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify(paciente), { status: 200 }),
    );

    await expect(service.buscarPacientePorCpf('11111111111')).resolves.toEqual(
      paciente,
    );
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/pacientes/11111111111'),
    );
  });

  it('lança NotFoundException quando o CPF não existe (404)', async () => {
    fetchMock.mockResolvedValue(new Response('{}', { status: 404 }));

    await expect(
      service.buscarPacientePorCpf('99999999999'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('lança BadGatewayException quando o cadastro está fora do ar', async () => {
    fetchMock.mockRejectedValue(new Error('ECONNREFUSED'));

    await expect(
      service.buscarPacientePorCpf('11111111111'),
    ).rejects.toBeInstanceOf(BadGatewayException);
  });

  it('lança BadGatewayException quando o cadastro responde 500', async () => {
    fetchMock.mockResolvedValue(new Response('{}', { status: 500 }));

    await expect(
      service.buscarPacientePorCpf('11111111111'),
    ).rejects.toBeInstanceOf(BadGatewayException);
  });
});

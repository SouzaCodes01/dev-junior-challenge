import {
  INestApplication,
  NotFoundException,
  ValidationPipe,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { CadastroService } from '../src/cadastro/cadastro.service';
import { CheckinModule } from '../src/checkin/checkin.module';

describe('Check-in (e2e)', () => {
  let app: INestApplication<App>;
  const cadastro = { buscarPacientePorCpf: jest.fn() };

  beforeEach(async () => {
    cadastro.buscarPacientePorCpf.mockReset();
    // Sobe a API de verdade (rotas + validação), trocando só o serviço externo.
    const modulo = await Test.createTestingModule({ imports: [CheckinModule] })
      .overrideProvider(CadastroService)
      .useValue(cadastro)
      .compile();

    app = modulo.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true }),
    );
    await app.init();
  });

  afterEach(() => app.close());

  it('POST /checkins registra e GET /checkins lista na ordem de chegada', async () => {
    cadastro.buscarPacientePorCpf
      .mockResolvedValueOnce({ cpf: '11111111111', nome: 'Ana Souza' })
      .mockResolvedValueOnce({ cpf: '22222222222', nome: 'Bruno Lima' });

    const criado = await request(app.getHttpServer())
      .post('/checkins')
      .send({ cpf: '111.111.111-11' }) // com máscara
      .expect(201);
    expect(criado.body).toMatchObject({
      id: 1,
      cpf: '11111111111',
      nome: 'Ana Souza',
    });
    expect(cadastro.buscarPacientePorCpf).toHaveBeenCalledWith('11111111111');

    await request(app.getHttpServer())
      .post('/checkins')
      .send({ cpf: '22222222222' })
      .expect(201);

    const fila = await request(app.getHttpServer())
      .get('/checkins')
      .expect(200);
    const nomes = (fila.body as { nome: string }[]).map((c) => c.nome);
    expect(nomes).toEqual(['Ana Souza', 'Bruno Lima']);
  });

  it('POST /checkins devolve 404 quando o CPF não existe e não entra na fila', async () => {
    cadastro.buscarPacientePorCpf.mockRejectedValue(
      new NotFoundException('CPF não encontrado no cadastro'),
    );

    const resposta = await request(app.getHttpServer())
      .post('/checkins')
      .send({ cpf: '99999999999' })
      .expect(404);
    expect((resposta.body as { message: string }).message).toBe(
      'CPF não encontrado no cadastro',
    );

    const fila = await request(app.getHttpServer())
      .get('/checkins')
      .expect(200);
    expect(fila.body).toEqual([]);
  });

  it('POST /checkins devolve 400 para CPF inválido sem consultar o cadastro', async () => {
    await request(app.getHttpServer())
      .post('/checkins')
      .send({ cpf: '123' })
      .expect(400);
    expect(cadastro.buscarPacientePorCpf).not.toHaveBeenCalled();
  });
});

import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateCheckinDto } from './create-checkin.dto';

// Mesmo caminho que o ValidationPipe do main.ts faz: transforma e depois valida.
async function validar(corpo: unknown) {
  const dto = plainToInstance(CreateCheckinDto, corpo);
  return { dto, erros: await validate(dto) };
}

describe('CreateCheckinDto', () => {
  it('aceita 11 dígitos', async () => {
    const { erros } = await validar({ cpf: '11111111111' });
    expect(erros).toHaveLength(0);
  });

  it('aceita CPF com máscara e normaliza para só dígitos', async () => {
    const { dto, erros } = await validar({ cpf: '111.111.111-11' });
    expect(erros).toHaveLength(0);
    expect(dto.cpf).toBe('11111111111');
  });

  it('rejeita CPF com menos de 11 dígitos', async () => {
    const { erros } = await validar({ cpf: '123' });
    expect(erros).toHaveLength(1);
  });

  it('rejeita CPF com mais de 11 dígitos', async () => {
    const { erros } = await validar({ cpf: '111111111111' });
    expect(erros).toHaveLength(1);
  });

  it('rejeita CPF vazio ou ausente', async () => {
    expect((await validar({ cpf: '' })).erros).toHaveLength(1);
    expect((await validar({})).erros).toHaveLength(1);
  });
});

import { Transform } from 'class-transformer';
import { Matches } from 'class-validator';

// DTO = formato esperado do corpo da requisição POST /checkins.
export class CreateCheckinDto {
  // Aceita "111.111.111-11" e converte para "11111111111" antes de validar.
  @Transform(({ value }) =>
    typeof value === 'string' ? value.replace(/\D/g, '') : value,
  )
  @Matches(/^\d{11}$/, { message: 'CPF deve conter 11 dígitos' })
  cpf!: string;
}

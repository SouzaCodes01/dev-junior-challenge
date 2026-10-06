// Camada de acesso à API: concentra as chamadas HTTP em um só lugar.
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export interface Checkin {
  id: number;
  cpf: string;
  nome: string;
  chegadaEm: string;
}

// Extrai a mensagem de erro que a API (NestJS) devolve no corpo da resposta.
async function mensagemDeErro(resposta: Response): Promise<string> {
  try {
    const corpo = await resposta.json();
    return Array.isArray(corpo.message) ? corpo.message.join(', ') : corpo.message;
  } catch {
    return 'Erro inesperado. Tente novamente.';
  }
}

export async function listarFila(): Promise<Checkin[]> {
  const resposta = await fetch(`${API_URL}/checkins`);
  if (!resposta.ok) throw new Error(await mensagemDeErro(resposta));
  return resposta.json();
}

export async function criarCheckin(cpf: string): Promise<Checkin> {
  const resposta = await fetch(`${API_URL}/checkins`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cpf }),
  });
  if (!resposta.ok) throw new Error(await mensagemDeErro(resposta));
  return resposta.json();
}

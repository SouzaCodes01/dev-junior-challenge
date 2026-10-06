# Entrega — Gabriel Rodrigues

## Como rodar
Pré-requisito: Node.js 20+ (testei com Node 22). São 3 terminais, na raiz do repositório:

```bash
# 1) Serviço de cadastro (mock) — http://localhost:4000
cd mock-service && npm install && npm start

# 2) API NestJS — http://localhost:3000
cd api && npm install && npm run start:dev

# 3) Front-end React — http://localhost:5173
cd web && npm install && npm run dev
```

Abra http://localhost:5173, digite um CPF de teste (ex.: `11111111111`) e clique em "Fazer check-in".

Testes unitários da API: `cd api && npm test`.

Configuração opcional (já há valores padrão): `CADASTRO_URL` na API (padrão `http://localhost:4000`), `PORT` na API (padrão `3000`) e `VITE_API_URL` no front (padrão `http://localhost:3000`, veja `web/.env.example`).

### Endpoints
| Método | Rota | Descrição |
|---|---|---|
| POST | `/checkins` | Body `{ "cpf": "11111111111" }`. Consulta o cadastro e registra na fila. 201 com o check-in; 400 se o CPF não tiver 11 dígitos; 404 se o CPF não existir; 502 se o cadastro estiver fora do ar. |
| GET | `/checkins` | Lista a fila em ordem de chegada. |

## O que foi feito
- **API (NestJS + TypeScript):** módulo `cadastro` (consome o `mock-service` com `fetch`) e módulo `checkin` (controller, service, DTO). O CPF aceita máscara (`111.111.111-11`); é normalizado e validado (11 dígitos).
- **Erros claros:** CPF inexistente devolve 404 com a mensagem "CPF não encontrado no cadastro"; cadastro indisponível devolve 502.
- **Front-end (React + Vite + TypeScript):** formulário de CPF, mensagem de sucesso/erro e lista da fila, atualizada após cada check-in.
- **Teste:** 3 testes unitários (Jest) do `CheckinService`: registra com o nome do cadastro, não registra se o CPF não existe e mantém a ordem de chegada.

## Onde guardei os dados
**Em memória** (um array dentro do `CheckinService`). Escolhi assim para priorizar o fluxo completo funcionando no tempo estimado. A fila é perdida quando a API reinicia.

## Decisões e dificuldades
- Separei a chamada ao serviço externo (`CadastroService`) da regra do check-in, para o service de check-in poder ser testado com o cadastro "simulado".
- Usei `fetch` nativo do Node em vez de uma biblioteca HTTP, para não adicionar dependência.
- Usei NestJS 11 com Jest, o formato mais comum na documentação.
- Não bloqueei check-ins repetidos do mesmo CPF: o enunciado não pede, e é uma regra de negócio que eu validaria com a recepção.
- Usei o assistente de IA Claude como apoio no desenvolvimento e para estudar o código.

## O que faria com mais tempo
- Persistir em PostgreSQL (o `docker-compose.yml` já tem o banco) e subir api/web via Docker Compose.
- Definir a regra para check-in repetido e "fila do dia" (zerar à meia-noite).
- Testes do front (React Testing Library) e teste e2e da API.
- Atualizar a fila automaticamente (polling) para a recepção ver novos check-ins sem recarregar.

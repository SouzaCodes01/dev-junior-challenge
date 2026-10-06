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

Testes da API: `cd api && npm test` (unitários) e `npm run test:e2e` (endpoints).

Configuração opcional (já há valores padrão): `CADASTRO_URL` na API (padrão `http://localhost:4000`), `PORT` na API (padrão `3000`) e `VITE_API_URL` no front (padrão `http://localhost:3000`, veja `web/.env.example`).

### Endpoints
| Método | Rota | Descrição |
|---|---|---|
| POST | `/checkins` | Body `{ "cpf": "11111111111" }`. Consulta o cadastro e registra na fila. 201 com o check-in; 400 se o CPF não tiver 11 dígitos; 404 se o CPF não existir; 502 se o cadastro estiver fora do ar. |
| GET | `/checkins` | Lista a fila **do dia** (só os check-ins de hoje) em ordem de chegada. |

## O que foi feito
- **API (NestJS + TypeScript):** módulo `cadastro` (consome o `mock-service` com `fetch`) e módulo `checkin` (controller, service, DTO). O CPF aceita máscara (`111.111.111-11`); é normalizado e validado (11 dígitos).
- **Erros claros:** CPF inexistente devolve 404 com a mensagem "CPF não encontrado no cadastro"; cadastro indisponível devolve 502.
- **Front-end (React + Vite + TypeScript):** formulário de CPF com máscara (o botão só ativa com 11 dígitos), mensagem de sucesso/erro e lista da fila. A fila é atualizada após cada check-in e também sozinha, a cada 5 segundos (polling), para a recepção ver novos check-ins sem recarregar.
- **Fila do dia:** `GET /checkins` devolve só os check-ins de hoje; quando o dia vira, a fila "zera" sozinha (o dia segue o fuso do servidor).
- **Testes (17, Jest):**
  - `CheckinService` (5): registra com o nome do cadastro, não registra se o CPF não existe, mantém a ordem de chegada, lista só os de hoje e zera na virada do dia (relógio simulado).
  - `CadastroService` (4), com `fetch` simulado: paciente encontrado (200), CPF inexistente (404), cadastro fora do ar e resposta 500 (ambos viram 502).
  - `CreateCheckinDto` (5): aceita 11 dígitos e CPF com máscara (normalizado), rejeita CPF curto, longo, vazio ou ausente.
  - e2e dos endpoints (3), com o cadastro simulado: `POST` + `GET /checkins` em ordem de chegada, 404 para CPF inexistente (sem entrar na fila) e 400 para CPF inválido.

## Onde guardei os dados
**Em memória** (um array dentro do `CheckinService`). Escolhi assim para priorizar o fluxo completo funcionando no tempo estimado. A fila é perdida quando a API reinicia.

## Decisões e dificuldades
- Separei a chamada ao serviço externo (`CadastroService`) da regra do check-in, para o service de check-in poder ser testado com o cadastro "simulado".
- Usei `fetch` nativo do Node em vez de uma biblioteca HTTP, para não adicionar dependência.
- Usei NestJS 11 com Jest, o formato mais comum na documentação.
- Não bloqueei check-ins repetidos do mesmo CPF: o enunciado não pede, e é uma regra de negócio que eu validaria com a recepção.

## O que faria com mais tempo
- Persistir em PostgreSQL (o `docker-compose.yml` já tem o banco) e subir api/web via Docker Compose.
- Definir a regra para check-in repetido (hoje o mesmo CPF pode entrar mais de uma vez).
- Tornar o fuso do "dia" configurável (hoje usa o do servidor).
- Testes do front (React Testing Library).

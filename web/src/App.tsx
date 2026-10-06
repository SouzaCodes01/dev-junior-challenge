import { useEffect, useState, type FormEvent } from 'react';
import { criarCheckin, listarFila, type Checkin } from './api';
import './index.css';

function formatarHora(iso: string) {
  return new Date(iso).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function App() {
  // Estado = dados que, ao mudar, fazem a tela ser redesenhada.
  const [cpf, setCpf] = useState('');
  const [fila, setFila] = useState<Checkin[]>([]);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function carregarFila() {
    try {
      setFila(await listarFila());
    } catch {
      setErro('Não foi possível carregar a fila. A API está no ar?');
    }
  }

  // Roda uma vez quando a tela abre ([] = sem dependências).
  useEffect(() => {
    carregarFila();
  }, []);

  async function aoEnviar(evento: FormEvent) {
    evento.preventDefault(); // evita recarregar a página
    setErro('');
    setSucesso('');
    setEnviando(true);
    try {
      const checkin = await criarCheckin(cpf);
      setSucesso(`Check-in realizado: ${checkin.nome}`);
      setCpf('');
      await carregarFila();
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro inesperado');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main>
      <h1>Check-in de pacientes</h1>

      <form onSubmit={aoEnviar}>
        <label htmlFor="cpf">CPF</label>
        <input
          id="cpf"
          value={cpf}
          onChange={(e) => setCpf(e.target.value)}
          placeholder="Somente números"
          inputMode="numeric"
          maxLength={14}
        />
        <button type="submit" disabled={enviando || cpf.trim() === ''}>
          {enviando ? 'Enviando...' : 'Fazer check-in'}
        </button>
      </form>

      {erro && <p role="alert" className="erro">{erro}</p>}
      {sucesso && <p role="status" className="sucesso">{sucesso}</p>}

      <h2>Fila de atendimento</h2>
      {fila.length === 0 ? (
        <p>Nenhum paciente na fila.</p>
      ) : (
        <ol>
          {fila.map((c) => (
            <li key={c.id}>
              <strong>{c.nome}</strong> — chegou às {formatarHora(c.chegadaEm)}
            </li>
          ))}
        </ol>
      )}
    </main>
  );
}

import { useEffect, useState, type FormEvent } from 'react';
import { criarCheckin, listarFila, type Checkin } from './api';
import './index.css';

function formatarHora(iso: string) {
  return new Date(iso).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Mostra o CPF com máscara enquanto a pessoa digita: 111.111.111-11
function mascararCpf(valor: string) {
  const d = valor.replace(/\D/g, '').slice(0, 11);
  return d
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1-$2');
}

// De quanto em quanto tempo a fila é atualizada sozinha (ms).
const INTERVALO_FILA = 5000;

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

  // Carrega a fila ao abrir a tela e a atualiza sozinha, para a recepção ver
  // novos check-ins sem recarregar. O `return` desliga o timer ao sair da tela.
  useEffect(() => {
    let primeiraCarga = true;
    function atualizar() {
      listarFila()
        .then(setFila)
        .catch(() => {
          // Só avisa na primeira vez; falhas do polling não enchem a tela de erros.
          if (primeiraCarga) {
            setErro('Não foi possível carregar a fila. A API está no ar?');
          }
        })
        .finally(() => {
          primeiraCarga = false;
        });
    }
    atualizar();
    const timer = setInterval(atualizar, INTERVALO_FILA);
    return () => clearInterval(timer);
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
          onChange={(e) => setCpf(mascararCpf(e.target.value))}
          placeholder="000.000.000-00"
          inputMode="numeric"
          maxLength={14}
        />
        <button type="submit" disabled={enviando || cpf.replace(/\D/g, '').length !== 11}>
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

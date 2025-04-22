/* eslint-disable  @typescript-eslint/no-explicit-any */

'use client';

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

// URL das estatísticas anônimas (substitua pelo seu próprio endpoint se desejar)
const ANALYTICS_URL = process.env.NEXT_PUBLIC_ANALYTICS_URL || '';
const ANALYTICS_ID = process.env.NEXT_PUBLIC_ANALYTICS_ID || '';

/**
 * Componente Analytics que carrega scripts de análise opcionais
 * e rastreia visualizações de página de forma anônima
 */
export function Analytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Rastreia mudanças de página
  useEffect(() => {
    if (!ANALYTICS_URL) return;

    // Coleta apenas dados anônimos - caminho da página e referenciador
    const pageViewData = {
      path: pathname,
      referrer: document.referrer || 'direct',
      userAgent: navigator.userAgent,
      language: navigator.language,
      timestamp: new Date().toISOString(),
    };

    // Envio de estatísticas de forma assíncrona
    const sendPageView = async () => {
      try {
        if (navigator.sendBeacon) {
          // Usar sendBeacon para garantir que os dados sejam enviados mesmo que a página seja fechada
          navigator.sendBeacon(
            ANALYTICS_URL,
            JSON.stringify(pageViewData)
          );
        } else {
          // Fallback para fetch
          await fetch(ANALYTICS_URL, {
            method: 'POST',
            body: JSON.stringify(pageViewData),
            headers: {
              'Content-Type': 'application/json',
            },
            keepalive: true,
          });
        }
      } catch (error) {
        // Silenciosamente falha - analytics não devem interromper a experiência do usuário
        console.debug('Analytics error:', error);
      }
    };

    // Acionar envio de visualização de página
    sendPageView();

    // Aciona a função de pageview do Google Analytics, se presente
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'page_view', {
        page_path: pathname,
      });
    }
  }, [pathname, searchParams]);

  // Se não houver ID de analytics, não carregue nada
  if (!ANALYTICS_ID) {
    return null;
  }

  return (
    <>
      {/* Google Analytics (opcional - carregado apenas se ANALYTICS_ID estiver definido) */}
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${ANALYTICS_ID}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${ANALYTICS_ID}', {
              page_path: window.location.pathname,
              anonymize_ip: true,
              cookie_flags: 'SameSite=None;Secure'
            });
          `,
        }}
      />
    </>
  );
}

// Declare a propriedade gtag no objeto window
declare global {
  interface Window {
    gtag: (
      command: string,
      action: string,
      params?: Record<string, any>
    ) => void;
  }
}
import type { Metadata } from "next";
import "./globals.css";
import { Montserrat } from "next/font/google";
import ClientLayoutWrapper from "./clienteLayoutWrapper";

export const metadata: Metadata = {
  title: {
    default:
      "Matrix Aplicativos - Soluções em Aplicativos para Vendas e Logística",
    template: "%s | Matrix Aplicativos",
  },
  description:
    "Aplicativo de força de vendas offline e gestão de coletas para empresas. Aumente produtividade, controle pedidos e otimize logística com tecnologia integrada ao seu ERP.",
  keywords: [
    "força de vendas",
    "aplicativo de vendas",
    "gestão de coletas",
    "logística reversa",
    "ERP integrado",
    "pedidos offline",
    "aplicativo para representantes",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Matrix Aplicativos - Transforme suas Vendas e Coletas",
    description:
      "Soluções em aplicativos móveis para equipes de vendas e gestão logística.",
    url: "https://www.matrixapps.com.br",
    siteName: "Matrix Apps",
    images: [
      {
        url: "https://www.matrixapps.com.br/img",
        width: 1200,
        height: 630,
        alt: "Matrix Apps - Soluções em Aplicativos",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Matrix Aplicativos - Soluções em Aplicativos para Vendas e Logística",
    description:
      "Aplicativo de força de vendas offline e gestão de coletas para empresas.",
    images: ["https://www.matrixapps.com.br/images/twitter-card.jpg"],
  },
  verification: {
    google: "SEU_GOOGLE_VERIFICATION_CODE",
    other: {
      "msvalidate.01": "SEU_BING_VERIFICATION_CODE",
    },
  },
  alternates: {
    canonical: "https://www.matrixapps.com.br",
  },
};

const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat", // Cria uma variável CSS para usarmos no globals
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />

        <script
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', 'SEU_PIXEL_ID');
              fbq('track', 'PageView');
            `,
          }}
        />
      </head>
      <body
        className={`${montserrat.variable} min-h-screen bg-white text-gray-800 antialiased`}
        style={{ background: "white" }}
      >
        <ClientLayoutWrapper>{children}</ClientLayoutWrapper>

        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=SEU_GTM_ID`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
      </body>
    </html>
  );
}

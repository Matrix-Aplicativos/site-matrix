"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link as ScrollLink } from "react-scroll";
import {
  FaBarcode,
  FaBars,
  FaChartBar,
  FaChartLine,
  FaChevronRight,
  FaHeadset,
  FaInstagram,
  FaLink,
  FaLinkedin,
  FaMobileAlt,
  FaPiggyBank,
  FaPlayCircle,
  FaRocket,
  FaSearch,
  FaShoppingCart,
  FaTimes,
  FaUsb,
  FaUsers,
  FaWhatsapp,
  FaWifi,
  FaBoxOpen,
  FaExchangeAlt,
  FaClipboardList,
} from "react-icons/fa";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";

import Logo from "./img/Logo.svg";

import Vendas from "./img/aprove.png";
import Futuro from "./img/CapaVendas.png";

import Coleta from "./img/CapaColeta.png";
import HomeColeta from "./img/HomeColetas.png";
import CapaColeta from "./img/capacoleta (2).png";
import ConferenciasColetaCompras from "./img/ConfCompra.png";
import ConferenciasColetaVendas from "./img/ConfVenda.png";
import TransferenciaColeta from "./img/Transferencias.png";
import InventariosColeta from "./img/Inventarios.png";
import ColetaScreen from "./img/itenscoleta.png";
import BuscarProdutos from "./img/buscarProdutos.png";

import HomeFDV from "./img/home-fdv.png";
import CapaFDV from "./img/capa-fdv.png";
import ProdutosFDV from "./img/produtos-fdv.png";
import ClientesFDV from "./img/clientes-fdv.png";
import PedidosFDV from "./img/pedidos-fdv.png";

import Scanner from "./img/scaneamento.jpg";

type ActiveTab = "vendas" | "coletas";

type Feature = {
  title: string;
  text: string;
  icon?: JSX.Element;
};

type WhyPoint = {
  icon: JSX.Element;
  text: string;
};

type TabConfig = {
  heroTitle: string;
  heroText: string;
  coverImage: any;

  productTitle: string;
  productDescription: string;
  productImage: any;
  features: Feature[];

  whyTitle: string;
  whyPoints: WhyPoint[];

  carousel: any[];
};

const HEADER_OFFSET = -90;

const CAROUSEL_VENDAS = [
  CapaFDV,
  HomeFDV,
  ProdutosFDV,
  ClientesFDV,
  PedidosFDV,
];
const CAROUSEL_COLETAS = [
  CapaColeta,
  HomeColeta,
  InventariosColeta,
  TransferenciaColeta,
  ConferenciasColetaCompras,
  ConferenciasColetaVendas,
  ColetaScreen,
  BuscarProdutos,
];

const TAB_CONTENT: Record<ActiveTab, TabConfig> = {
  vendas: {
    heroTitle: "TRANSFORMANDO SUAS VENDAS",
    heroText:
      "Na Matrix, desenvolvemos soluções inovadoras para potencializar sua força de vendas. Nosso aplicativo foi projetado para simplificar processos, aumentar a produtividade e impulsionar seus resultados comerciais.",
    coverImage: Futuro,

    productTitle: "Força de Vendas Matrix",
    productDescription:
      "Está em busca de uma solução que impulsione os resultados da sua equipe de vendas e eleve a produtividade a outro nível? Nosso aplicativo de força de vendas foi desenvolvido especialmente para representantes comerciais e lojas que desejam otimizar seus processos e alcançar resultados extraordinários.",
    productImage: Vendas,

    features: [
      {
        title: "Gestão de Pedidos",
        text: "Controle completo de pedidos em tempo real, garantindo mais agilidade e organização.",
        icon: <FaClipboardList className="w-6 h-6 text-[#1769E3]" />,
      },
      {
        title: "Catálogo Digital",
        text: "Apresente seus produtos de forma profissional e visualmente atraente, diretamente pelo aplicativo.",
        icon: <FaBoxOpen className="w-6 h-6 text-[#1769E3]" />,
      },
      {
        title: "Relatórios Personalizados",
        text: "Acompanhe o desempenho da equipe e tome decisões estratégicas com base em dados precisos.",
        icon: <FaChartBar className="w-6 h-6 text-[#1769E3]" />,
      },
      {
        title: "Controle de Estoque",
        text: "Evite surpresas desagradáveis com um sistema integrado de gerenciamento de estoque.",
        icon: <FaBarcode className="w-6 h-6 text-[#1769E3]" />,
      },
    ],

    whyTitle: "Por que o Força de Vendas Matrix?",
    whyPoints: [
      {
        icon: <FaWifi className="w-8 h-8 text-[#1769E3]" />,
        text: "Faça pedidos de qualquer lugar, mesmo sem conexão com a internet.",
      },
      {
        icon: <FaChartBar className="w-8 h-8 text-[#1769E3]" />,
        text: "Relatórios inteligentes com dados precisos e análises em tempo real.",
      },
      {
        icon: <FaMobileAlt className="w-8 h-8 text-[#1769E3]" />,
        text: "Interface intuitiva e de fácil utilização para todos os usuários.",
      },
      {
        icon: <FaLink className="w-8 h-8 text-[#1769E3]" />,
        text: "Integração perfeita com seu sistema ERP para sincronização automática.",
      },
      {
        icon: <FaUsers className="w-8 h-8 text-[#1769E3]" />,
        text: "Mais produtividade no time com rotinas claras e acompanhamento do funil.",
      },
      {
        icon: <FaChartLine className="w-8 h-8 text-[#1769E3]" />,
        text: "Aumente a taxa de conversão com visibilidade do desempenho por vendedor e por cliente.",
      },
    ],

    carousel: CAROUSEL_VENDAS,
  },

  coletas: {
    heroTitle: "MOVIX, SEU ESTOQUE NA PALMA DA MÃO",
    heroText:
      "O Movix é um aplicativo prático e intuitivo para realizar inventários e transferências de estoque, além de conferências de compras e vendas, facilitando a conferência da movimentação dos produtos e certificando o item coletado via código de barras ou QR Code.",
    coverImage: Coleta,

    productTitle:
      "Automatize suas Rotinas de Estoque ganhando tempo e evitando Prejuízos",
    productDescription:
      "Automatize as rotinas de separação de mercadoria da sua empresa eliminando prejuízos financeiros e desgastes com clientes, coletando e conferindo produtos com assertividade. Para cada rotina da sua empresa, o Movix tem uma solução.",
    productImage: Scanner,

    features: [
      {
        title: "Inventários",
        text: "Elimine o uso de papel e erros de digitação. Conte com coleta via código de barras ou buscas inteligentes diretamente no ato do inventário.",
        icon: <FaBarcode className="w-6 h-6 text-[#1769E3]" />,
      },
      {
        title: "Transferência de Estoque",
        text: "Crie demandas ou faça transferências avulsas com conferência automática no momento da separação.",
        icon: <FaExchangeAlt className="w-6 h-6 text-[#1769E3]" />,
      },
      {
        title: "Compras",
        text: "Receba mercadorias com assertividade conferindo os itens pelo XML da nota ou pedido integrado ao ERP.",
        icon: <FaClipboardList className="w-6 h-6 text-[#1769E3]" />,
      },
      {
        title: "Pedido de Vendas / Nota de Saída",
        text: "Garanta que o cliente receba exatamente o produto vendido, com agilidade e conferência no ato da separação.",
        icon: <FaShoppingCart className="w-6 h-6 text-[#1769E3]" />,
      },
      {
        title: "Ajustes de Entrada e Saída",
        text: "Realize ajustes controlados de estoque para corrigir divergências do dia a dia, com rastreabilidade, motivo do ajuste e validação do responsável.",
        icon: <FaChartLine className="w-6 h-6 text-[#1769E3]" />,
      },
      {
        title: "Integração Total",
        text: "API de integração com seu ERP, sem retrabalho de lançamentos ou processos manuais.",
        icon: <FaLink className="w-6 h-6 text-[#1769E3]" />,
      },
    ],

    whyTitle: "Por que o MOVIX?",
    whyPoints: [
      {
        icon: <FaBarcode className="w-8 h-8 text-[#1769E3]" />,
        text: "Faça bipagens tanto por código do produto quanto código de barras.",
      },
      {
        icon: <FaUsb className="w-8 h-8 text-[#1769E3]" />,
        text: "Suporte a leitores externos para maior agilidade na bipagem.",
      },
      {
        icon: <FaChartBar className="w-8 h-8 text-[#1769E3]" />,
        text: "Tenha acesso aos balanços e inventários em tempo real com nosso painel administrativo.",
      },
      {
        icon: <FaMobileAlt className="w-8 h-8 text-[#1769E3]" />,
        text: "Interface intuitiva e de fácil utilização para todos os usuários.",
      },
      {
        icon: <FaLink className="w-8 h-8 text-[#1769E3]" />,
        text: "Sincronização automática com seus sistemas de gestão quando online.",
      },
      {
        icon: <FaBoxOpen className="w-8 h-8 text-[#1769E3]" />,
        text: "Atualize cadastro de produtos: edite código de barras, faça conversões de unidade e adicione localização para facilitar a operação no estoque.",
      },
    ],

    carousel: CAROUSEL_COLETAS,
  },
};

const STEPS: Array<{
  n: number;
  title: string;
  desc: string;
  Icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    n: 1,
    title: "Diagnóstico",
    desc: "Análise e diagnóstico do seu cenário atual para entender processos, dores e objetivos.",
    Icon: FaSearch,
  },
  {
    n: 2,
    title: "Demonstração",
    desc: "Mostrar de forma prática as funcionalidades do sistema resolvendo seus problemas do dia a dia.",
    Icon: FaPlayCircle,
  },
  {
    n: 3,
    title: "Integração e Configuração",
    desc: "Configurar a integração (APIs) do Movix com o sistema (ERP) que sua empresa utiliza e validar as regras de negócio e rotinas que a empresa irá utilizar.",
    Icon: FaLink,
  },
  {
    n: 4,
    title: "Treinamento",
    desc: "Treinamento da equipe separado de acordo com a rotina individual de cada perfil.",
    Icon: FaUsers,
  },
  {
    n: 5,
    title: "Início das Operações",
    desc: "Início dos processos da empresa com o Movix, com treinamento e acompanhamento na prática.",
    Icon: FaRocket,
  },
  {
    n: 6,
    title: "Suporte",
    desc: "Nossa equipe disponível para solucionar incidentes técnicos, esclarecer dúvidas e gerenciar atualizações futuras.",
    Icon: FaHeadset,
  },
];

export default function Page() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("coletas");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const lastScrollY = useRef(0);

  const [mounted, setMounted] = useState(false);

  const content = useMemo(() => TAB_CONTENT[activeTab], [activeTab]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      const goingDown = y > lastScrollY.current;
      setShowHeader(!(goingDown && y > 120));
      if (goingDown) setMobileMenuOpen(false);
      lastScrollY.current = y;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="font-roboto">
      <header
        className={`bg-[#1769E3] text-white fixed w-full top-0 z-50 transition-transform duration-300 ${
          showHeader ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="container mx-auto flex justify-between items-center px-4 py-4">
          <div className="flex items-center">
            <Image
              src={Logo}
              alt="Logo da Empresa"
              width={150}
              height={50}
              className="filter invert brightness-0"
              priority
            />
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <ScrollLink
              to="sobre-nos"
              spy
              smooth
              offset={HEADER_OFFSET}
              duration={700}
              className="hover:underline whitespace-nowrap text-base cursor-pointer"
            >
              Sobre nós
            </ScrollLink>

            <ScrollLink
              to="metodologia"
              spy
              smooth
              offset={HEADER_OFFSET}
              duration={700}
              className="hover:underline whitespace-nowrap text-base cursor-pointer"
            >
              Nossa Metodologia
            </ScrollLink>

            <div className="flex items-center gap-2 bg-blue-600/70 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab("vendas")}
                className={`flex items-center px-4 py-2 rounded-lg transition text-sm font-semibold ${
                  activeTab === "vendas"
                    ? "bg-white text-blue-600"
                    : "text-white hover:bg-blue-400/70"
                }`}
              >
                <FaShoppingCart className="mr-2" />
                Vendas
              </button>
              <button
                onClick={() => setActiveTab("coletas")}
                className={`flex items-center px-4 py-2 rounded-lg transition text-sm font-semibold ${
                  activeTab === "coletas"
                    ? "bg-white text-blue-600"
                    : "text-white hover:bg-blue-400/70"
                }`}
              >
                <FaBarcode className="mr-2" />
                MOVIX
              </button>
            </div>

            <Link
              href="/Contato"
              className="hover:underline whitespace-nowrap text-base cursor-pointer"
            >
              Contato
            </Link>

            <Link
              href={
                activeTab === "vendas"
                  ? "/Painel-FDV/Login"
                  : "/Painel-Coletas/Login"
              }
              className="whitespace-nowrap text-base text-white/95 hover:text-white hover:underline"
            >
              Painel Administrativo
            </Link>
          </nav>

          <button
            className="md:hidden text-white focus:outline-none"
            onClick={() => setMobileMenuOpen((p) => !p)}
            aria-label="Menu"
          >
            {mobileMenuOpen ? (
              <FaTimes className="text-3xl" />
            ) : (
              <FaBars className="text-3xl" />
            )}
          </button>
        </div>

        <div
          className={`md:hidden bg-blue-600 transition-all duration-300 overflow-hidden ${
            mobileMenuOpen ? "max-h-96 py-4" : "max-h-0 py-0"
          }`}
        >
          <div className="container mx-auto px-4 flex flex-col space-y-4">
            <ScrollLink
              to="sobre-nos"
              spy
              smooth
              offset={HEADER_OFFSET}
              duration={700}
              className="hover:underline text-lg cursor-pointer"
              onClick={() => setMobileMenuOpen(false)}
            >
              Sobre nós
            </ScrollLink>

            <ScrollLink
              to="metodologia"
              spy
              smooth
              offset={HEADER_OFFSET}
              duration={700}
              className="hover:underline text-lg cursor-pointer"
              onClick={() => setMobileMenuOpen(false)}
            >
              Nossa Metodologia
            </ScrollLink>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setActiveTab("vendas");
                  setMobileMenuOpen(false);
                }}
                className={`px-4 py-2 rounded-lg font-semibold ${
                  activeTab === "vendas" ? "bg-[#1769E3]" : "bg-blue-500"
                }`}
              >
                <FaShoppingCart className="inline mr-2" />
                Vendas
              </button>
              <button
                onClick={() => {
                  setActiveTab("coletas");
                  setMobileMenuOpen(false);
                }}
                className={`px-4 py-2 rounded-lg font-semibold ${
                  activeTab === "coletas" ? "bg-[#1769E3]" : "bg-blue-500"
                }`}
              >
                <FaBarcode className="inline mr-2" />
                MOVIX
              </button>
            </div>

            <Link
              href="/Contato"
              className="hover:underline text-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contato
            </Link>

            <Link
              href="https://wa.me/5565992233566"
              target="_blank"
              className="flex items-center space-x-2 hover:underline text-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              <FaWhatsapp className="text-xl" />
              <span>WhatsApp</span>
            </Link>

            <Link
              href={
                activeTab === "vendas"
                  ? "/Painel-FDV/Login"
                  : "/Painel-Coletas/Login"
              }
              className="hover:underline text-lg text-white"
              onClick={() => setMobileMenuOpen(false)}
            >
              Painel Administrativo
            </Link>
          </div>
        </div>
      </header>

      <section
        id="sobre-nos"
        className="bg-gradient-to-t from-[#0C48ED] to-[#1769E3] text-white pt-28 pb-14"
      >
        <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold mb-5">
              {activeTab === "vendas" ? (
                <>
                  <FaShoppingCart className="w-4 h-4" />
                  Força de Vendas
                </>
              ) : (
                <>
                  <FaBarcode className="w-4 h-4" />
                  Movimentação de Estoque
                </>
              )}
            </div>

            <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-4">
              {content.heroTitle}
            </h1>

            <p className="text-lg text-white/90 mb-7 max-w-xl">
              {content.heroText}
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="https://wa.me/5565992233566"
                target="_blank"
                className="bg-white text-[#1769E3] px-6 py-3 rounded-lg font-semibold text-center hover:bg-white/90 transition"
              >
                Falar no WhatsApp
              </Link>

              <ScrollLink
                to="produto"
                smooth
                offset={HEADER_OFFSET}
                duration={700}
                className="border border-white/60 px-6 py-3 rounded-lg font-semibold text-center cursor-pointer hover:bg-white/10 transition"
              >
                Ver detalhes
              </ScrollLink>

              <ScrollLink
                to="por-que"
                smooth
                offset={HEADER_OFFSET}
                duration={700}
                className="border border-white/25 px-6 py-3 rounded-lg font-semibold text-center cursor-pointer hover:bg-white/10 transition"
              >
                Ver demonstração
              </ScrollLink>
            </div>
          </div>

          <div className="flex justify-center">
            <Image
              src={content.coverImage}
              alt={
                activeTab === "vendas" ? "Sistema de Vendas" : "Sistema MOVIX"
              }
              width={620}
              height={520}
              className="w-full max-w-[640px] h-auto object-contain drop-shadow-xl"
              priority
            />
          </div>
        </div>
      </section>

      <section id="produto" className="bg-[#f9f9f9] py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-[#1769E3] text-3xl lg:text-4xl font-bold">
              {content.productTitle}
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-stretch">
            <div className="rounded-2xl overflow-hidden shadow-lg bg-white group transition hover:shadow-xl hover:-translate-y-0.5">
              <div className="relative w-full h-[280px] sm:h-[360px] lg:h-full min-h-[420px]">
                <Image
                  src={content.productImage}
                  alt={content.productTitle}
                  fill
                  className="object-cover group-hover:scale-[1.02] transition duration-500"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col justify-center transition hover:shadow-xl hover:-translate-y-0.5">
              <p className="text-lg lg:text-xl text-[#333333] mb-6">
                {content.productDescription}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {content.features.map((f) => (
                  <div
                    key={f.title}
                    className="border border-gray-100 rounded-xl p-4 bg-gray-50 transition hover:bg-white hover:shadow-md hover:-translate-y-0.5"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                        {f.icon}
                      </div>
                      <div className="text-[#1769E3] font-bold">{f.title}</div>
                    </div>
                    <div className="text-[#555555] text-sm leading-relaxed">
                      {f.text}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-7">
                <Link
                  href="/Contato"
                  className="inline-flex items-center justify-center w-full sm:w-auto bg-[#1769E3] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#155ab2] transition"
                >
                  Solicitar proposta
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="por-que" className="bg-[#f9f9f9] pb-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-[#1769E3] text-3xl lg:text-4xl font-bold">
              {content.whyTitle}
            </h2>
            <p className="text-gray-600 text-lg mt-2 max-w-3xl mx-auto">
              Benefícios do produto e telas reais do app lado a lado.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto items-start">
            <div className="lg:col-span-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {content.whyPoints.slice(0, 6).map((p) => (
                  <div
                    key={p.text}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex gap-4 transition hover:shadow-lg hover:-translate-y-0.5"
                  >
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                      {p.icon}
                    </div>
                    <p className="text-[#333333] text-sm leading-relaxed">
                      {p.text}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/Contato"
                  className="inline-flex items-center justify-center bg-[#1769E3] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#155ab2] transition w-full"
                >
                  Solicitar proposta
                </Link>
                <Link
                  href="https://wa.me/5565992233566"
                  target="_blank"
                  className="inline-flex items-center justify-center border border-gray-200 bg-white text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition w-full"
                >
                  Falar no WhatsApp
                </Link>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="w-full h-[360px] sm:h-[520px] lg:h-[640px] relative">
                {mounted && (
                  <Swiper
                    spaceBetween={30}
                    centeredSlides
                    autoplay={{
                      delay: 4000,
                      disableOnInteraction: false,
                    }}
                    navigation
                    modules={[Autoplay, Navigation]}
                    className="mySwiper w-full h-full"
                  >
                    {content.carousel.map((image, index) => (
                      <SwiperSlide
                        key={index}
                        className="w-full h-full"
                        style={{
                          background: "transparent",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <div className="relative w-full h-full flex justify-center items-center">
                          <Image
                            src={image}
                            alt={`Demonstração ${index + 1}`}
                            width={900}
                            height={1200}
                            className="object-contain rounded-lg"
                            style={{
                              maxWidth: "100%",
                              maxHeight: "100%",
                              background: "transparent",
                            }}
                            priority={index === 0}
                          />
                        </div>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                )}
              </div>

              <style jsx global>{`
                .mySwiper {
                  background: transparent !important;
                }
                .mySwiper .swiper-slide {
                  background: transparent !important;
                }
                .mySwiper .swiper-button-next,
                .mySwiper .swiper-button-prev {
                  color: #1769e3 !important;
                }
                .mySwiper .swiper-pagination {
                  display: none !important;
                }
              `}</style>
            </div>
          </div>
        </div>
      </section>

      {activeTab === "coletas" && (
        <section id="resultados-movix" className="bg-[#f9f9f9] pb-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-[#1769E3] text-3xl lg:text-4xl font-bold">
                Principais Resultados
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-7 text-center transition hover:shadow-lg hover:-translate-y-0.5">
                <div className="mb-4 flex justify-center">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center">
                    <FaChartLine className="w-7 h-7 text-[#1769E3]" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-[#333333] mb-2">
                  Mais Controle e Produtividade
                </h3>
                <p className="text-sm text-[#666666] leading-relaxed">
                  Monitore cada coleta em tempo real e tenha total visibilidade
                  das operações. Com relatórios no painel administrativo e
                  processos integrados, sua equipe trabalha de forma mais
                  eficiente e produtiva.
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-7 text-center transition hover:shadow-lg hover:-translate-y-0.5">
                <div className="mb-4 flex justify-center">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center">
                    <FaPiggyBank className="w-7 h-7 text-[#1769E3]" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-[#333333] mb-2">
                  Redução dos Custos
                </h3>
                <p className="text-sm text-[#666666] leading-relaxed">
                  Economize tempo e recursos com tarefas automatizadas. Menos
                  papel, menos retrabalho e mais resultado para o seu negócio.
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-7 text-center transition hover:shadow-lg hover:-translate-y-0.5">
                <div className="mb-4 flex justify-center">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center">
                    <FaBarcode className="w-7 h-7 text-[#1769E3]" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-[#333333] mb-2">
                  Flexibilidade e Agilidade
                </h3>
                <p className="text-sm text-[#666666] leading-relaxed">
                  Tenha mais autonomia para gerenciar coletas com rapidez e
                  eficiência, de onde estiver.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      <section id="metodologia" className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-[#1769E3] text-3xl lg:text-4xl font-bold">
              Metodologia de Entrega
            </h2>
            <p className="text-lg text-gray-600 mt-2">
              Nosso caminho para o seu sucesso em 6 etapas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-y-10 gap-x-6 max-w-7xl mx-auto">
            {STEPS.map((s, i) => (
              <div key={s.n} className="relative">
                <div className="flex flex-col items-center text-center p-6 rounded-2xl shadow-sm border border-gray-100 bg-gray-50 h-full transition hover:shadow-lg hover:-translate-y-0.5">
                  <div className="w-14 h-14 bg-[#1769E3] rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4">
                    {s.n}
                  </div>
                  <s.Icon className="w-9 h-9 text-[#1769E3] mb-3" />
                  <h3 className="text-lg font-bold text-gray-800 mb-2">
                    {s.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {s.desc}
                  </p>
                </div>

                {i < STEPS.length - 1 && (
                  <div className="hidden lg:flex absolute top-1/2 -translate-y-1/2 right-[-0.9rem] z-10">
                    <FaChevronRight className="w-7 h-7 text-blue-300" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/Contato"
              className="inline-flex items-center justify-center bg-[#1769E3] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#155ab2] transition"
            >
              Falar com a equipe
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-[#1769E3] text-white py-6">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-6 text-center md:text-left">
            <div className="flex justify-center md:justify-start">
              <Image
                src={Logo}
                alt="Logo da Empresa"
                width={150}
                height={50}
                className="filter invert brightness-0"
              />
            </div>

            <div className="flex flex-col items-center">
              <p className="text-sm mb-2">Nossas redes</p>

              <div className="flex items-center gap-6">
                <Link
                  href="https://www.instagram.com/matrixaplicativos"
                  target="_blank"
                  className="hover:text-gray-200 transition"
                  aria-label="Instagram"
                >
                  <FaInstagram className="text-2xl" />
                </Link>

                <Link
                  href="https://www.linkedin.com/company/matrix-aplicativos/?viewAsMember=true"
                  target="_blank"
                  className="hover:text-gray-200 transition"
                  aria-label="LinkedIn"
                >
                  <FaLinkedin className="text-2xl" />
                </Link>

                <Link
                  href="https://wa.me/5565992233566"
                  target="_blank"
                  className="hover:text-gray-200 transition"
                  aria-label="WhatsApp"
                >
                  <FaWhatsapp className="text-2xl" />
                </Link>
              </div>
            </div>

            <div className="flex justify-center md:justify-end">
              <p className="text-sm">
                © {new Date().getFullYear()} Todos os direitos reservados
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

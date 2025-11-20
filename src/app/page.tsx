"use client";

import Link from "next/link";
import {
  FaWhatsapp,
  FaInstagram,
  FaLinkedin,
  FaWifi,
  FaChartBar,
  FaMobileAlt,
  FaLink,
  FaTimes,
  FaBars,
  FaBarcode,
  FaShoppingCart,
  FaShippingFast,
  FaPiggyBank,
  FaChartLine,
  FaUsb,
  FaHeadset,
  FaUsers,
  FaPlayCircle,
  FaChevronRight,
  FaRocket,
  FaSearch,
} from "react-icons/fa";
import Image from "next/image";
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
import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { Link as ScrollLink } from "react-scroll";

// Componente de máscara de telefone customizado
const PhoneInput = ({ value, onChange, ...props }: any) => {
  const formatPhone = (input: string) => {
    const numbers = input.replace(/\D/g, "");

    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{0,4})(\d{0,4})/, "($1) $2-$3");
    } else {
      return numbers.replace(/(\d{2})(\d{1})(\d{4})(\d{0,4})/, "($1) $2$3-$4");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    onChange({
      ...e,
      target: {
        ...e.target,
        value: formatted,
        name: props.name,
      },
    });
  };

  return (
    <input
      {...props}
      type="tel"
      value={value}
      onChange={handleChange}
      maxLength={15}
      placeholder="(00) 00000-0000"
    />
  );
};

interface Feature {
  title: string;
  text: string;
}

interface TabContent {
  title: string;
  description: string;
  features: Feature[];
}

export default function SiteMatrix() {
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    empresa: "",
    assunto: "",
    mensagem: "",
    telefone: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(
    null
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"vendas" | "coletas">("coletas");

  const [carouselImages] = useState([
    CapaFDV,
    HomeFDV,
    ProdutosFDV,
    ClientesFDV,
    PedidosFDV,
  ]);
  const [carouselImagesColetas] = useState([
    CapaColeta,
    HomeColeta,
    InventariosColeta,
    TransferenciaColeta,
    ConferenciasColetaCompras,
    ConferenciasColetaVendas,
    ColetaScreen,
    BuscarProdutos,
  ]);

  useEffect(() => {
    // Verificar se estamos no cliente (não no servidor)
    if (typeof window === "undefined") return;

    const urlParams = new URLSearchParams(window.location.search);
    const hasReloaded = urlParams.get("reloaded") === "true";

    if (!hasReloaded && sessionStorage.getItem("hasReloaded") !== "true") {
      sessionStorage.setItem("hasReloaded", "true");
      urlParams.set("reloaded", "true");
      const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
      window.location.replace(newUrl);
    } else if (hasReloaded) {
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setShowHeader(false);
        setMobileMenuOpen(false);
      } else {
        setShowHeader(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_COLETA_URL ?? "";
      const api = API_URL.replace("/v1", "");

      const response = await fetch(`${api}/contato`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitStatus("success");
        setFormData({
          nome: "",
          email: "",
          empresa: "",
          assunto: "",
          mensagem: "",
          telefone: "",
        });
      } else {
        console.error(
          "Erro na resposta:",
          response.status,
          response.statusText
        );
        setSubmitStatus("error");
      }
    } catch (error) {
      console.error("Erro na requisição:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabContent = {
    vendas: {
      title: "Força de Vendas Matrix",
      description:
        "Está em busca de uma solução que impulsione os resultados da sua equipe de vendas e eleve a produtividade a outro nível? Nosso aplicativo de força de vendas foi desenvolvido especialmente para representantes comerciais e lojas que desejam otimizar seus processos e alcançar resultados extraordinários.",
      features: [
        {
          title: "Gestão de Pedidos",
          text: "Controle completo de pedidos em tempo real, garantindo mais agilidade e organização.",
        },
        {
          title: "Catálogo Digital",
          text: "Apresente seus produtos de forma profissional e visualmente atraente, diretamente pelo aplicativo.",
        },
        {
          title: "Relatórios Personalizados",
          text: "Acompanhe o desempenho da equipe e tome decisões estratégicas com base em sistemas precisos.",
        },
        {
          title: "Controle de Estoque",
          text: "Evite surpresas desagradáveis com um sistema integrado de gerenciamento de estoque.",
        },
      ],
      whyTitle: "Por que o Força de Vendas Matrix?",
      whyPoints: [
        {
          icon: <FaWifi className="w-10 h-10 text-[#1769E3] self-center" />,
          text: "Faça pedidos de qualquer lugar, mesmo sem conexão com a internet.",
        },
        {
          icon: <FaChartBar className="w-10 h-10 text-[#1769E3] self-center" />,
          text: "Relatórios inteligentes com dados precisos e análises em tempo real.",
        },
        {
          icon: (
            <FaMobileAlt className="w-10 h-10 text-[#1769E3] self-center" />
          ),
          text: "Interface intuitiva e de fácil utilização para todos os usuários.",
        },
        {
          icon: <FaLink className="w-10 h-10 text-[#1769E3] self-center" />,
          text: "Integração perfeita com seu sistema ERP para sincronização automática.",
        },
      ],
      coverImage: Futuro,
      productImage: Vendas,
    },

    coletas: {
      title:
        "Automatize suas Rotinas de Estoque ganhando tempo e evitando Prejuízos",
      description:
        "Automatize as Rotinas de Separação de mercadoria da sua empresa eliminando prejuízos financieros ou desgastes com clientes coletando e conferindo produtos com assertividade. Para cada Rotina da sua empresa o Movix tem uma solução.",
      features: [
        {
          title: "Inventários",
          text: "Elimine o uso de papel e erros de digitação. Conte com coleta via código de barras ou buscas inteligentes diretamente no ato do inventário.",
        },
        {
          title: "Transferência de Estoque",
          text: "Crie demandas ou faça transferências avulsas com conferência automática no momento da separação.",
        },
        {
          title: "Compras",
          text: "Receba mercadorias com assertividade conferindo os itens pelo XML da nota ou pedido integrado ao ERP.",
        },
        {
          title: "Pedido de Vendas / Nota de Saída",
          text: "Garanta que o cliente receba exatamente o produto vendido, com agilidade e conferência no ato da separação.",
        },
        {
          title: "Integração Total",
          text: "API de integração com seu ERP, sem retrabalho de lançamentos ou processos manuais.",
        },
      ],
      whyTitle: "Por que o MOVIX?",
      whyPoints: [
        {
          icon: <FaBarcode className="w-10 h-10 text-[#1769E3] self-center" />,
          text: "Faça bipagens tanto por código do produto quanto código de barras.",
        },
        {
          icon: <FaUsb className="w-10 h-10 text-[#1769E3] self-center" />,
          text: "Suporte a leitores externos para maior agilidade na bipagem.",
        },
        {
          icon: <FaChartBar className="w-10 h-10 text-[#1769E3] self-center" />,
          text: "Tenha acesso aos balanços e aos inventários em tempo real com nosso painel administrativo.",
        },
        {
          icon: (
            <FaMobileAlt className="w-10 h-10 text-[#1769E3] self-center" />
          ),
          text: "Interface intuitiva e de fácil utilização para todos os usuários.",
        },
        {
          icon: <FaLink className="w-10 h-10 text-[#1769E3] self-center" />,
          text: "Sincronização automática com seus sistemas de gestão quando online.",
        },
      ],
      coverImage: Coleta,
      productImage: Scanner,
    },
  };

  return (
    <div className="font-roboto">
      <header
        className={`bg-[#1769E3] text-white py-4 fixed w-full top-0 z-50 transition-transform duration-300 ${
          showHeader ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="container mx-auto flex justify-between items-center px-4">
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

          <nav className="hidden md:flex space-x-6 items-center">
            <ScrollLink
              to="sobre-nos"
              spy={true}
              smooth={true}
              offset={0}
              duration={800}
              className="hover:underline whitespace-nowrap text-base cursor-pointer"
            >
              Sobre nós
            </ScrollLink>

            <ScrollLink
              to="metodologia"
              spy={true}
              smooth={true}
              offset={0}
              duration={800}
              className="hover:underline whitespace-nowrap text-base cursor-pointer"
            >
              Nossa Metodologia
            </ScrollLink>

            <div className="flex space-x-2 bg-blue-600 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab("vendas")}
                className={`flex items-center px-4 py-2 rounded-lg transition ${
                  activeTab === "vendas"
                    ? "bg-white text-blue-600"
                    : "text-white hover:bg-blue-400"
                }`}
              >
                <FaShoppingCart className="mr-2" />
                Vendas
              </button>
              <button
                onClick={() => setActiveTab("coletas")}
                className={`flex items-center px-4 py-2 rounded-lg transition ${
                  activeTab === "coletas"
                    ? "bg-white text-blue-600"
                    : "text-white hover:bg-blue-400"
                }`}
              >
                <FaBarcode className="mr-2" />
                MOVIX
              </button>
            </div>

            <ScrollLink
              to="contato"
              spy={true}
              smooth={true}
              offset={0}
              duration={800}
              className="hover:underline whitespace-nowrap text-base cursor-pointer"
            >
              Contato
            </ScrollLink>

            <Link
              href={
                activeTab === "vendas"
                  ? "/Painel-FDV/Login"
                  : "/Painel-Coletas/Login"
              }
              className="hover:underline whitespace-nowrap text-base text-white"
            >
              Painel Administrativo
            </Link>
          </nav>

          <button
            className="md:hidden text-white focus:outline-none"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
          >
            {mobileMenuOpen ? (
              <FaTimes className="text-3xl" />
            ) : (
              <FaBars className="text-3xl" />
            )}
          </button>
        </div>

        {/* Menu mobile */}
        <div
          className={`md:hidden bg-blue-600 transition-all duration-300 overflow-hidden ${
            mobileMenuOpen ? "max-h-96 py-4" : "max-h-0 py-0"
          }`}
        >
          <div className="container mx-auto px-4 flex flex-col space-y-4">
            <ScrollLink
              to="sobre-nos"
              spy={true}
              smooth={true}
              offset={0}
              duration={800}
              className="hover:underline text-lg cursor-pointer"
              onClick={() => setMobileMenuOpen(false)}
            >
              Sobre nós
            </ScrollLink>
            <ScrollLink
              to="metodologia"
              spy={true}
              smooth={true}
              offset={0}
              duration={800}
              className="hover:underline text-lg cursor-pointer"
              onClick={() => setMobileMenuOpen(false)}
            >
              Nossa Metodologia
            </ScrollLink>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  setActiveTab("vendas");
                  setMobileMenuOpen(false);
                }}
                className={`px-4 py-2 rounded-lg ${
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
                className={`px-4 py-2 rounded-lg ${
                  activeTab === "coletas" ? "bg-[#1769E3]" : "bg-blue-500"
                }`}
              >
                <FaBarcode className="inline mr-2" />
                MOVIX
              </button>
            </div>
            <ScrollLink
              to="contato"
              spy={true}
              smooth={true}
              offset={0}
              duration={800}
              className="hover:underline text-lg cursor-pointer"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contato
            </ScrollLink>
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
              className="hover:underline whitespace-nowrap text-lg text-white"
              onClick={() => setMobileMenuOpen(false)}
            >
              Painel Administrativo
            </Link>
          </div>
        </div>
      </header>

      {/* Seção Sobre Nós (comum a ambos) */}
      <section
        id="sobre-nos"
        className="bg-gradient-to-t from-[#0C48ED] to-[#1769E3] text-white pt-24 pb-8"
      >
        <div className="container mx-auto flex flex-col lg:flex-row items-center px-4">
          <div className="lg:w-1/2">
            <h1 className="text-4xl font-bold mb-4">
              {activeTab === "vendas"
                ? "TRANSFORMANDO SUAS VENDAS"
                : "MOVIX, SEU ESTOQUE NA PALMA DA MÃO"}
            </h1>
            <p className="mb-6 text-lg">
              {activeTab === "vendas"
                ? "Na Matrix, desenvolvemos soluções inovadoras para potencializar sua força de vendas. Nosso aplicativo foi projetado para simplificar processos, aumentar a produtividade e impulsionar seus resultados comerciais."
                : "O Movix é um Aplicativo Prático e Intuitivo para realizar Inventários e Transferências de Estoque, além de Conferências de Compras e Vendas, facilitando a conferencia da movimentação dos Produtos e certificando o produto Coletado através de código de barras ou QrCode."}
            </p>
          </div>
          <div className="lg:w-1/2 mt-8 lg:mt-0 flex justify-center items-center w-full h-full lg:ml-8">
            <Image
              src={tabContent[activeTab].coverImage}
              alt={
                activeTab === "vendas"
                  ? "Sistema de Vendas Matrix"
                  : "Sistema de Coletas Matrix"
              }
              width={500}
              height={500}
              className="w-full h-auto max-w-full max-h-full object-contain"
              priority
            />
          </div>
        </div>
      </section>

      {/* Seção do Produto (FDV ou Coletas) */}
      <section
        id="produto"
        className="bg-[#f9f9f9] py-16 flex flex-col items-center"
      >
        <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center lg:items-stretch">
          <div className="text-center lg:col-span-2 mb-8">
            <h2 className="text-[#1769E3] text-3xl lg:text-4xl font-bold">
              {tabContent[activeTab].title}
            </h2>
          </div>

          <div className="flex justify-center lg:justify-start w-full h-full">
            <Image
              src={tabContent[activeTab].productImage}
              alt={tabContent[activeTab].title}
              width={600}
              height={400}
              className="w-full h-full object-cover rounded-lg shadow-lg"
            />
          </div>

          <div className="text-left">
            <p className="text-lg lg:text-xl text-[#333333] mb-4">
              {tabContent[activeTab].description}
            </p>
            <ul className="list-disc pl-6 text-lg lg:text-xl text-[#333333] space-y-3">
              {tabContent[activeTab].features.map((feature, index) => (
                <li key={index}>
                  <strong>{feature.title}:</strong> {feature.text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Seção "Por que nosso produto" com Carrossel */}
      <section className="bg-[#f9f9f9] py-16 flex flex-col items-center">
        <div className="text-center lg:col-span-2 mb-10">
          <h2 className="text-[#1769E3] text-3xl lg:text-4xl font-bold">
            {tabContent[activeTab].whyTitle}
          </h2>
        </div>

        <div className="container mx-auto px-4 flex flex-col lg:flex-row gap-8 items-center lg:items-stretch">
          <div className="w-full lg:w-1/2 grid grid-cols-1 gap-2">
            {tabContent[activeTab].whyPoints.map((point, index) => (
              <div
                key={index}
                className={`flex flex-col items-center p-2 text-center ${
                  index % 2 === 0 ? "lg:items-start" : "lg:items-end"
                }`}
              >
                <div className="flex flex-col items-center max-w-xs">
                  <div className="mb-2 flex justify-center">{point.icon}</div>
                  <p className="text-base text-[#333333]">{point.text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="w-full lg:w-1/2 max-w-lg mx-auto flex flex-col">
            {/* Container do Swiper com altura responsiva */}
            <div className="w-full h-80 lg:h-[650px] relative">
              {" "}
              {/* Altura maior no web */}
              <Swiper
                spaceBetween={30}
                centeredSlides={true}
                autoplay={{
                  delay: 4000,
                  disableOnInteraction: false,
                }}
                pagination={{
                  clickable: true,
                }}
                navigation={true}
                modules={[Autoplay, Pagination, Navigation]}
                className="mySwiper w-full h-full"
                style={{
                  background: "transparent",
                  display: "block",
                  visibility: "visible",
                  opacity: "1",
                }}
              >
                {(activeTab === "vendas"
                  ? carouselImages
                  : carouselImagesColetas
                ).map((image, index) => (
                  <SwiperSlide
                    key={index}
                    className="h-full"
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
                        width={600} // Aumentei a largura para web
                        height={800} // Aumentei a altura para web
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
            </div>
          </div>
        </div>

        {/* CSS ATUALIZADO - Mantendo bolinhas embaixo e ajustando web */}
        <style jsx global>{`
          .mySwiper {
            background: transparent !important;
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
          }
          .mySwiper .swiper-slide {
            background: transparent !important;
            display: flex !important;
            justify-content: center;
            align-items: center;
          }

          /* PAGINATION - BOLINHAS EMBAIXO */
          .mySwiper .swiper-pagination {
            bottom: 0px !important;
            position: relative !important;
            margin-top: 20px !important;
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
          }

          .mySwiper .swiper-pagination-bullet {
            background: #1769e3 !important;
            width: 10px;
            height: 10px;
            opacity: 0.5;
            margin: 0 5px !important;
          }

          .mySwiper .swiper-pagination-bullet-active {
            opacity: 1;
            width: 12px;
            height: 12px;
          }

          .mySwiper .swiper-button-next,
          .mySwiper .swiper-button-prev {
            color: #1769e3 !important;
          }

          /* MOBILE */
          @media (max-width: 767px) {
            .mySwiper {
              min-height: 320px !important;
            }
            .mySwiper .swiper-slide {
              min-height: 300px !important;
            }
          }

          /* WEB - Ajustes para telas maiores */
          @media (min-width: 1024px) {
            .mySwiper .swiper-slide {
              min-height: 450px !important;
            }
          }
        `}</style>
      </section>

      {activeTab === "coletas" && (
        <section id="resultados-movix" className="bg-[#f9f9f9] pt-8 pb-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-[#1769E3] text-3xl lg:text-4xl font-bold">
                Principais Resultados
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
              <div className="flex flex-col items-center text-center p-4">
                <div className="mb-4">
                  <FaChartLine className="w-12 h-12 text-[#1769E3]" />
                </div>
                <h3 className="text-xl lg:text-2xl font-bold text-[#333333] mb-3">
                  Mais Controle e Produtividade
                </h3>
                <p className="text-base text-[#666666]">
                  Monitore cada coleta em tempo real e tenha total visibilidade
                  das operações. Com relatórios no painel administrativo e
                  processos integrados, sua equipe trabalha de forma mais
                  eficiente e produtiva.
                </p>
              </div>

              <div className="flex flex-col items-center text-center p-4">
                <div className="mb-4">
                  <FaPiggyBank className="w-12 h-12 text-[#1769E3]" />
                </div>
                <h3 className="text-xl lg:text-2xl font-bold text-[#333333] mb-3">
                  Redução dos Custos
                </h3>
                <p className="text-base text-[#666666]">
                  Economize tempo e recursos com tarefas automatizadas. Menos
                  papel, menos retrabalho e mais resultado para o seu negócio.
                </p>
              </div>

              <div className="flex flex-col items-center text-center p-4">
                <div className="mb-4">
                  <FaBarcode className="w-12 h-12 text-[#1769E3]" />
                </div>
                <h3 className="text-xl lg:text-2xl font-bold text-[#333333] mb-3">
                  Flexibilidade e Agilidade
                </h3>
                <p className="text-base text-[#666666]">
                  Tenha mais autonomia para gerenciar coletas com rapidez e
                  eficiência, de onde estiver.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      <section id="metodologia" className="bg-white py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-[#1769E3] text-3xl lg:text-4xl font-bold">
              Metodologia de Entrega
            </h2>
            <p className="text-lg text-gray-600 mt-2">
              Nosso caminho para o seu sucesso em 6 etapas.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-y-12 lg:gap-y-8 gap-x-8 max-w-7xl mx-auto">
            <div className="relative">
              <div className="flex flex-col items-center text-center p-6 rounded-lg shadow-lg border border-gray-100 bg-gray-50 transition-transform duration-300 hover:scale-105 hover:shadow-xl h-full">
                <div className="w-16 h-16 bg-[#1769E3] rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4 flex-shrink-0">
                  1
                </div>
                <FaSearch className="w-10 h-10 text-[#1769E3] mb-3" />{" "}
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Diagnóstico
                </h3>
                <p className="text-gray-600 text-sm">
                  Análise e diagnóstico do seu cenário atual para entender
                  processos, dores e objetivos.
                </p>
              </div>
              <div className="hidden lg:flex absolute top-1/2 -translate-y-1/2 right-[-1rem] z-10">
                <FaChevronRight className="w-8 h-8 text-blue-300" />
              </div>
            </div>

            <div className="relative">
              <div className="flex flex-col items-center text-center p-6 rounded-lg shadow-lg border border-gray-100 bg-gray-50 transition-transform duration-300 hover:scale-105 hover:shadow-xl h-full">
                <div className="w-16 h-16 bg-[#1769E3] rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4 flex-shrink-0">
                  2
                </div>
                <FaPlayCircle className="w-10 h-10 text-[#1769E3] mb-3" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Demonstração
                </h3>
                <p className="text-gray-600 text-sm">
                  Mostrar de forma prática as funcionalidades do sistema
                  resolvendo seus problemas do dia a dia.
                </p>
              </div>
              <div className="hidden lg:flex absolute top-1/2 -translate-y-1/2 right-[-1rem] z-10">
                <FaChevronRight className="w-8 h-8 text-blue-300" />
              </div>
            </div>

            <div className="relative">
              <div className="flex flex-col items-center text-center p-6 rounded-lg shadow-lg border border-gray-100 bg-gray-50 transition-transform duration-300 hover:scale-105 hover:shadow-xl h-full">
                <div className="w-16 h-16 bg-[#1769E3] rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4 flex-shrink-0">
                  3
                </div>
                <FaLink className="w-10 h-10 text-[#1769E3] mb-3" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Integração e Configuração
                </h3>
                <p className="text-gray-600 text-sm">
                  Configurar a integração (APIs) do Movix com o sistemas (ERP)
                  que sua empresa utiliza. e validar as regras de negócio e
                  Rotinas que a empresa irá utilizar.
                </p>
              </div>
              <div className="hidden lg:flex absolute top-1/2 -translate-y-1/2 right-[-1rem] z-10">
                <FaChevronRight className="w-8 h-8 text-blue-300" />
              </div>
            </div>

            <div className="relative">
              <div className="flex flex-col items-center text-center p-6 rounded-lg shadow-lg border border-gray-100 bg-gray-50 transition-transform duration-300 hover:scale-105 hover:shadow-xl h-full">
                <div className="w-16 h-16 bg-[#1769E3] rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4 flex-shrink-0">
                  4
                </div>
                <FaUsers className="w-10 h-10 text-[#1769E3] mb-3" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Treinamento
                </h3>
                <p className="text-gray-600 text-sm">
                  Treinamento da equipe separado de acordo com a rotina
                  individual de cada perfil.
                </p>
              </div>
              <div className="hidden lg:flex absolute top-1/2 -translate-y-1/2 right-[-1rem] z-10">
                <FaChevronRight className="w-8 h-8 text-blue-300" />
              </div>
            </div>

            <div className="relative">
              <div className="flex flex-col items-center text-center p-6 rounded-lg shadow-lg border border-gray-100 bg-gray-50 transition-transform duration-300 hover:scale-105 hover:shadow-xl h-full">
                <div className="w-16 h-16 bg-[#1769E3] rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4 flex-shrink-0">
                  5
                </div>
                <FaRocket className="w-10 h-10 text-[#1769E3] mb-3" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Início das Operações
                </h3>
                <p className="text-gray-600 text-sm">
                  Inicio dos processos da Empresa com o Movix, com treinamento e
                  acompanhamento na prática.
                </p>
              </div>
              <div className="hidden lg:flex absolute top-1/2 -translate-y-1/2 right-[-1rem] z-10">
                <FaChevronRight className="w-8 h-8 text-blue-300" />
              </div>
            </div>

            <div className="relative">
              <div className="flex flex-col items-center text-center p-6 rounded-lg shadow-lg border border-gray-100 bg-gray-50 transition-transform duration-300 hover:scale-105 hover:shadow-xl h-full">
                <div className="w-16 h-16 bg-[#1769E3] rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4 flex-shrink-0">
                  6
                </div>
                <FaHeadset className="w-10 h-10 text-[#1769E3] mb-3" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Suporte
                </h3>
                <p className="text-gray-600 text-sm">
                  Nossa equipe disponível para solucionar incidentes técnicos,
                  esclarecer dúvidas e gerenciar atualizações futuras.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="contato" className="bg-[#f9f9f9] py-10">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-12">
            <h2 className="text-2xl lg:text-3xl text-[#1769E3] font-bold">
              Quer crescer ainda mais seu negócio?
            </h2>
            <p className="text-lg lg:text-xl text-[#1769E3] font-semibold">
              Entre em contato conosco!
            </p>
          </div>

          <div className="flex flex-col lg:flex-row justify-center items-center lg:items-start gap-8 lg:gap-16">
            <div className="w-full lg:w-1/2 max-w-lg text-center lg:text-center">
              <p className="text-[#666666] font-semibold text-3xl lg:text-[32px] mb-4">
                Telefone
              </p>
              <div className="space-y-2 mb-4 text-xl text-[#666666]">
                <p>+55 65 99223-3566</p>
                <p>+55 65 99604-4321</p>
              </div>
              <p className="mb-4 text-[#666666]">Ou</p>
              <div className="flex justify-center lg:justify-center">
                <Link
                  href="https://wa.me/5565992233566"
                  target="_blank"
                  className="flex items-center justify-center bg-[#04C317] text-white py-3 px-6 rounded-lg hover:bg-[#038c13] transition duration-300"
                >
                  <FaWhatsapp className="text-lg mr-2" />
                  WhatsApp
                </Link>
              </div>
            </div>

            <div className="w-full lg:w-1/2 max-w-lg text-center lg:text-center">
              <p className="text-[#666666] font-semibold text-3xl lg:text-[32px] mb-4">
                E-mail
              </p>
              <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 gap-4 w-full"
              >
                <input
                  type="text"
                  name="nome"
                  placeholder="Nome"
                  value={formData.nome}
                  onChange={handleChange}
                  required
                  className="p-3 border border-gray-300 rounded-lg w-full text-lg bg-white text-gray-900 dark:text-gray-900 placeholder-gray-500"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="p-3 border border-gray-300 rounded-lg w-full text-lg bg-white text-gray-900 dark:text-gray-900 placeholder-gray-500"
                  />
                  <input
                    type="text"
                    name="empresa"
                    placeholder="Empresa"
                    value={formData.empresa}
                    onChange={handleChange}
                    className="p-3 border border-gray-300 rounded-lg w-full text-lg bg-white text-gray-900 dark:text-gray-900 placeholder-gray-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="assunto"
                    placeholder="Assunto"
                    value={formData.assunto}
                    onChange={handleChange}
                    required
                    className="p-3 border border-gray-300 rounded-lg w-full text-lg bg-white text-gray-900 dark:text-gray-900 placeholder-gray-500"
                  />
                  <PhoneInput
                    name="telefone"
                    placeholder="Telefone"
                    value={formData.telefone}
                    onChange={handleChange}
                    required
                    className="p-3 border border-gray-300 rounded-lg w-full text-lg bg-white text-gray-900 dark:text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <textarea
                  name="mensagem"
                  placeholder="Mensagem"
                  rows={4}
                  value={formData.mensagem}
                  onChange={handleChange}
                  required
                  className="p-3 border border-gray-300 rounded-lg resize-none w-full text-lg bg-white text-gray-900 dark:text-gray-900 placeholder-gray-500"
                ></textarea>

                {submitStatus === "success" && (
                  <div className="text-green-600 text-lg">
                    Mensagem enviada com sucesso!
                  </div>
                )}
                {submitStatus === "error" && (
                  <div className="text-red-600 text-lg">
                    Ocorreu um erro ao enviar a mensagem. Por favor, tente
                    novamente.
                  </div>
                )}

                <div className="flex justify-center lg:justify-center">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-[#1769E3] text-white py-3 px-8 text-lg rounded-lg hover:bg-[#155ab2] transition duration-300 w-full md:w-auto"
                  >
                    {isSubmitting ? "Enviando..." : "Enviar Mensagem"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-[#1769E3] text-white py-4">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center px-4 gap-4">
          <div className="flex items-center">
            <Image
              src={Logo}
              alt="Logo da Empresa"
              width={150}
              height={50}
              className="filter invert brightness-0"
            />
          </div>
          <div className="text-center">
            <p className="mb-2 text-base">Nossas redes</p>
            <div className="flex justify-center space-x-6">
              <Link
                href="https://www.instagram.com/matrixaplicativos"
                target="_blank"
              >
                <FaInstagram className="text-2xl hover:text-gray-400" />
              </Link>
              <Link
                href="https://www.linkedin.com/company/matrix-aplicativos/?viewAsMember=true"
                target="_blank"
              >
                <FaLinkedin className="text-2xl hover:text-gray-400" />
              </Link>
              <Link href="https://wa.me/5565992233566" target="_blank">
                <FaWhatsapp className="text-2xl hover:text-gray-400" />
              </Link>
            </div>
          </div>
          <div className="text-center md:text-right text-base">
            <p>© {new Date().getFullYear()} Todos os direitos reservados</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

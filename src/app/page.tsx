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
} from "react-icons/fa";
import Image from "next/image";
import Logo from "./img/Logo.svg";
import Vendas from "./img/aprove.png";
import Futuro from "./img/CapaVendas.png";
import Coleta from "./img/CapaColeta.png";
import HomeColeta from "./img/home-coleta.png";
import CapaColeta from "./img/capa-coleta.png";
import DemandasColeta from "./img/demandas-coleta.png";
import ColetasColeta from "./img/coletas-coleta.png";
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

export default function SiteMatrix() {
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    empresa: "",
    assunto: "",
    mensagem: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(
    null
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"vendas" | "coletas">("vendas");

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
    DemandasColeta,
    ColetasColeta,
  ]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const hasReloaded = urlParams.get("reloaded") === "true";

    if (!hasReloaded) {
      urlParams.set("reloaded", "true");
      const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
      window.location.replace(newUrl);
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

  useEffect(() => {
    const handleSmoothScroll = (e: Event) => {
      e.preventDefault();
      const target = e.currentTarget as HTMLAnchorElement;
      const targetId = target.getAttribute("href")?.replace("#", "");
      if (!targetId) return;

      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      setMobileMenuOpen(false);
    };

    const links = document.querySelectorAll<HTMLAnchorElement>("a[href^='#']");
    links.forEach((link) => {
      link.addEventListener("click", handleSmoothScroll);
    });

    return () => {
      links.forEach((link) => {
        link.removeEventListener("click", handleSmoothScroll);
      });
    };
  }, []);

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
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: "contato@matrixapps.com.br",
          subject: `Contato via site: ${formData.assunto}`,
          text: `Nome: ${formData.nome}\nEmail: ${formData.email}\nEmpresa: ${formData.empresa}\nMensagem: ${formData.mensagem}`,
          html: `
            <h2>Novo contato via site</h2>
            <p><strong>Nome:</strong> ${formData.nome}</p>
            <p><strong>Email:</strong> ${formData.email}</p>
            <p><strong>Empresa:</strong> ${formData.empresa}</p>
            <p><strong>Assunto:</strong> ${formData.assunto}</p>
            <p><strong>Mensagem:</strong></p>
            <p>${formData.mensagem}</p>
          `,
        }),
      });

      if (response.ok) {
        setSubmitStatus("success");
        setFormData({
          nome: "",
          email: "",
          empresa: "",
          assunto: "",
          mensagem: "",
        });
      } else {
        setSubmitStatus("error");
      }
    } catch (error) {
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
        "Gestão de Pedidos: Controle completo de pedidos em tempo real, garantindo mais agilidade e organização.",
        "Catálogo Digital: Apresente seus produtos de forma profissional e visualmente atraente, diretamente pelo aplicativo.",
        "Relatórios Personalizados: Acompanhe o desempenho da equipe e tome decisões estratégicas com base em sistemas precisos.",
        "Controle de Estoque: Evite surpresas desagradáveis com um sistema integrado de gerenciamento de estoque.",
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
      title: "MOVIX",
      description:
        "Solução completa para gestão de coletas e logística reversa, desenvolvida para empresas que precisam de controle total sobre suas operações de recebimento e transporte de mercadorias. Otimize sua operação com nossa tecnologia.",
      features: [
        "Gestão de Coletas: Controle completo dos itens em tempo real, garantindo mais agilidade e organização.",
        "Coletas Avulsas e sob demandas: Organize de maneira adequadas as coletas realizadas.",
        "Integração Total: Conecte-se facilmente com seu ERP ou sistema de gestão logística.",
      ],
      whyTitle: "Por que o MOVIX?",
      whyPoints: [
        {
          icon: <FaBarcode className="w-10 h-10 text-[#1769E3] self-center" />,
          text: "Faça bipagens tanto por código do produto quanto código de barras.",
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
            <Link
              href="#sobre-nos"
              className="hover:underline whitespace-nowrap text-base"
            >
              Sobre nós
            </Link>

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

            <Link
              href="#contato"
              className="hover:underline whitespace-nowrap text-base"
            >
              Contato
            </Link>

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
            <Link
              href="#sobre-nos"
              className="hover:underline text-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              Sobre nós
            </Link>
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
                Coletas
              </button>
            </div>
            <Link
              href="#contato"
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
                : "REVOLUCIONANDO SUAS COLETAS"}
            </h1>
            <p className="mb-6 text-lg">
              {activeTab === "vendas"
                ? "Na Matrix, desenvolvemos soluções inovadoras para potencializar sua força de vendas. Nosso aplicativo foi projetado para simplificar processos, aumentar a produtividade e impulsionar seus resultados comerciais."
                : "Solução completa para gestão logística e transporte. O Matrix Coletas oferece controle total sobre suas operações de recebimento e distribuição, com tecnologia de ponta para otimizar seus processos."}
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
        <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
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
                <li key={index}>{feature}</li>
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

        <div className="container mx-auto px-4 flex flex-col lg:flex-row gap-8 items-center">
          {/* Coluna dos pontos */}
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

          {/* Coluna do carrossel */}
          <div className="w-full lg:w-1/2 max-w-md mx-auto">
            <Swiper
              spaceBetween={30}
              centeredSlides={true}
              autoplay={{
                delay: 2000,
                disableOnInteraction: false,
              }}
              pagination={{
                clickable: true,
              }}
              navigation={true}
              modules={[Autoplay, Pagination, Navigation]}
              className="mySwiper rounded-lg shadow-xl"
            >
              {(activeTab === "vendas"
                ? carouselImages
                : carouselImagesColetas
              ).map((image, index) => (
                <SwiperSlide key={index}>
                  <div className="flex justify-center items-center h-200">
                    <Image
                      src={image}
                      alt={`Demonstração ${index + 1}`}
                      width={300}
                      height={300}
                      className="object-contain rounded-lg"
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
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
                  className="p-3 border border-gray-300 rounded-lg w-full text-lg"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="p-3 border border-gray-300 rounded-lg w-full text-lg"
                  />
                  <input
                    type="text"
                    name="empresa"
                    placeholder="Empresa"
                    value={formData.empresa}
                    onChange={handleChange}
                    className="p-3 border border-gray-300 rounded-lg w-full text-lg"
                  />
                </div>
                <input
                  type="text"
                  name="assunto"
                  placeholder="Assunto"
                  value={formData.assunto}
                  onChange={handleChange}
                  required
                  className="p-3 border border-gray-300 rounded-lg w-full text-lg"
                />
                <textarea
                  name="mensagem"
                  placeholder="Mensagem"
                  rows={4}
                  value={formData.mensagem}
                  onChange={handleChange}
                  required
                  className="p-3 border border-gray-300 rounded-lg resize-none w-full text-lg"
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
              <Link href="https://www.instagram.com/matrixxapp" target="_blank">
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

"use client";

import Link from "next/link";
import { FaWhatsapp, FaInstagram, FaLinkedin, FaHome } from "react-icons/fa";
import Image from "next/image";
import Logo from "@/app/img/Logo.svg";
import { useState, useEffect } from "react";

export default function PrivacyPolicy() {
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setShowHeader(false);
      } else {
        setShowHeader(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <div className="font-roboto min-h-screen flex flex-col">
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
              href="/"
              className="hover:underline whitespace-nowrap text-base flex items-center"
            >
              <FaHome className="mr-2" />
              Voltar ao site
            </Link>
          </nav>

          <Link
            href="/"
            className="md:hidden text-white flex items-center"
            aria-label="Voltar ao início"
          >
            <FaHome className="text-2xl" />
          </Link>
        </div>
      </header>

      <main className="flex-grow pt-24 pb-16 bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6 md:p-8">
            <h1 className="text-3xl md:text-4xl font-bold text-[#1769E3] mb-6 text-center">
              Política de Privacidade
            </h1>

            <div className="prose max-w-none">
              <p className="text-gray-600 mb-6">
                Última atualização: {new Date().toLocaleDateString("pt-BR")}
              </p>

              <h2 className="text-xl md:text-2xl font-semibold text-[#1769E3] mt-6 mb-3">
                1. Introdução
              </h2>
              <p className="text-gray-700 mb-4">
                A Matrix valoriza a privacidade e a segurança dos dados dos seus
                usuários. Esta Política de Privacidade descreve como coletamos,
                usamos, armazenamos e protegemos as informações dos usuários de
                nossos aplicativos e site.
              </p>

              <h2 className="text-xl md:text-2xl font-semibold text-[#1769E3] mt-6 mb-3">
                2. Informações que Coletamos
              </h2>
              <p className="text-gray-700 mb-2">
                Coletamos os seguintes tipos de informações:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li className="mb-2">
                  Informações de contato (nome, e-mail, telefone, empresa)
                </li>
                <li className="mb-2">Dados de uso dos nossos aplicativos</li>
                <li className="mb-2">
                  Informações de dispositivos (tipo, sistema operacional,
                  identificadores)
                </li>
                <li className="mb-2">
                  Dados de localização (quando necessário para funcionalidades
                  específicas)
                </li>
                <li>
                  Informações de pagamento (processadas por provedores de
                  pagamento seguros)
                </li>
              </ul>

              <h2 className="text-xl md:text-2xl font-semibold text-[#1769E3] mt-6 mb-3">
                3. Como Usamos Suas Informações
              </h2>
              <p className="text-gray-700 mb-2">
                Utilizamos suas informações para:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li className="mb-2">
                  Fornecer, operar e manter nossos serviços
                </li>
                <li className="mb-2">
                  Melhorar, personalizar e expandir nossos serviços
                </li>
                <li className="mb-2">
                  Compreender e analisar como você usa nossos serviços
                </li>
                <li className="mb-2">
                  Desenvolver novos produtos, serviços, funcionalidades e
                  recursos
                </li>
                <li className="mb-2">
                  Comunicar-nos com você, incluindo para atendimento ao cliente
                </li>
                <li>
                  Enviar e-mails promocionais e informativos (com possibilidade
                  de opt-out)
                </li>
              </ul>

              <h2 className="text-xl md:text-2xl font-semibold text-[#1769E3] mt-6 mb-3">
                4. Compartilhamento de Informações
              </h2>
              <p className="text-gray-700 mb-4">
                Não vendemos, comercializamos ou transferimos suas informações
                pessoais para terceiros, exceto quando necessário para fornecer
                nossos serviços, cumprir obrigações legais, ou proteger nossos
                direitos. Podemos compartilhar informações com:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li className="mb-2">
                  Prestadores de serviços que nos auxiliam em nossas operações
                </li>
                <li className="mb-2">
                  Autoridades legais quando exigido por lei
                </li>
                <li>
                  Empresas afiliadas para fins de consolidação de relatórios
                </li>
              </ul>

              <h2 className="text-xl md:text-2xl font-semibold text-[#1769E3] mt-6 mb-3">
                5. Segurança de Dados
              </h2>
              <p className="text-gray-700 mb-4">
                Implementamos medidas de segurança técnicas e organizacionais
                apropriadas para proteger suas informações pessoais contra
                acesso não autorizado, alteração, divulgação ou destruição. No
                entanto, nenhum método de transmissão pela Internet ou
                armazenamento eletrônico é 100% seguro.
              </p>

              <h2 className="text-xl md:text-2xl font-semibold text-[#1769E3] mt-6 mb-3">
                6. Seus Direitos
              </h2>
              <p className="text-gray-700 mb-2">Você tem o direito de:</p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li className="mb-2">
                  Acessar e solicitar cópias de suas informações pessoais
                </li>
                <li className="mb-2">
                  Retificar informações imprecisas ou incompletas
                </li>
                <li className="mb-2">
                  Solicitar a exclusão de suas informações pessoais
                </li>
                <li className="mb-2">
                  Opor-se ao processamento de suas informações pessoais
                </li>
                <li>
                  Solicitar a portabilidade de seus dados para outro serviço
                </li>
              </ul>

              <h2 className="text-xl md:text-2xl font-semibold text-[#1769E3] mt-6 mb-3">
                7. Cookies e Tecnologias Semelhantes
              </h2>
              <p className="text-gray-700 mb-4">
                Utilizamos cookies e tecnologias similares para coletar
                informações sobre suas atividades de navegação, melhorar sua
                experiência e analisar o tráfego em nosso site. Você pode
                controlar o uso de cookies nas configurações do seu navegador.
              </p>

              <h2 className="text-xl md:text-2xl font-semibold text-[#1769E3] mt-6 mb-3">
                8. Alterações nesta Política
              </h2>
              <p className="text-gray-700 mb-4">
                Podemos atualizar nossa Política de Privacidade periodicamente.
                Notificaremos você sobre quaisquer alterações publicando a nova
                Política de Privacidade nesta página e atualizando a data de
                &quot;Última atualização&quot; no topo deste documento.
              </p>

              <h2 className="text-xl md:text-2xl font-semibold text-[#1769E3] mt-6 mb-3">
                9. Contato
              </h2>
              <p className="text-gray-700 mb-4">
                Se você tiver dúvidas sobre esta Política de Privacidade ou
                sobre como tratamos seus dados, entre em contato conosco através
                dos seguintes meios:
              </p>
              <ul className="list-none pl-0 text-gray-700 mb-4">
                <li className="mb-2">
                  <strong>E-mail:</strong> contato@matrixapps.com.br 
                </li>
                <li className="mb-2">
                  <strong>Telefone:</strong> +55 65 99223-3566 / +55 65 99604-4321
                </li>
                <li>
                  <strong>Endereço:</strong> Cuiabá, Mato Grosso, Brasil
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200 text-center">
              <Link
                href="/"
                className="inline-flex items-center bg-[#1769E3] text-white py-2 px-6 rounded-lg hover:bg-[#155ab2] transition duration-300"
              >
                <FaHome className="mr-2" />
                Voltar ao Site Principal
              </Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-[#1769E3] text-white py-4 mt-auto">
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

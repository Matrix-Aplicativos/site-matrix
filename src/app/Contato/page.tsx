"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { IMaskInput } from "react-imask";
import {
  FaWhatsapp,
  FaInstagram,
  FaLinkedin,
  FaEnvelopeOpenText,
  FaArrowLeft,
} from "react-icons/fa";

import Logo from "../img/Logo.svg";

export default function ContatoPage() {
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
    null,
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const raw = process.env.NEXT_PUBLIC_API_COLETA_URL ?? "";
      const apiBase = raw.includes("/v1") ? raw.replace("/v1", "") : raw;

      const response = await fetch(`${apiBase}/contato`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
        setSubmitStatus("error");
      }
    } catch {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="font-roboto min-h-screen flex flex-col bg-white text-gray-900">
      <header className="bg-[#1769E3] text-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between relative">
          {/* Botão voltar */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 transition font-semibold z-10"
            aria-label="Voltar para o site"
          >
            <FaArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Voltar</span>
          </Link>

          {/* Logo centralizada de verdade */}
          <Link
            href="/"
            aria-label="Ir para o site"
            className="absolute left-1/2 -translate-x-1/2"
          >
            <Image
              src={Logo}
              alt="Logo da Empresa"
              width={150}
              height={50}
              className="filter invert brightness-0"
              priority
            />
          </Link>

          {/* Espaço para equilibrar o layout */}
          <div className="w-[86px] sm:w-[110px]" />
        </div>
      </header>

      <main className="flex-grow">
        <section className="bg-gradient-to-t from-[#0C48ED] to-[#1769E3] text-white pt-10 pb-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold mb-5">
                <FaEnvelopeOpenText className="w-4 h-4" />
                Atendimento comercial
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold">
                Fale com a Matrix
              </h1>
              <p className="text-white/90 mt-3 text-lg">
                Prefere WhatsApp ou e-mail? Escolha o canal e a gente responde o
                mais rápido possível.
              </p>
            </div>
          </div>
        </section>

        <section className="py-14 bg-[#f9f9f9]">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <h2 className="text-2xl text-[#1769E3] font-bold mb-2 text-center">
                  WhatsApp
                </h2>
                <p className="text-gray-600 text-center mb-8">
                  Conversas rápidas e diretas para demonstração, proposta e
                  dúvidas.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="rounded-2xl border border-gray-100 bg-gray-50 p-6 text-center transition hover:shadow-md hover:-translate-y-0.5">
                    <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center mx-auto mb-4">
                      <FaWhatsapp className="text-3xl text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      Lorenzo Garcia
                    </h3>
                    <p className="text-sm text-gray-600 mt-1 mb-4">
                      Atendimento comercial
                    </p>
                    <Link
                      href="https://wa.me/5565992233566"
                      target="_blank"
                      className="inline-flex items-center justify-center w-full bg-green-600 text-white py-2.5 px-4 rounded-lg hover:bg-green-700 transition font-semibold"
                    >
                      Enviar mensagem
                    </Link>
                  </div>

                  <div className="rounded-2xl border border-gray-100 bg-gray-50 p-6 text-center transition hover:shadow-md hover:-translate-y-0.5">
                    <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center mx-auto mb-4">
                      <FaWhatsapp className="text-3xl text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      Juan Cassemiro
                    </h3>
                    <p className="text-sm text-gray-600 mt-1 mb-4">
                      Atendimento comercial
                    </p>
                    <Link
                      href="https://wa.me/5565996044321"
                      target="_blank"
                      className="inline-flex items-center justify-center w-full bg-green-600 text-white py-2.5 px-4 rounded-lg hover:bg-green-700 transition font-semibold"
                    >
                      Enviar mensagem
                    </Link>
                  </div>
                </div>

                <div className="mt-8 text-center text-sm text-gray-600">
                  <p>Horário comercial • Resposta rápida</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <h2 className="text-2xl text-[#1769E3] font-bold mb-2 text-center">
                  E-mail
                </h2>
                <p className="text-gray-600 text-center mb-8">
                  Preencha o formulário e nossa equipe retorna o mais breve
                  possível.
                </p>

                <form onSubmit={handleSubmit} className="grid gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="nome"
                      placeholder="Nome *"
                      value={formData.nome}
                      onChange={handleChange}
                      required
                      className="p-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="email"
                      name="email"
                      placeholder="E-mail *"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="p-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="empresa"
                      placeholder="Empresa"
                      value={formData.empresa}
                      onChange={handleChange}
                      className="p-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <IMaskInput
                      mask="(00) 00000-0000"
                      name="telefone"
                      value={formData.telefone}
                      onAccept={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          telefone: String(value),
                        }))
                      }
                      required
                      placeholder="Telefone *"
                      className="p-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <input
                    type="text"
                    name="assunto"
                    placeholder="Assunto *"
                    value={formData.assunto}
                    onChange={handleChange}
                    required
                    className="p-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />

                  <textarea
                    name="mensagem"
                    placeholder="Mensagem *"
                    rows={5}
                    value={formData.mensagem}
                    onChange={handleChange}
                    required
                    className="p-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />

                  {submitStatus === "success" && (
                    <div className="bg-green-100 text-green-700 p-3 rounded-lg text-sm">
                      Mensagem enviada com sucesso! Retornaremos em breve.
                    </div>
                  )}

                  {submitStatus === "error" && (
                    <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm">
                      Ocorreu um erro ao enviar. Por favor, tente novamente.
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#1769E3] text-white py-3 px-6 rounded-lg hover:bg-[#155ab2] transition font-semibold disabled:opacity-70"
                  >
                    {isSubmitting ? "Enviando..." : "Enviar Mensagem"}
                  </button>

                  <p className="text-xs text-gray-500 text-center">
                    Ao enviar, você concorda em ser contatado pela equipe
                    Matrix.
                  </p>

                  <div className="pt-2">
                    <Link
                      href="/"
                      className="inline-flex items-center justify-center gap-2 w-full border border-gray-200 bg-white text-gray-900 py-3 px-6 rounded-lg hover:bg-gray-50 transition font-semibold"
                    >
                      <FaArrowLeft className="w-4 h-4" />
                      Voltar ao site
                    </Link>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#1769E3] text-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center order-2 md:order-1">
              <Image
                src={Logo}
                alt="Logo da Empresa"
                width={140}
                height={44}
                className="filter invert brightness-0"
              />
            </div>

            <div className="text-center order-1 md:order-2">
              <p className="text-sm mb-2">Nossas redes</p>
              <div className="flex justify-center space-x-6">
                <Link
                  href="https://www.instagram.com/matrixxapp"
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

            <div className="text-center md:text-right text-sm order-3">
              <p>© {new Date().getFullYear()} Todos os direitos reservados</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

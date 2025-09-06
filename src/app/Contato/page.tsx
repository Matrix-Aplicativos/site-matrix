"use client";

import Link from "next/link";
import { FaWhatsapp, FaInstagram, FaLinkedin } from "react-icons/fa";
import Image from "next/image";
import Logo from "../img/Logo.svg";
import { useState } from "react";
import InputMask from "react-input-mask";

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
    null
  );

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
      const API_URL = process.env.NEXT_PUBLIC_API_COLETA_URL!.replace("/v1","");

      const response = await fetch(`${API_URL}/contato`, {
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

  return (
    <div className="font-roboto min-h-screen flex flex-col bg-white text-gray-900">
      <main className="flex-grow">
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl text-[#1769E3] font-bold mb-4">
                  Entre em contato conosco!
                </h2>
                <p className="text-lg text-gray-600">
                  Prefere falar diretamente? Utilize um dos canais abaixo.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* WhatsApp - Lorenzo */}
                <div className="bg-white p-6 rounded-lg text-center">
                  <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaWhatsapp className="text-3xl text-green-500" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-800">
                    WhatsApp - Lorenzo Garcia
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Conversas rápidas e diretas
                  </p>
                  <Link
                    href="https://wa.me/5565992233566"
                    target="_blank"
                    className="inline-block bg-green-500 text-white py-2 px-6 rounded-lg hover:bg-green-600 transition duration-300"
                  >
                    Enviar mensagem
                  </Link>
                </div>

                {/* WhatsApp - Juan */}
                <div className="bg-white p-6 rounded-lg text-center">
                  <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaWhatsapp className="text-3xl text-green-500" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-800">
                    WhatsApp - Juan Cassemiro
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Conversas rápidas e diretas
                  </p>
                  <Link
                    href="https://wa.me/5565996044321"
                    target="_blank"
                    className="inline-block bg-green-500 text-white py-2 px-6 rounded-lg hover:bg-green-600 transition duration-300"
                  >
                    Enviar mensagem
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl text-[#1769E3] font-bold mb-4">
                  Ou mande uma mensagem por Email
                </h2>
                <p className="text-lg text-gray-600">
                  Preencha o formulário abaixo e nossa equipe entrará em contato
                  o mais breve possível.
                </p>
              </div>

              <div className="bg-gray-50 p-8 rounded-lg ">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="nome"
                        className="block text-gray-700 mb-2"
                      >
                        Nome *
                      </label>
                      <input
                        type="text"
                        id="nome"
                        name="nome"
                        value={formData.nome}
                        onChange={handleChange}
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                        placeholder="Seu nome completo"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="block text-gray-700 mb-2"
                      >
                        E-mail *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                        placeholder="seu@email.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="empresa"
                        className="block text-gray-700 mb-2"
                      >
                        Empresa
                      </label>
                      <input
                        type="text"
                        id="empresa"
                        name="empresa"
                        value={formData.empresa}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                        placeholder="Nome da sua empresa"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="telefone"
                        className="block text-gray-700 mb-2"
                      >
                        Telefone *
                      </label>
                      <InputMask
                        mask="(99) 99999-9999"
                        type="tel"
                        id="telefone"
                        name="telefone"
                        value={formData.telefone}
                        onChange={handleChange}
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                        placeholder="(00) 00000-0000"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="assunto"
                      className="block text-gray-700 mb-2"
                    >
                      Assunto *
                    </label>
                    <input
                      type="text"
                      id="assunto"
                      name="assunto"
                      value={formData.assunto}
                      onChange={handleChange}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                      placeholder="Assunto da mensagem"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="mensagem"
                      className="block text-gray-700 mb-2"
                    >
                      Mensagem *
                    </label>
                    <textarea
                      id="mensagem"
                      name="mensagem"
                      value={formData.mensagem}
                      onChange={handleChange}
                      required
                      rows={5}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white resize-none"
                      placeholder="Como podemos ajudar você?"
                    ></textarea>
                  </div>

                  {submitStatus === "success" && (
                    <div className="bg-green-100 text-green-700 p-3 rounded-lg">
                      Mensagem enviada com sucesso! Retornaremos em breve.
                    </div>
                  )}
                  {submitStatus === "error" && (
                    <div className="bg-red-100 text-red-700 p-3 rounded-lg">
                      Ocorreu um erro ao enviar a mensagem. Por favor, tente
                      novamente.
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#1769E3] text-white py-3 px-6 rounded-lg hover:bg-[#155ab2] transition duration-300 font-medium text-lg disabled:opacity-70"
                  >
                    {isSubmitting ? "Enviando..." : "Enviar Mensagem"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#1769E3] text-white py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center order-2 md:order-1">
              <Image
                src={Logo}
                alt="Logo da Empresa"
                width={120}
                height={40}
                className="filter invert brightness-0"
              />
            </div>

            <div className="text-center order-1 md:order-2">
              <div className="flex justify-center space-x-6">
                <Link
                  href="https://www.instagram.com/matrixxapp"
                  target="_blank"
                  className="hover:text-gray-300 transition-colors flex flex-col items-center"
                >
                  <FaInstagram className="text-xl mb-1" />
                  <span className="text-xs">Instagram</span>
                </Link>
                <Link
                  href="https://www.linkedin.com/company/matrix-aplicativos/?viewAsMember=true"
                  target="_blank"
                  className="hover:text-gray-300 transition-colors flex flex-col items-center"
                >
                  <FaLinkedin className="text-xl mb-1" />
                  <span className="text-xs">LinkedIn</span>
                </Link>
                <Link
                  href="https://wa.me/5565992233566"
                  target="_blank"
                  className="hover:text-gray-300 transition-colors flex flex-col items-center"
                >
                  <FaWhatsapp className="text-xl mb-1" />
                  <span className="text-xs">WhatsApp</span>
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

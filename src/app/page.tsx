"use client";

import { useState } from "react";

import {
  Receipt,
  Calculator,
  TrendingUp,
  CalendarClock,
  ChevronRight,
  Star,
  Menu,
  X,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-page">
      {/* Navbar */}
      <nav
        className="fixed top-0 w-full backdrop-blur-md z-50 transition-colors duration-200"
        style={{
          backgroundColor: "color-mix(in srgb, var(--bg-surface) 85%, transparent)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-2xl font-bold text-primary">
              Financial<span className="gradient-text">Hero</span>
            </span>
          </div>

          {/* Desktop nav */}
          <div className="hidden sm:flex items-center gap-3">
            <ThemeToggle />
            <a
              href="#"
              className="text-muted hover:text-hero-orange font-medium transition-colors"
            >
              Entrar
            </a>
            <a href="#" className="btn-hero text-sm">
              Criar conta
            </a>
          </div>

          {/* Mobile nav buttons */}
          <div className="flex sm:hidden items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-xl transition-all hover:bg-hero-orange/10"
              style={{ color: "var(--text-muted)" }}
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {menuOpen && (
          <div
            className="sm:hidden px-4 pb-4 space-y-2"
            style={{ borderTop: "1px solid var(--border)" }}
          >
            <a
              href="#"
              className="block w-full text-center py-3 rounded-xl font-medium transition-colors text-muted hover:text-hero-orange"
              onClick={() => setMenuOpen(false)}
            >
              Entrar
            </a>
            <a
              href="#"
              className="block w-full btn-hero text-sm text-center"
              onClick={() => setMenuOpen(false)}
            >
              Criar conta
            </a>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-28 sm:pt-32 pb-12 sm:pb-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center bg-hero-orange/10 text-hero-orange px-4 py-2 rounded-full text-sm font-semibold mb-6">
              Seu superpoder financeiro
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-primary leading-tight mb-6">
              Tome o controle das suas{" "}
              <span className="gradient-text">finanças</span> como um herói
            </h1>
            <p className="text-base sm:text-xl text-muted mb-8 sm:mb-10 leading-relaxed">
              Organize comprovantes, acompanhe gastos recorrentes e descubra
              quanto do seu tempo de trabalho está sendo investido em cada
              compra. Tudo em um só lugar.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="#" className="btn-hero text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto">
                Começar agora
                <ChevronRight className="w-5 h-5 ml-2" />
              </a>
              <a href="#" className="btn-outline text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto">
                Já tenho conta
              </a>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="mt-10 sm:mt-16 relative">
            <div className="card rounded-3xl p-4 sm:p-8 max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                <div className="bg-linear-to-br from-hero-orange/5 to-hero-purple/5 rounded-2xl p-4 sm:p-6 text-center">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-hero-orange/10 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7 text-hero-orange" />
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-primary">R$ 2.450</p>
                  <p className="text-sm text-muted mt-1">Gastos este mês</p>
                </div>
                <div className="bg-linear-to-br from-hero-purple/5 to-hero-orange/5 rounded-2xl p-4 sm:p-6 text-center">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-hero-purple/10 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <Receipt className="w-6 h-6 sm:w-7 sm:h-7 text-hero-purple" />
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-primary">18</p>
                  <p className="text-sm text-muted mt-1">Comprovantes salvos</p>
                </div>
                <div className="bg-linear-to-br from-hero-orange/5 to-hero-purple/5 rounded-2xl p-4 sm:p-6 text-center">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-hero-success/10 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <Calculator className="w-6 h-6 sm:w-7 sm:h-7 text-hero-success" />
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-primary">32h</p>
                  <p className="text-sm text-muted mt-1">Horas de trabalho</p>
                </div>
              </div>
            </div>
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-hero-orange/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-hero-purple/10 rounded-full blur-2xl" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 transition-colors duration-200" style={{ backgroundColor: "var(--bg-surface)" }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-4">
              Seus <span className="gradient-text">superpoderes</span> financeiros
            </h2>
            <p className="text-base sm:text-lg text-muted max-w-2xl mx-auto">
              Ferramentas poderosas para você dominar suas finanças pessoais
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            <FeatureCard
              icon={<Receipt className="w-7 h-7" />}
              title="Comprovantes"
              description="Cadastre e organize todos os seus recibos e comprovantes em um só lugar."
              color="orange"
            />
            <FeatureCard
              icon={<CalendarClock className="w-7 h-7" />}
              title="Gastos Recorrentes"
              description="Registre contas fixas com data de vencimento e nunca mais esqueça um pagamento."
              color="purple"
            />
            <FeatureCard
              icon={<Calculator className="w-7 h-7" />}
              title="Calculadora"
              description="Descubra quantas horas de trabalho você precisa para pagar cada compra."
              color="orange"
            />
            <FeatureCard
              icon={<TrendingUp className="w-7 h-7" />}
              title="Métricas"
              description="Visualize resumos dos seus gastos para tomar decisões melhores."
              color="purple"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-hero-gradient rounded-3xl p-6 sm:p-12 text-center text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
            <div className="relative z-10">
              <Star className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-4 sm:mb-6 opacity-90" />
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
                Pronto para ser um herói financeiro?
              </h2>
              <p className="text-base sm:text-lg opacity-90 mb-6 sm:mb-8 max-w-xl mx-auto">
                Junte-se a milhares de pessoas que já estão no controle das suas finanças.
              </p>
              <a
                href="#"
                className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-hero-orange bg-white hover:bg-gray-50 transition-all duration-200 text-base sm:text-lg"
              >
                Criar minha conta grátis
                <ChevronRight className="w-5 h-5 ml-2" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 sm:py-10 px-4 sm:px-6" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center">
            <span className="text-xl font-bold text-primary">
              Financial<span className="gradient-text">Hero</span>
            </span>
          </div>
          <p className="text-sm text-subtle">
            &copy; 2025 FinancialHero. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: "orange" | "purple";
}) {
  const bgColor = color === "orange" ? "bg-hero-orange/10" : "bg-hero-purple/10";
  const textColor = color === "orange" ? "text-hero-orange" : "text-hero-purple";

  return (
    <div className="card group cursor-default">
      <div
        className={`w-14 h-14 rounded-xl ${bgColor} flex items-center justify-center mb-4 ${textColor} group-hover:scale-110 transition-transform`}
      >
        {icon}
      </div>
      <h3 className="text-lg font-bold text-primary mb-2">{title}</h3>
      <p className="text-muted text-sm leading-relaxed">{description}</p>
    </div>
  );
}

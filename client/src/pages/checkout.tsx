import { useState, useCallback, useEffect } from "react";
import { useLocation } from "wouter";
import { QrCode, CheckCircle2, ChevronDown, ShieldCheck, Plus, Check, Zap, Tag, Loader2, Copy, CopyCheck } from "lucide-react";

import { useCart } from "@/lib/cart-context";
import type { CartProduct } from "@/lib/cart-context";

function formatPrice(value: number) {
  return "R$ " + value.toFixed(2).replace(".", ",");
}

type Step = 1 | 2 | 3;

const ORDER_BUMPS: (CartProduct & { originalPriceValue: number; discountPct: number; highlight: string })[] = [
  {
    id: 101,
    name: "Body Splash Blue Crush 200ml",
    image: "https://webwepinkapp.netlify.app/uploads/prod_69449089650fe.png",
    badge: "60% OFF",
    badgeType: "off",
    originalPrice: "R$ 69,90",
    originalPriceValue: 69.9,
    price: "R$ 27,90",
    priceValue: 27.9,
    discountPct: 60,
    btnLabel: "COMPRAR",
    description: null,
    highlight: "Adicione agora por apenas",
  },
  {
    id: 102,
    name: "Kit 3 Body Splashes Sortidos",
    image: "https://webwepinkapp.netlify.app/uploads/prod_6944c42ab881e.jpg",
    badge: "70% OFF",
    badgeType: "off",
    originalPrice: "R$ 99,90",
    originalPriceValue: 99.9,
    price: "R$ 29,90",
    priceValue: 29.9,
    discountPct: 70,
    btnLabel: "COMPRAR",
    description: null,
    highlight: "Oferta exclusiva no checkout",
  },
  {
    id: 103,
    name: "Perfume Colônia Vivibora 50ml",
    image: "https://webwepinkapp.netlify.app/uploads/prod_6944c602c1565.png",
    badge: "55% OFF",
    badgeType: "off",
    originalPrice: "R$ 89,90",
    originalPriceValue: 89.9,
    price: "R$ 39,90",
    priceValue: 39.9,
    discountPct: 55,
    btnLabel: "COMPRAR",
    description: null,
    highlight: "Só aqui no fechamento do pedido",
  },
];


const STATES = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG",
  "PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"
];

const STEPS = [
  { id: 1, label: "identificação" },
  { id: 2, label: "endereço" },
  { id: 3, label: "pagamento" },
];

function StepIndicator({ current }: { current: Step }) {
  return (
    <div className="flex items-center gap-0">
      {STEPS.map((step, i) => {
        const isActive = step.id === current;
        const isDone = step.id < current;
        return (
          <div key={step.id} className="flex items-center">
            <div className="flex items-center gap-1.5">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-extrabold flex-shrink-0 ${
                  isActive
                    ? "bg-[#FF0080] text-white"
                    : isDone
                    ? "bg-[#FF0080] text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {step.id}
              </div>
              <span
                className={`text-xs md:text-sm font-semibold hidden sm:block ${
                  isActive ? "text-[#FF0080] font-extrabold" : "text-gray-400"
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-6 md:w-10 h-0.5 mx-2 ${step.id < current ? "bg-[#FF0080]" : "bg-gray-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function MarqueeTicker() {
  const text = Array(20).fill("promoção").join(" | ");
  return (
    <div className="bg-white border-y border-gray-100 overflow-hidden py-1.5" data-testid="marquee-ticker">
      <div
        className="whitespace-nowrap text-xs text-gray-400 font-semibold tracking-wide"
        style={{
          display: "inline-block",
          animation: "marquee 18s linear infinite",
        }}
      >
        {text + " | " + text}
      </div>
      <style>{`
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}

function InputField({
  label, id, type = "text", placeholder, required = false, value, onChange
}: {
  label: string; id: string; type?: string; placeholder?: string;
  required?: boolean; value: string; onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-xs font-bold text-gray-600 uppercase tracking-wider">
        {label}{required && <span className="text-[#FF0080] ml-0.5">*</span>}
      </label>
      <input
        id={id}
        data-testid={`input-${id}`}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border border-gray-300 rounded-sm px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-[#FF0080] focus:ring-1 focus:ring-[#FF0080] transition-colors bg-white"
        autoComplete="off"
      />
    </div>
  );
}

function SectionBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-sm p-5 mb-4">
      <h2 className="text-base font-extrabold text-gray-800 mb-4 pb-2 border-b border-gray-100 uppercase tracking-wide">
        {title}
      </h2>
      {children}
    </div>
  );
}

function OrderBumpCard({
  bump,
  added,
  onAdd,
}: {
  bump: typeof ORDER_BUMPS[0];
  added: boolean;
  onAdd: () => void;
}) {
  return (
    <div
      className={`relative border-2 rounded-sm overflow-hidden transition-colors ${
        added ? "border-green-400 bg-green-50" : "border-[#FF0080] bg-white"
      }`}
      data-testid={`order-bump-${bump.id}`}
    >
      {/* Top ribbon */}
      <div className={`flex items-center gap-2 px-4 py-2 text-white text-xs font-extrabold tracking-wide ${added ? "bg-green-500" : "bg-[#FF0080]"}`}>
        <Zap size={13} className="flex-shrink-0" />
        <span>{added ? "Adicionado ao pedido!" : bump.highlight.toUpperCase()}</span>
      </div>

      <div className="flex gap-3 p-4">
        {/* Product image */}
        <div className="relative flex-shrink-0">
          <img
            src={bump.image}
            alt={bump.name}
            className="w-20 h-20 object-cover rounded-sm border border-gray-100"
          />
          <span className="absolute -top-1.5 -left-1.5 bg-[#FF0080] text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-sm">
            {bump.discountPct}% OFF
          </span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <p className="text-sm font-extrabold text-gray-800 leading-snug mb-1">{bump.name}</p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-gray-400 line-through">{bump.originalPrice}</span>
              <span className="text-base font-extrabold text-[#FF0080]">{bump.price}</span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
              <Tag size={10} />
              Economia de {formatPrice(bump.originalPriceValue - bump.priceValue)}
            </p>
          </div>
        </div>

        {/* Button */}
        <div className="flex-shrink-0 flex items-center">
          <button
            type="button"
            onClick={onAdd}
            disabled={added}
            data-testid={`button-add-bump-${bump.id}`}
            className={`flex flex-col items-center gap-1 rounded-sm px-3 py-2.5 text-xs font-extrabold transition-colors ${
              added
                ? "bg-green-500 text-white cursor-default"
                : "bg-[#FF0080] hover:bg-[#e6006f] active:bg-[#cc005f] text-white"
            }`}
          >
            {added ? <Check size={16} /> : <Plus size={16} />}
            <span className="hidden sm:block text-[10px]">{added ? "Adicionado" : "Adicionar"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function PixQRCode({
  total,
  qrCode,
  qrCodeUrl,
  expiresAt,
}: {
  total: number;
  qrCode: string | null;
  qrCodeUrl: string | null;
  expiresAt: string | null;
}) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    if (!qrCode) return;
    navigator.clipboard.writeText(qrCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <div className="w-48 h-48 bg-white border-2 border-gray-200 rounded flex items-center justify-center overflow-hidden">
        {qrCodeUrl ? (
          <img src={qrCodeUrl} alt="QR Code PIX" className="w-full h-full object-contain p-1" data-testid="img-pix-qr" />
        ) : (
          <div className="flex flex-col items-center gap-2 text-gray-400">
            <QrCode size={40} />
            <span className="text-xs">QR Code</span>
          </div>
        )}
      </div>

      <p className="text-sm font-bold text-gray-800 text-center">
        Escaneie o QR Code com o app do seu banco
      </p>

      {qrCode && (
        <div className="w-full bg-gray-50 border border-gray-200 rounded-sm p-3">
          <p className="text-xs text-gray-500 font-semibold mb-1">Ou copie o código PIX:</p>
          <div className="flex gap-2 items-center">
            <input
              readOnly
              value={qrCode}
              data-testid="input-pix-code"
              className="flex-1 text-xs bg-white border border-gray-200 rounded-sm px-2 py-1.5 text-gray-600 outline-none min-w-0"
            />
            <button
              type="button"
              onClick={handleCopy}
              data-testid="button-copy-pix"
              className={`text-xs px-3 py-1.5 rounded-sm font-bold transition-colors flex-shrink-0 flex items-center gap-1 ${
                copied ? "bg-green-500 text-white" : "bg-[#FF0080] hover:bg-[#e6006f] text-white"
              }`}
            >
              {copied ? <CopyCheck size={13} /> : <Copy size={13} />}
              {copied ? "Copiado!" : "Copiar"}
            </button>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-400 text-center">
        Valor: <span className="font-bold text-[#FF0080]">{formatPrice(total)}</span>
        {expiresAt && (
          <> — válido até {new Date(expiresAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</>
        )}
        {!expiresAt && <> — válido por 30 minutos</>}
      </p>
    </div>
  );
}

export default function Checkout() {
  const [, navigate] = useLocation();
  const { items, total, addItem, clearCart } = useCart();

  const [utmParams, setUtmParams] = useState<Record<string, string>>({});

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const keys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "src"];
    const found: Record<string, string> = {};
    for (const k of keys) {
      const v = p.get(k) || sessionStorage.getItem(`utm_${k}`) || "";
      if (v) { found[k] = v; sessionStorage.setItem(`utm_${k}`, v); }
    }
    setUtmParams(found);
  }, []);

  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [stepError, setStepError] = useState<string | null>(null);
  const [pixReady, setPixReady] = useState(false);
  const [pixGenerating, setPixGenerating] = useState(false);
  const [pixError, setPixError] = useState<string | null>(null);
  const [pixData, setPixData] = useState<{
    orderId: string;
    qrCode: string | null;
    qrCodeUrl: string | null;
    expiresAt: string | null;
  } | null>(null);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [addedBumps, setAddedBumps] = useState<Set<number>>(new Set());
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    nome: "", email: "", cpf: "", telefone: "",
    cep: "", rua: "", numero: "", complemento: "",
    bairro: "", cidade: "", estado: "",
  });

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleNext() {
    setStepError(null);
    if (currentStep === 1) {
      if (!form.nome.trim() || form.nome.trim().length < 3)
        return setStepError("Preencha seu nome completo (mínimo 3 caracteres).");
      if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
        return setStepError("Preencha um e-mail válido (ex: nome@email.com, sem espaços).");
      if (form.cpf.replace(/\D/g, "").length < 11)
        return setStepError("Preencha um CPF válido com 11 dígitos.");
      if (!form.telefone.trim())
        return setStepError("Preencha seu telefone.");
    }
    if (currentStep === 2) {
      if (!form.cep.trim()) return setStepError("Preencha o CEP.");
      if (!form.rua.trim()) return setStepError("Preencha o endereço.");
      if (!form.numero.trim()) return setStepError("Preencha o número.");
      if (!form.bairro.trim()) return setStepError("Preencha o bairro.");
      if (!form.cidade.trim()) return setStepError("Preencha a cidade.");
      if (!form.estado) return setStepError("Selecione o estado.");
    }
    if (currentStep < 3) setCurrentStep((prev) => (prev + 1) as Step);
  }

  function handleBack() {
    setStepError(null);
    setPixError(null);
    if (currentStep > 1) setCurrentStep((prev) => (prev - 1) as Step);
  }

  async function generatePix() {
    setPixError(null);
    setPixGenerating(true);

    const minDelay = new Promise<void>((res) => setTimeout(res, 2000));

    try {
      const orderItems = items.map((item) => ({
        description: item.name,
        amount: Math.round(item.priceValue * 100),
        quantity: item.qty,
      }));

      const [apiRes] = await Promise.all([
        fetch("/api/pix/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customer: {
              name: form.nome,
              email: form.email,
              document: form.cpf,
              phone: form.telefone,
            },
            items: orderItems,
            address: {
              street: form.rua,
              number: form.numero,
              complement: form.complemento,
              neighborhood: form.bairro,
              city: form.cidade,
              state: form.estado,
              zip_code: form.cep,
            },
            utm: utmParams,
          }),
        }),
        minDelay,
      ]);

      const data = await apiRes.json();

      if (!apiRes.ok) {
        setPixError(data.error ?? "Erro ao gerar PIX. Tente novamente.");
        setPixGenerating(false);
        return;
      }

      setPixData({
        orderId: data.transactionId,
        qrCode: data.qrCode,
        qrCodeUrl: data.qrCodeUrl,
        expiresAt: data.expiresAt,
      });
      setPixGenerating(false);
      setPixReady(true);
    } catch {
      setPixError("Falha de conexão. Verifique sua internet e tente novamente.");
      setPixGenerating(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (currentStep < 3) {
      handleNext();
    } else {
      setSubmitted(true);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col" style={{ fontFamily: "Montserrat, sans-serif" }}>
        {/* Success Header */}
        <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
          <div className="max-w-5xl mx-auto flex items-center justify-between px-4 h-14">
            <a href="/" className="flex items-center gap-1" data-testid="link-logo-checkout">
              <span className="text-[#FF0080] font-extrabold text-xl tracking-tight">we</span>
              <span className="text-[#FF0080] font-extrabold text-xl">♥</span>
            </a>
            <div className="flex items-center gap-1.5 text-green-600 text-sm font-semibold">
              <ShieldCheck size={16} />
              <span>Site seguro</span>
            </div>
          </div>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <div className="bg-white rounded-sm border border-gray-200 p-10 max-w-md w-full text-center shadow-sm">
            <CheckCircle2 size={60} className="text-[#FF0080] mx-auto mb-4" />
            <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Pedido Realizado!</h1>
            <p className="text-gray-500 text-sm mb-6">
              Obrigado pela sua compra. Você receberá um e-mail de confirmação em breve.
            </p>
            <button
              className="w-full bg-[#FF0080] text-white font-extrabold py-3 rounded-sm hover:bg-[#e6006f] transition-colors tracking-wide"
              onClick={() => { clearCart(); navigate("/"); }}
              data-testid="button-back-to-home"
            >
              Voltar à loja
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4" style={{ fontFamily: "Montserrat, sans-serif" }}>
        <div className="text-center">
          <p className="text-gray-500 text-sm mb-4 font-semibold">Seu carrinho está vazio.</p>
          <button
            className="bg-[#FF0080] text-white font-extrabold py-3 px-8 rounded-sm hover:bg-[#e6006f] transition-colors"
            onClick={() => navigate("/")}
            data-testid="button-go-shopping"
          >
            Ver Produtos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "Montserrat, sans-serif" }}>

      {/* ── Header ── */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-4 h-14 gap-4">
          {/* Logo */}
          <a href="/" className="flex items-center gap-0.5 flex-shrink-0" data-testid="link-logo-checkout">
            <span className="text-[#FF0080] font-extrabold text-xl tracking-tight leading-none">we</span>
            <span className="text-[#FF0080] font-extrabold text-xl leading-none">♥</span>
          </a>

          {/* Step Indicators */}
          <StepIndicator current={currentStep} />

          {/* Site Seguro */}
          <div className="flex items-center gap-1.5 text-green-600 text-xs md:text-sm font-semibold flex-shrink-0">
            <ShieldCheck size={16} />
            <span className="hidden sm:inline">Site seguro</span>
          </div>
        </div>
      </header>

      {/* ── Page Title ── */}
      <div className="bg-white border-b border-gray-100 py-4 text-center">
        <h1
          className="text-xl md:text-2xl font-extrabold text-[#FF0080] tracking-wide"
          data-testid="text-checkout-title"
        >
          Finalizar compra
        </h1>
      </div>

      {/* ── Marquee Ticker ── */}
      <MarqueeTicker />

      {/* ── Promo Banner ── */}
      <div className="max-w-5xl mx-auto px-4 pt-4">
        <div className="w-full overflow-hidden rounded-sm">
          <img
            src="https://webwepinkapp.netlify.app/assets/hero-banner-novo.webp"
            alt="Promoção — todo o site com até 72% off"
            className="w-full object-cover object-center"
            style={{ maxHeight: "220px" }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
            data-testid="img-promo-banner"
          />
        </div>
      </div>

      {/* ── Main Content ── */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col lg:flex-row gap-6">

            {/* LEFT — Forms */}
            <div key={`step-${currentStep}-${pixReady}`} className="flex-1 min-w-0 animate-step-enter">

              {/* STEP 1 — Identificação */}
              {currentStep === 1 && (
                <SectionBlock title="Identificação">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <InputField label="Nome Completo" id="nome" placeholder="Seu nome completo" required value={form.nome} onChange={(v) => set("nome", v)} />
                    </div>
                    <InputField label="E-mail" id="email" type="email" placeholder="seu@email.com" required value={form.email} onChange={(v) => set("email", v)} />
                    <InputField label="CPF" id="cpf" placeholder="000.000.000-00" required value={form.cpf} onChange={(v) => set("cpf", v)} />
                    <InputField label="Telefone / WhatsApp" id="telefone" placeholder="(00) 00000-0000" required value={form.telefone} onChange={(v) => set("telefone", v)} />
                  </div>
                  {stepError && (
                    <div className="mt-3 flex items-center gap-2 bg-red-50 border border-red-300 rounded-sm px-3 py-2.5" data-testid="text-step-error">
                      <span className="text-red-500 font-extrabold flex-shrink-0">!</span>
                      <p className="text-sm text-red-700 font-semibold">{stepError}</p>
                    </div>
                  )}
                  <div className="flex justify-end mt-4">
                    <button
                      type="button"
                      onClick={handleNext}
                      className="bg-[#FF0080] text-white font-extrabold text-sm px-8 py-3 rounded-sm hover:bg-[#e6006f] active:bg-[#cc005f] transition-colors tracking-widest uppercase"
                      data-testid="button-next-step"
                    >
                      Continuar
                    </button>
                  </div>
                </SectionBlock>
              )}

              {/* STEP 2 — Endereço */}
              {currentStep === 2 && (
                <SectionBlock title="Endereço de Entrega">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex gap-2 items-end sm:col-span-2">
                      <div className="flex-1">
                        <InputField label="CEP" id="cep" placeholder="00000-000" required value={form.cep} onChange={(v) => set("cep", v)} />
                      </div>
                      <button
                        type="button"
                        className="border-2 border-[#FF0080] text-[#FF0080] font-bold text-xs px-4 py-2.5 rounded-sm hover:bg-pink-50 transition-colors flex-shrink-0"
                        data-testid="button-search-cep"
                      >
                        Buscar CEP
                      </button>
                    </div>
                    <div className="sm:col-span-2">
                      <InputField label="Endereço" id="rua" placeholder="Rua, Avenida..." required value={form.rua} onChange={(v) => set("rua", v)} />
                    </div>
                    <InputField label="Número" id="numero" placeholder="Ex: 123" required value={form.numero} onChange={(v) => set("numero", v)} />
                    <InputField label="Complemento" id="complemento" placeholder="Apto, Bloco... (opcional)" value={form.complemento} onChange={(v) => set("complemento", v)} />
                    <InputField label="Bairro" id="bairro" placeholder="Seu bairro" required value={form.bairro} onChange={(v) => set("bairro", v)} />
                    <InputField label="Cidade" id="cidade" placeholder="Sua cidade" required value={form.cidade} onChange={(v) => set("cidade", v)} />
                    <div className="flex flex-col gap-1">
                      <label htmlFor="estado" className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Estado<span className="text-[#FF0080] ml-0.5">*</span>
                      </label>
                      <div className="relative">
                        <select
                          id="estado"
                          data-testid="input-estado"
                          value={form.estado}
                          onChange={(e) => set("estado", e.target.value)}
                          className="w-full appearance-none border border-gray-300 rounded-sm px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-[#FF0080] focus:ring-1 focus:ring-[#FF0080] transition-colors bg-white pr-8"
                        >
                          <option value="">Selecione</option>
                          {STATES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                  {stepError && (
                    <div className="mt-3 flex items-center gap-2 bg-red-50 border border-red-300 rounded-sm px-3 py-2.5" data-testid="text-step-error">
                      <span className="text-red-500 font-extrabold flex-shrink-0">!</span>
                      <p className="text-sm text-red-700 font-semibold">{stepError}</p>
                    </div>
                  )}
                  <div className="flex justify-between mt-4 gap-3">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="border-2 border-gray-300 text-gray-600 font-bold text-sm px-6 py-3 rounded-sm hover:border-gray-400 transition-colors tracking-wide"
                      data-testid="button-prev-step"
                    >
                      Voltar
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      className="bg-[#FF0080] text-white font-extrabold text-sm px-8 py-3 rounded-sm hover:bg-[#e6006f] active:bg-[#cc005f] transition-colors tracking-widest uppercase"
                      data-testid="button-next-step"
                    >
                      Continuar
                    </button>
                  </div>
                </SectionBlock>
              )}

              {/* STEP 3 — Order Bumps + Pagamento */}
              {/* PIX loading screen */}
              {currentStep === 3 && pixGenerating && (
                <div className="bg-white border border-gray-200 rounded-sm p-10 mb-4 flex flex-col items-center gap-6 animate-step-enter">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full border-4 border-pink-100 border-t-[#FF0080] animate-spin" />
                    <QrCode size={28} className="text-[#FF0080] absolute inset-0 m-auto" />
                  </div>
                  <div className="text-center">
                    <p className="text-base font-extrabold text-gray-800 mb-1">Gerando seu PIX…</p>
                    <p className="text-xs text-gray-500">Aguarde, estamos preparando o código de pagamento</p>
                  </div>
                  <div className="w-full max-w-xs bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <div className="h-full bg-[#FF0080] rounded-full animate-pix-progress" />
                  </div>
                </div>
              )}

              {currentStep === 3 && !pixReady && !pixGenerating && (
                <div>
                  {/* Order Bumps */}
                  <div className="bg-white border border-gray-200 rounded-sm p-5 mb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Zap size={16} className="text-[#FF0080]" />
                      <h2 className="text-base font-extrabold text-gray-800 uppercase tracking-wide">
                        Ofertas Exclusivas para Você
                      </h2>
                    </div>
                    <p className="text-xs text-gray-500 mb-4">
                      Aproveite! Esses produtos estão disponíveis com desconto especial apenas agora.
                    </p>

                    <div className="flex flex-col gap-3">
                      {ORDER_BUMPS.map((bump) => (
                        <OrderBumpCard
                          key={bump.id}
                          bump={bump}
                          added={addedBumps.has(bump.id)}
                          onAdd={() => {
                            if (!addedBumps.has(bump.id)) {
                              addItem(bump);
                              setAddedBumps((prev) => new Set([...prev, bump.id]));
                            }
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Continue to PIX */}
                  <div className="bg-white border border-gray-200 rounded-sm p-5 mb-4">
                    <div className="flex justify-between gap-3">
                      <button
                        type="button"
                        onClick={handleBack}
                        className="border-2 border-gray-300 text-gray-600 font-bold text-sm px-6 py-3 rounded-sm hover:border-gray-400 transition-colors tracking-wide"
                        data-testid="button-prev-step"
                      >
                        Voltar
                      </button>
                      <button
                        type="button"
                        onClick={generatePix}
                        className="flex items-center gap-2 bg-[#FF0080] text-white font-extrabold text-sm px-8 py-3 rounded-sm hover:bg-[#e6006f] active:bg-[#cc005f] transition-colors tracking-widest uppercase"
                        data-testid="button-generate-pix"
                      >
                        <QrCode size={16} />
                        Gerar PIX
                      </button>
                    </div>
                    {pixError && (
                      <div className="mt-3 flex items-start gap-2 bg-red-50 border border-red-300 rounded-sm p-3" data-testid="text-pix-error">
                        <span className="text-red-500 flex-shrink-0 font-extrabold text-base leading-none mt-0.5">!</span>
                        <p className="text-sm text-red-700 font-semibold leading-snug">{pixError}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {currentStep === 3 && pixReady && (
                <SectionBlock title="Forma de Pagamento">
                  <div className="flex items-center gap-2 mb-5 bg-pink-50 border border-[#FF0080] rounded-sm px-4 py-2">
                    <QrCode size={18} className="text-[#FF0080]" />
                    <span className="text-sm font-extrabold text-[#FF0080]">PIX</span>
                  </div>

                  <PixQRCode
                    total={total}
                    qrCode={pixData?.qrCode ?? null}
                    qrCodeUrl={pixData?.qrCodeUrl ?? null}
                    expiresAt={pixData?.expiresAt ?? null}
                  />

                  {/* Payment confirmation checkbox */}
                  <label
                    htmlFor="payment-confirmed"
                    className={`flex items-start gap-3 mt-5 p-3 rounded-sm border-2 cursor-pointer select-none transition-colors ${
                      paymentConfirmed
                        ? "border-green-400 bg-green-50"
                        : "border-gray-200 bg-gray-50 hover:border-[#FF0080]"
                    }`}
                    data-testid="label-payment-confirmed"
                  >
                    <div className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors mt-0.5 ${
                      paymentConfirmed ? "bg-green-500 border-green-500" : "border-gray-300 bg-white"
                    }`}>
                      {paymentConfirmed && <Check size={12} className="text-white" strokeWidth={3} />}
                    </div>
                    <input
                      id="payment-confirmed"
                      type="checkbox"
                      className="sr-only"
                      checked={paymentConfirmed}
                      onChange={(e) => setPaymentConfirmed(e.target.checked)}
                      data-testid="checkbox-payment-confirmed"
                    />
                    <span className={`text-xs font-semibold leading-snug ${paymentConfirmed ? "text-green-700" : "text-gray-600"}`}>
                      {paymentConfirmed
                        ? "Pagamento confirmado! Clique em Finalizar Pedido."
                        : "Já realizei o pagamento via PIX e confirmo que o valor foi enviado."}
                    </span>
                  </label>

                  <div className="flex justify-between mt-4 gap-3">
                    <button
                      type="button"
                      onClick={() => { setPixReady(false); setPaymentConfirmed(false); setPixData(null); setPixError(null); }}
                      className="border-2 border-gray-300 text-gray-600 font-bold text-sm px-6 py-3 rounded-sm hover:border-gray-400 transition-colors tracking-wide"
                      data-testid="button-prev-step"
                    >
                      Voltar
                    </button>
                    <button
                      type="submit"
                      disabled={!paymentConfirmed}
                      data-testid="button-place-order"
                      className={`font-extrabold text-sm px-8 py-3 rounded-sm transition-colors tracking-widest uppercase ${
                        paymentConfirmed
                          ? "bg-green-500 hover:bg-green-600 active:bg-green-700 text-white"
                          : "bg-gray-200 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      Finalizar Pedido
                    </button>
                  </div>
                </SectionBlock>
              )}
            </div>

            {/* RIGHT — Order Summary */}
            <div className="w-full lg:w-72 xl:w-80 flex-shrink-0">
              <div className="bg-white border border-gray-200 rounded-sm p-5 sticky top-20" data-testid="order-summary">
                <h2 className="text-base font-extrabold text-gray-800 mb-4 pb-2 border-b border-gray-100 uppercase tracking-wide">
                  Resumo do Pedido
                </h2>

                <div className="divide-y divide-gray-100 mb-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3 py-3" data-testid={`summary-item-${item.id}`}>
                      <div className="relative flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-14 h-14 object-cover rounded-sm border border-gray-100"
                        />
                        <span className="absolute -top-1.5 -right-1.5 bg-[#FF0080] text-white text-[10px] font-extrabold rounded-full w-5 h-5 flex items-center justify-center">
                          {item.qty}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-700 leading-snug line-clamp-2">{item.name}</p>
                        {item.originalPrice && (
                          <p className="text-xs text-gray-400 line-through mt-0.5">{item.originalPrice}</p>
                        )}
                        <p className="text-sm font-extrabold text-[#FF0080] mt-0.5">
                          {formatPrice(item.priceValue * item.qty)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-100 pt-3 space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span className="font-semibold">Subtotal</span>
                    <span className="font-semibold">{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-gray-600">Frete</span>
                    <span className="font-extrabold text-[#FF0080]">Grátis</span>
                  </div>
                  <div className="flex justify-between text-base pt-2 border-t border-gray-100">
                    <span className="font-extrabold text-gray-900">Total</span>
                    <span className="font-extrabold text-[#FF0080]" data-testid="text-checkout-total">
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-1.5 mt-4 text-gray-400 text-xs">
                  <ShieldCheck size={11} className="text-green-500" />
                  <span>Pagamento 100% seguro</span>
                </div>
              </div>
            </div>

          </div>
        </form>
      </main>
    </div>
  );
}

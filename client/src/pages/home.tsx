import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { ShoppingCart, Menu, X, ChevronRight, User, RefreshCcw, MapPin, Package, Plus, Minus } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import type { CartProduct } from "@/lib/cart-context";

const KITS: CartProduct[] = [
  {
    id: 1,
    name: "Kit Bloquinho da Vivibora VF e 6 Body Splashes",
    image: "https://wepink.vtexassets.com/arquivos/ids/163929/kit-1.png",
    badge: "85% OFF",
    badgeType: "off",
    originalPrice: "R$ 459,90",
    price: "R$ 69,90",
    priceValue: 69.9,
    btnLabel: "COMPRAR",
    description: null,
  },
  {
    id: 2,
    name: "Kit Bloquinho da Vivibora VF Bloom e 6 Body Splashes",
    image: "https://wepink.vtexassets.com/arquivos/ids/163930/kit%202.png",
    badge: "85% OFF",
    badgeType: "off",
    originalPrice: "R$ 459,90",
    price: "R$ 69,90",
    priceValue: 69.9,
    btnLabel: "COMPRAR",
    description: null,
  },
  {
    id: 17,
    name: "Kit Moon Desodorante Colônia 100ml e 5 Body Splashes",
    image: "https://wepink.vtexassets.com/arquivos/ids/162259/159354-1200-auto.webp",
    badge: "EXCLUSIVO",
    badgeType: "exclusive",
    originalPrice: "R$ 319,90",
    price: "R$ 59,90",
    priceValue: 59.9,
    btnLabel: "COMPRAR",
    description: null,
  },
  {
    id: 5,
    name: "Kit Obsessed Desodorante Colônia 100ml e 5 Body Splashes",
    image: "https://wepink.vtexassets.com/arquivos/ids/163189/Obsessed-Desodorante-Colonia-100ml_1.webp",
    badge: "EXCLUSIVO",
    badgeType: "exclusive",
    originalPrice: "R$ 280,90",
    price: "R$ 54,90",
    priceValue: 54.9,
    btnLabel: "COMPRAR",
    description: null,
  },
];

const BODY_SPLASH: CartProduct[] = [
  {
    id: 6,
    name: "Kit 5 Body Splashes",
    image: "https://wepink.vtexassets.com/arquivos/ids/163968/kits-0503.webp",
    badge: "79% OFF",
    badgeType: "off",
    originalPrice: null,
    price: "R$ 39,90",
    priceValue: 39.9,
    btnLabel: "EU QUERO!",
    description: "Os cinco Body Splashes são apaixonantes e ideais para qualquer momento!",
  },
  {
    id: 4,
    name: "Kit Heaven Desodorante Colônia 100ml e 5 Body Splashes",
    image: "https://wepink.vtexassets.com/arquivos/ids/160239/heaven-3.jpg.jpg",
    badge: "80% OFF",
    badgeType: "off",
    originalPrice: "R$ 280,90",
    price: "R$ 54,90",
    priceValue: 54.9,
    btnLabel: "COMPRAR",
    description: null,
  },
  {
    id: 8,
    name: "Kit Queen Pink 100ml e 6 Body Splashes",
    image: "https://wepink.vtexassets.com/arquivos/ids/162220/159816-1200-auto.webp",
    badge: "77% OFF",
    badgeType: "off",
    originalPrice: "R$ 219,90",
    price: "R$ 49,90",
    priceValue: 49.9,
    btnLabel: "COMPRAR",
    description: null,
  },
  {
    id: 13,
    name: "Kit One Touch Desodorante Colônia 100 ml e 5 Body Splashes",
    image: "https://wepink.vtexassets.com/arquivos/ids/163222/One-Touch-3.webp",
    badge: "76% OFF",
    badgeType: "off",
    originalPrice: "R$ 199,90",
    price: "R$ 47,90",
    priceValue: 47.9,
    btnLabel: "COMPRAR",
    description: null,
  },
];

const PERFUMARIA: CartProduct[] = [
  {
    id: 14,
    name: "Kit Celebrate Life Desodorante Colônia 100ml e 6 Body Splashes",
    image: "https://wepink.vtexassets.com/arquivos/ids/161747/159932-1600-auto.webp",
    badge: "76% OFF",
    badgeType: "off",
    originalPrice: "R$ 199,90",
    price: "R$ 47,90",
    priceValue: 47.9,
    btnLabel: "COMPRAR",
    description: null,
  },
  {
    id: 16,
    name: "Ember Divinus Desodorante Colônia 100ml - Wepink",
    image: "https://wepink.vtexassets.com/arquivos/ids/163381/Prancheta-3--1-.webp",
    badge: "62% OFF",
    badgeType: "off",
    originalPrice: "R$ 99,90",
    price: "R$ 37,90",
    priceValue: 37.9,
    btnLabel: "COMPRAR",
    description: null,
  },
];

function formatPrice(value: number) {
  return "R$ " + value.toFixed(2).replace(".", ",");
}

function useCountdown(targetSeconds: number) {
  const [remaining, setRemaining] = useState(targetSeconds);
  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  const hours = Math.floor(remaining / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  const seconds = remaining % 60;
  return { hours, minutes, seconds };
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex">
        {String(value)
          .padStart(2, "0")
          .split("")
          .map((digit, i) => (
            <div
              key={i}
              className="w-10 h-14 md:w-14 md:h-20 bg-black text-white flex items-center justify-center text-3xl md:text-5xl font-bold rounded-sm mx-0.5"
              data-testid={`countdown-digit-${label}-${i}`}
            >
              {digit}
            </div>
          ))}
      </div>
      <span className="text-xs md:text-sm text-gray-700 mt-1 font-semibold uppercase tracking-wide">
        {label}
      </span>
    </div>
  );
}

function ProductCard({
  product,
  onBuy,
}: {
  product: CartProduct;
  onBuy: (product: CartProduct) => void;
}) {
  return (
    <div
      className="flex flex-col bg-white border border-gray-200 rounded-sm overflow-hidden group cursor-pointer"
      data-testid={`card-product-${product.id}`}
    >
      <div className="relative overflow-hidden">
        {product.badge && (
          <span
            className={`absolute top-2 left-2 z-10 text-white text-xs font-bold px-2 py-1 rounded-sm ${
              product.badgeType === "exclusive" ? "bg-black" : "bg-[#FF0080]"
            }`}
            data-testid={`badge-product-${product.id}`}
          >
            {product.badge}
          </span>
        )}
        <img
          src={product.image}
          alt={product.name}
          className="w-full object-cover transition-transform duration-300 group-hover:scale-105"
          style={{ aspectRatio: "1/1" }}
          loading="lazy"
        />
      </div>

      <div className="flex flex-col flex-1 p-4 gap-2">
        <h3
          className="text-sm font-semibold text-gray-800 leading-snug"
          data-testid={`text-product-name-${product.id}`}
        >
          {product.name}
        </h3>

        {product.description && (
          <p className="text-xs text-gray-500 leading-snug">{product.description}</p>
        )}

        <div className="mt-auto pt-2">
          {product.originalPrice && (
            <p
              className="text-xs text-gray-400 line-through"
              data-testid={`text-original-price-${product.id}`}
            >
              De {product.originalPrice}
            </p>
          )}
          <p
            className="text-lg font-bold text-gray-900"
            data-testid={`text-price-${product.id}`}
          >
            {product.price}
          </p>
        </div>

        <button
          className="w-full bg-[#FF0080] hover:bg-[#e6006f] active:bg-[#cc005f] text-white font-bold text-sm py-3 rounded-sm transition-colors duration-150 tracking-wider mt-1"
          data-testid={`button-buy-${product.id}`}
          onClick={() => onBuy(product)}
        >
          {product.btnLabel}
        </button>
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-6 relative"
      style={{ fontFamily: "Montserrat, sans-serif" }}
    >
      {children}
      <span className="block w-12 h-1 bg-[#FF0080] mt-2 rounded-full" />
    </h2>
  );
}

function CartDrawer({
  open,
  onClose,
  onCheckout,
}: {
  open: boolean;
  onClose: () => void;
  onCheckout: () => void;
}) {
  const { items, changeQty, total } = useCart();

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-[200] flex justify-end">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={onClose}
            data-testid="overlay-cart"
          />
          <div
            className="relative flex flex-col bg-white h-full shadow-2xl z-10 w-full max-w-sm md:max-w-md"
            data-testid="cart-drawer"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            {/* Cart Header */}
            <div className="flex items-center justify-between px-5 py-4 bg-[#FF0080]">
              <div className="flex items-center gap-2">
                <ShoppingCart size={20} className="text-white" />
                <span className="text-white font-extrabold text-lg tracking-wide">
                  Seu Carrinho
                </span>
              </div>
              <button
                onClick={onClose}
                className="text-white font-bold text-2xl leading-none hover:opacity-80 transition-opacity"
                data-testid="button-cart-close"
                aria-label="Fechar carrinho"
              >
                ×
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                  <ShoppingCart size={40} className="mb-3 opacity-30" />
                  <p className="text-sm font-semibold">Seu carrinho está vazio</p>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 px-5 py-4"
                    data-testid={`cart-item-${item.id}`}
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-sm flex-shrink-0 border border-gray-100"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800 leading-snug line-clamp-2">
                        {item.name}
                      </p>
                      {item.originalPrice && (
                        <p className="text-xs text-gray-400 line-through mt-0.5">
                          {item.originalPrice}
                        </p>
                      )}
                      <p className="text-sm font-extrabold text-[#FF0080] mt-0.5">
                        {formatPrice(item.priceValue)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        className="w-7 h-7 rounded-full bg-[#FF0080] text-white flex items-center justify-center hover:bg-[#e6006f] active:bg-[#cc005f] transition-colors"
                        onClick={() => changeQty(item.id, -1)}
                        data-testid={`button-qty-minus-${item.id}`}
                        aria-label="Diminuir quantidade"
                      >
                        <Minus size={12} strokeWidth={3} />
                      </button>
                      <span
                        className="text-sm font-bold text-gray-800 w-5 text-center"
                        data-testid={`text-qty-${item.id}`}
                      >
                        {item.qty}
                      </span>
                      <button
                        className="w-7 h-7 rounded-full bg-[#FF0080] text-white flex items-center justify-center hover:bg-[#e6006f] active:bg-[#cc005f] transition-colors"
                        onClick={() => changeQty(item.id, 1)}
                        data-testid={`button-qty-plus-${item.id}`}
                        aria-label="Aumentar quantidade"
                      >
                        <Plus size={12} strokeWidth={3} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Cart Footer */}
            <div className="border-t border-gray-200 px-5 pt-4 pb-5 bg-white">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">Entrega:</span>
                <span className="text-sm font-extrabold text-[#FF0080]">Grátis</span>
              </div>
              <div className="flex items-center justify-between mb-5">
                <span className="text-sm font-semibold text-gray-700">Total:</span>
                <span
                  className="text-lg font-extrabold text-[#FF0080]"
                  data-testid="text-cart-total"
                >
                  {formatPrice(total)}
                </span>
              </div>

              <div className="flex gap-3">
                <button
                  className="flex-1 border-2 border-[#FF0080] text-[#FF0080] font-extrabold text-sm py-3 rounded-sm hover:bg-pink-50 active:bg-pink-100 transition-colors tracking-wide"
                  onClick={onClose}
                  data-testid="button-continue-shopping"
                >
                  Continuar<br />Comprando
                </button>
                <button
                  className="flex-1 bg-[#FF0080] text-white font-extrabold text-sm py-3 rounded-sm hover:bg-[#e6006f] active:bg-[#cc005f] transition-colors tracking-wide"
                  data-testid="button-checkout"
                  onClick={onCheckout}
                >
                  Finalizar Compra
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function Home() {
  const [, navigate] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const { items, addItem, totalItems } = useCart();
  const { hours, minutes, seconds } = useCountdown(30 * 60);

  function handleBuy(product: CartProduct) {
    addItem(product);
    setCartOpen(true);
  }

  function handleCheckout() {
    setCartOpen(false);
    navigate("/checkout");
  }

  return (
    <div className="min-h-screen bg-white font-sans" style={{ fontFamily: "Montserrat, sans-serif" }}>
      {/* Header */}
      <header className="bg-[#FF0080] sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 h-12 md:h-14">
          <button
            className="text-white p-1"
            onClick={() => setMenuOpen(true)}
            data-testid="button-menu-open"
            aria-label="Abrir menu"
          >
            <Menu size={24} />
          </button>

          <a href="/" className="flex items-center" data-testid="link-logo">
            <span style={{color:"white",fontWeight:900,fontSize:"1.3rem",letterSpacing:"0.05em",fontFamily:"Montserrat,sans-serif"}}>we<span style={{color:"#FF80BF"}}>♥</span></span>
          </a>

          <button
            className="text-white p-1 relative"
            data-testid="button-cart"
            aria-label="Carrinho"
            onClick={() => setCartOpen(true)}
          >
            <ShoppingCart size={22} />
            {totalItems > 0 && (
              <span
                className="absolute -top-1 -right-1 bg-white text-[#FF0080] text-[10px] font-extrabold rounded-full w-4 h-4 flex items-center justify-center"
                data-testid="badge-cart-count"
              >
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Sidebar / Drawer Menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-[100] flex">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMenuOpen(false)}
            data-testid="overlay-menu"
          />
          <div className="relative w-72 bg-white h-full shadow-xl flex flex-col z-10 overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <span className="text-[#FF0080] font-extrabold text-xl tracking-widest uppercase">
                × wepink
              </span>
              <button
                onClick={() => setMenuOpen(false)}
                className="text-gray-500 p-1"
                data-testid="button-menu-close"
              >
                <X size={22} />
              </button>
            </div>

            <nav className="flex-1 p-4">
              <div className="mb-6">
                <span style={{color:"#FF0080",fontWeight:900,fontSize:"1.5rem",letterSpacing:"0.05em",fontFamily:"Montserrat,sans-serif",display:"block",marginBottom:"1.5rem"}}>we<span style={{color:"#FF0080"}}>♥</span></span>

                {[
                  { label: "Minha conta", icon: User },
                  { label: "Trocar e Devolver", icon: RefreshCcw },
                  { label: "Rastreio", icon: Package },
                  { label: "Nossas Lojas", icon: MapPin },
                ].map(({ label, icon: Icon }) => (
                  <a
                    key={label}
                    href="#"
                    className="flex items-center gap-3 py-3 border-b border-gray-100 text-sm text-gray-700 font-semibold hover:text-[#FF0080] transition-colors"
                    data-testid={`link-menu-${label.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    <Icon size={16} className="text-[#FF0080]" />
                    {label}
                  </a>
                ))}
              </div>

              <div className="mt-4">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-3">
                  Produtos
                </p>
                {["Ver todos os produtos", "Kits", "Body Splash", "Perfumaria"].map((item) => (
                  <a
                    key={item}
                    href="#"
                    className="flex items-center justify-between py-3 border-b border-gray-100 text-sm text-gray-700 font-semibold hover:text-[#FF0080] transition-colors"
                    data-testid={`link-category-${item.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    {item}
                    <ChevronRight size={14} className="text-gray-400" />
                  </a>
                ))}
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* Cart Drawer */}
      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        onCheckout={handleCheckout}
      />

      {/* Hero Banner */}
      <section className="w-full" data-testid="section-hero">
        <img
          src="https://wepink.vtexassets.com/assets/vtex.file-manager-graphql/images/bc7f3f98-2edf-47d5-8b0a-1176463dbc44___670ba5d91440ab3cfc3bc22bca21157b.gif"
          alt="Promoção Especial WePink"
          className="w-full block"
          style={{ display: "block", maxWidth: "100%", height: "auto" }}
        />
      </section>

      {/* Countdown */}
      <section className="bg-white py-8 px-4" data-testid="section-countdown">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-lg md:text-xl font-extrabold text-gray-900 mb-6 uppercase tracking-wide">
            A PROMOÇÃO ACABA EM:
          </h2>
          <div className="flex items-start justify-center gap-4 md:gap-8">
            <CountdownUnit value={hours} label="Horas" />
            <div className="text-4xl md:text-6xl font-bold text-gray-800 mt-3">:</div>
            <CountdownUnit value={minutes} label="Minutos" />
            <div className="text-4xl md:text-6xl font-bold text-gray-800 mt-3">:</div>
            <CountdownUnit value={seconds} label="Segundos" />
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 pb-16">
        {/* Kits Section */}
        <section className="mb-16" data-testid="section-kits">
          <SectionTitle>Kits</SectionTitle>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {KITS.map((product) => (
              <ProductCard key={product.id} product={product} onBuy={handleBuy} />
            ))}
          </div>
        </section>

        {/* Body Splash Section */}
        <section className="mb-16" data-testid="section-body-splash">
          <div className="flex items-center gap-4 mb-6">
            <h2
              className="text-2xl md:text-3xl font-extrabold text-gray-900 relative"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              Body Splash
              <span className="block w-12 h-1 bg-[#FF0080] mt-2 rounded-full" />
            </h2>
            <span className="bg-[#FF0080] text-white font-extrabold text-sm px-3 py-1.5 rounded-sm tracking-wide self-start mt-1">
              79% OFF
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {BODY_SPLASH.map((product) => (
              <ProductCard key={product.id} product={product} onBuy={handleBuy} />
            ))}
          </div>
        </section>

        {/* Perfumaria Section */}
        <section className="mb-16" data-testid="section-perfumaria">
          <SectionTitle>Perfumaria</SectionTitle>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {PERFUMARIA.map((product) => (
              <ProductCard key={product.id} product={product} onBuy={handleBuy} />
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#FF0080] py-6 text-center">
        <p className="text-white text-xs font-semibold tracking-widest uppercase opacity-80">
          © {new Date().getFullYear()} Wepink. Todos os direitos reservados.
        </p>
      </footer>
    </div>
  );
}

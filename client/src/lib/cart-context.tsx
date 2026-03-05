import { createContext, useContext, useState } from "react";

export type CartProduct = {
  id: number;
  name: string;
  image: string;
  originalPrice: string | null;
  price: string;
  priceValue: number;
  badge: string | null;
  badgeType: string;
  btnLabel: string;
  description: string | null;
};

export type CartItem = CartProduct & { qty: number };

type CartContextType = {
  items: CartItem[];
  addItem: (product: CartProduct) => void;
  changeQty: (id: number, delta: number) => void;
  clearCart: () => void;
  total: number;
  totalItems: number;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  function addItem(product: CartProduct) {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  }

  function changeQty(id: number, delta: number) {
    setItems((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, qty: i.qty + delta } : i))
        .filter((i) => i.qty > 0)
    );
  }

  function clearCart() {
    setItems([]);
  }

  const total = items.reduce((sum, i) => sum + i.priceValue * i.qty, 0);
  const totalItems = items.reduce((sum, i) => sum + i.qty, 0);

  return (
    <CartContext.Provider value={{ items, addItem, changeQty, clearCart, total, totalItems }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be inside CartProvider");
  return ctx;
}

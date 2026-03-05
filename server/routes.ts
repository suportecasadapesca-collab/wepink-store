import type { Express } from "express";
import { createServer, type Server } from "http";

const KOREPAY_URL = "https://api.korepay.com.br/v1/transactions";
const UTMIFY_URL = "https://api.utmify.com.br/api-credentials/orders";

function korepayAuth() {
  const pub = process.env.KOREPAY_PUBLIC_KEY ?? "";
  const sec = process.env.KOREPAY_SECRET_KEY ?? "";
  return "Basic " + Buffer.from(`${pub}:${sec}`).toString("base64");
}

function nowBR() {
  return new Date().toISOString().replace("T", " ").slice(0, 19);
}

async function notifyUtmify(payload: {
  orderId: string;
  totalInCents: number;
  customer: { name: string; email: string; phone: string; document: string };
  items: Array<{ description: string; amount: number; quantity: number }>;
  utm: Record<string, string>;
}) {
  const token = process.env.UTMIFY_API_TOKEN;
  if (!token) return;

  const body = {
    orderId: String(payload.orderId),
    platform: "custom",
    paymentMethod: "pix",
    status: "waiting_payment",
    createdAt: nowBR(),
    approvedDate: null,
    refundedAt: null,
    customer: {
      name: payload.customer.name,
      email: payload.customer.email,
      phone: payload.customer.phone.replace(/\D/g, ""),
      document: payload.customer.document.replace(/\D/g, ""),
    },
    products: payload.items.map((i) => ({
      id: i.description.toLowerCase().replace(/\s+/g, "-").slice(0, 30),
      name: i.description,
      planId: null,
      planName: null,
      quantity: i.quantity,
      priceInCents: i.amount,
    })),
    trackingParameters: {
      utm_source: payload.utm.utm_source || null,
      utm_medium: payload.utm.utm_medium || null,
      utm_campaign: payload.utm.utm_campaign || null,
      utm_content: payload.utm.utm_content || null,
      utm_term: payload.utm.utm_term || null,
      src: payload.utm.src || null,
    },
    commission: {
      totalPriceInCents: payload.totalInCents,
      gatewayFeeInCents: 0,
      userCommissionInCents: payload.totalInCents,
    },
    isTest: false,
  };

  try {
    const res = await fetch(UTMIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-token": token },
      body: JSON.stringify(body),
    });
    const data = await res.json() as any;
    console.log("[utmify] status:", res.status, "| response:", JSON.stringify(data));
  } catch (err) {
    console.error("[utmify] error:", err);
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.post("/api/pix/create", async (req, res) => {
    try {
      const { customer, items, address, utm = {} } = req.body as {
        customer: {
          name: string;
          email: string;
          document: string;
          phone: string;
        };
        items: Array<{
          description: string;
          amount: number;
          quantity: number;
        }>;
        address: {
          street: string;
          number: string;
          complement?: string;
          neighborhood: string;
          city: string;
          state: string;
          zip_code: string;
        };
        utm: Record<string, string>;
      };

      const totalAmount = items.reduce(
        (sum, i) => sum + i.amount * i.quantity,
        0
      );

      const payload = {
        amount: totalAmount,
        paymentMethod: "pix",
        pix: { expiresInSeconds: 1800 },
        items: items.map((i) => ({
          title: i.description,
          unitPrice: i.amount,
          quantity: i.quantity,
          tangible: true,
        })),
        customer: {
          name: customer.name,
          email: customer.email,
          document: {
            type: "cpf",
            number: customer.document.replace(/\D/g, ""),
          },
          phone: customer.phone.replace(/\D/g, ""),
        },
        shipping: {
          name: customer.name,
          fee: 0,
          address: {
            street: address.street,
            streetNumber: address.number,
            complement: address.complement || "",
            neighborhood: address.neighborhood,
            city: address.city,
            state: address.state,
            zipCode: address.zip_code.replace(/\D/g, ""),
            country: "BR",
          },
        },
      };

      console.log("[korepay] sending payload:", JSON.stringify(payload));

      const response = await fetch(KOREPAY_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: korepayAuth(),
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json() as any;
      console.log("[korepay] response status:", response.status);
      console.log("[korepay] response body:", JSON.stringify(data));

      if (!response.ok) {
        return res.status(response.status).json({
          error: data.message ?? data.error ?? "Erro ao criar transação PIX",
          details: data,
        });
      }

      const pix = data.pix ?? {};
      const qrCodeString = pix.qrcode ?? null;
      const qrCodeUrl = qrCodeString
        ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeString)}`
        : null;

      notifyUtmify({
        orderId: String(data.id),
        totalInCents: totalAmount,
        customer,
        items,
        utm,
      });

      return res.json({
        transactionId: data.id,
        status: data.status,
        qrCode: qrCodeString,
        qrCodeUrl,
        expiresAt: pix.expirationDate ?? null,
        amount: data.amount,
      });
    } catch (err: any) {
      console.error("[korepay] unexpected error:", err);
      return res.status(500).json({ error: "Erro interno ao gerar PIX" });
    }
  });

  return httpServer;
}

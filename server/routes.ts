import type { Express } from "express";
import { createServer, type Server } from "http";

const KOREPAY_URL = "https://api.korepay.com.br/v1/transactions";

function korepayAuth() {
  const pub = process.env.KOREPAY_PUBLIC_KEY ?? "";
  const sec = process.env.KOREPAY_SECRET_KEY ?? "";
  return "Basic " + Buffer.from(`${pub}:${sec}`).toString("base64");
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Create a PIX transaction via KorePay
  app.post("/api/pix/create", async (req, res) => {
    try {
      const { customer, items, address } = req.body as {
        customer: {
          name: string;
          email: string;
          document: string;
          phone: string;
        };
        items: Array<{
          description: string;
          amount: number; // centavos
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
      };

      // Total amount in centavos
      const totalAmount = items.reduce(
        (sum, i) => sum + i.amount * i.quantity,
        0
      );

      const payload = {
        amount: totalAmount,
        paymentMethod: "pix",
        pix: {
          expiresInSeconds: 1800,
        },
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
      // Generate a QR code image URL using a free API
      const qrCodeUrl = qrCodeString
        ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeString)}`
        : null;

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

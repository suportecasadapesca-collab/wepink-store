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

async function notifyUtmify({ orderId, totalInCents, customer, items, utm }) {
  const token = process.env.UTMIFY_API_TOKEN;
  if (!token) return;

  const body = {
    orderId: String(orderId),
    platform: "custom",
    paymentMethod: "pix",
    status: "waiting_payment",
    createdAt: nowBR(),
    approvedDate: null,
    refundedAt: null,
    customer: {
      name: customer.name,
      email: customer.email,
      phone: customer.phone.replace(/\D/g, ""),
      document: customer.document.replace(/\D/g, ""),
    },
    products: items.map((i) => ({
      id: i.description.toLowerCase().replace(/\s+/g, "-").slice(0, 30),
      name: i.description,
      planId: null,
      planName: null,
      quantity: i.quantity,
      priceInCents: i.amount,
    })),
    trackingParameters: {
      utm_source: utm.utm_source || null,
      utm_medium: utm.utm_medium || null,
      utm_campaign: utm.utm_campaign || null,
      utm_content: utm.utm_content || null,
      utm_term: utm.utm_term || null,
      src: utm.src || null,
    },
    commission: {
      totalPriceInCents: totalInCents,
      gatewayFeeInCents: 0,
      userCommissionInCents: totalInCents,
    },
    isTest: false,
  };

  try {
    const res = await fetch(UTMIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-token": token },
      body: JSON.stringify(body),
    });
    console.log("[utmify] status:", res.status);
  } catch (err) {
    console.error("[utmify] error:", err);
  }
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: CORS_HEADERS, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const { customer, items, address, utm = {} } = JSON.parse(event.body ?? "{}");

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

    const response = await fetch(KOREPAY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: korepayAuth(),
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        statusCode: response.status,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          error: data.message ?? data.error ?? "Erro ao criar transação PIX",
          details: data,
        }),
      };
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

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        transactionId: data.id,
        status: data.status,
        qrCode: qrCodeString,
        qrCodeUrl,
        expiresAt: pix.expirationDate ?? null,
        amount: data.amount,
      }),
    };
  } catch (err) {
    console.error("[pix-create] error:", err);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: "Erro interno ao gerar PIX" }),
    };
  }
};

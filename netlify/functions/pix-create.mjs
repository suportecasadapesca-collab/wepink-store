const KOREPAY_URL = "https://api.korepay.com.br/v1/transactions";

function korepayAuth() {
  const pub = process.env.KOREPAY_PUBLIC_KEY ?? "";
  const sec = process.env.KOREPAY_SECRET_KEY ?? "";
  return "Basic " + Buffer.from(`${pub}:${sec}`).toString("base64");
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
    const { customer, items, address } = JSON.parse(event.body ?? "{}");

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

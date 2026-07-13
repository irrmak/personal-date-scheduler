export async function sendApprovalEmail({
  to,
  requesterName,
  requestDate,
  requestTime,
}: {
  to: string;
  requesterName: string;
  requestDate: string | null;
  requestTime: string | null;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.MAIL_FROM || "onboarding@resend.dev";

  if (!apiKey) {
    console.error("RESEND_API_KEY is missing.");
    return {
      success: false,
      error: "RESEND_API_KEY is missing.",
    };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject: "Planlama talebin onaylandı",
      text: `Merhaba ${requesterName},

Planlama talebin onaylandı.

Tarih: ${requestDate || "-"}
Saat: ${requestTime || "-"}

Görüşmek üzere.`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Planlama talebin onaylandı</h2>
          <p>Merhaba ${requesterName},</p>
          <p>Planlama talebin onaylandı.</p>
          <p><strong>Tarih:</strong> ${requestDate || "-"}</p>
          <p><strong>Saat:</strong> ${requestTime || "-"}</p>
          <p>Görüşmek üzere.</p>
        </div>
      `,
    }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    console.error("Resend email failed:", data);
    return {
      success: false,
      error: data,
    };
  }

  console.log("Resend email sent:", data);

  return {
    success: true,
    data,
  };
}

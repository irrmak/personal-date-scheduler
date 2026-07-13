type SendApprovalEmailParams = {
  to: string;
  requesterName: string;
  requestDate: string | null;
  requestTime: string | null;
};

export async function sendApprovalEmail({
  to,
  requesterName,
  requestDate,
  requestTime,
}: SendApprovalEmailParams) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.MAIL_FROM;

  if (!apiKey || !from) {
    console.warn("Resend environment variables are missing. Email skipped.");
    return;
  }

  const dateText = formatDateText(requestDate);
  const timeText = requestTime || "Saat bilgisi yok";
  const name = requesterName || "Merhaba";
  const text = [
    `Merhaba ${name},`,
    "",
    "Planlama talebin onaylandı.",
    `Tarih: ${dateText}`,
    `Saat: ${timeText}`,
    "",
    "Görüşmek üzere.",
  ].join("\n");

  const html = `
    <div style="font-family: Arial, sans-serif; color: #4A343B; line-height: 1.6;">
      <h2 style="color: #C75F86;">Planlama talebin onaylandı</h2>
      <p>Merhaba ${escapeHtml(name)},</p>
      <p>Planlama talebin onaylandı.</p>
      <p><strong>Tarih:</strong> ${escapeHtml(dateText)}</p>
      <p><strong>Saat:</strong> ${escapeHtml(timeText)}</p>
      <p>Görüşmek üzere.</p>
    </div>
  `;

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
      text,
      html,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Approval email could not be sent.");
  }
}

function formatDateText(date: string | null) {
  if (!date) {
    return "Tarih bilgisi yok";
  }

  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    weekday: "long",
  }).format(new Date(`${date}T12:00:00`));
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

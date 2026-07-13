import { createRequire } from "node:module";

type SendApprovalEmailParams = {
  to: string;
  requesterName: string;
  requestDate: string | null;
  requestTime: string | null;
};

type MailOptions = {
  from: string;
  to: string;
  subject: string;
  text: string;
  html: string;
};

type SmtpOptions = {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
};

type NodemailerModule = {
  createTransport: (options: SmtpOptions) => {
    sendMail: (options: MailOptions) => Promise<unknown>;
  };
};

const require = createRequire(import.meta.url);
const nodemailer = require("nodemailer") as NodemailerModule;

export async function sendApprovalEmail({
  to,
  requesterName,
  requestDate,
  requestTime,
}: SendApprovalEmailParams) {
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const from = process.env.MAIL_FROM || smtpUser;

  if (!smtpUser || !smtpPass || !from) {
    console.error("SMTP email environment variables are missing.");
    return {
      success: false,
      error: "SMTP email environment variables are missing.",
    };
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  const mail = {
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
  };

  try {
    const data = await transporter.sendMail(mail);
    console.log("SMTP email sent:", data);

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("SMTP email failed:", error);

    return {
      success: false,
      error,
    };
  }
}

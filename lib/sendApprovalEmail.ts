import { createRequire } from "node:module";

type SendApprovalEmailParams = {
  to: string;
  requesterName: string;
  requestDate: string | null;
  requestTime: string | null;
};

type EmailJsModule = {
  send: (
    serviceId: string,
    templateId: string,
    templateParams: Record<string, string>,
    options: {
      publicKey: string;
      privateKey: string;
    }
  ) => Promise<unknown>;
};

const require = createRequire(import.meta.url);
const emailjs = require("@emailjs/nodejs") as EmailJsModule;

export async function sendApprovalEmail({
  to,
  requesterName,
  requestDate,
  requestTime,
}: SendApprovalEmailParams) {
  const serviceId = process.env.EMAILJS_SERVICE_ID;
  const templateId = process.env.EMAILJS_TEMPLATE_ID;
  const publicKey = process.env.EMAILJS_PUBLIC_KEY;
  const privateKey = process.env.EMAILJS_PRIVATE_KEY;

  if (!serviceId || !templateId || !publicKey || !privateKey) {
    console.error("EmailJS environment variables are missing.");
    return {
      success: false,
      error: "EmailJS environment variables are missing.",
    };
  }

  try {
    const data = await emailjs.send(
      serviceId,
      templateId,
      {
        to_email: to,
        requester_name: requesterName,
        request_date: requestDate || "-",
        request_time: requestTime || "-",
      },
      {
        publicKey,
        privateKey,
      }
    );

    console.log("EmailJS email sent:", data);

    return {
      success: true,
      data,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : JSON.stringify(error);

    console.error("EmailJS email failed:", errorMessage);

    return {
      success: false,
      error: errorMessage,
    };
  }
}

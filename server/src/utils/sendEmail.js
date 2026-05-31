import nodemailer from "nodemailer";

const hasApiProvider = () => process.env.EMAIL_PROVIDER_URL && process.env.EMAIL_PROVIDER_API_KEY;

const hasSmtpProvider = () =>
  process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS;

const sendWithApiProvider = async ({ to, subject, html }) => {
  const response = await fetch(process.env.EMAIL_PROVIDER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.EMAIL_PROVIDER_API_KEY}`
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html
    })
  });

  if (!response.ok) {
    const error = new Error("Email provider rejected the message");
    error.statusCode = 502;
    throw error;
  }
};

const sendWithSmtpProvider = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === "true",
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.SMTP_USER,
    to,
    subject,
    html
  });
};

export const sendEmail = async ({ to, subject, html }) => {
  if (hasApiProvider()) {
    await sendWithApiProvider({ to, subject, html });
    return;
  }

  if (hasSmtpProvider()) {
    await sendWithSmtpProvider({ to, subject, html });
    return;
  }

  console.log(
    `[email skipped] Missing EMAIL_PROVIDER_URL/API_KEY or SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS. ${subject} -> ${to}`
  );
};

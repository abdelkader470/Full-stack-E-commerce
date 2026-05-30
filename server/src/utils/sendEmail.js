export const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.EMAIL_PROVIDER_URL || !process.env.EMAIL_PROVIDER_API_KEY) {
    console.log(`[email skipped] ${subject} -> ${to}`);
    return;
  }

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

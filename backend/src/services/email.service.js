import nodemailer from "nodemailer";

import env from "../config/env.js";

function createEmailTransporter() {
  if (!env.smtpHost) {
    const error = new Error("SMTP host is not configured.");
    error.statusCode = 500;

    throw error;
  }

  if (!env.smtpUser) {
    const error = new Error("SMTP user is not configured.");
    error.statusCode = 500;

    throw error;
  }

  if (!env.smtpPassword) {
    const error = new Error("SMTP password is not configured.");
    error.statusCode = 500;

    throw error;
  }

  return nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpSecure,
    auth: {
      user: env.smtpUser,
      pass: env.smtpPassword
    }
  });
}

async function sendEmail(payload) {
  const transporter = createEmailTransporter();

  await transporter.sendMail({
    from: env.smtpFrom,
    to: payload.to,
    subject: payload.subject,
    text: payload.text,
    html: payload.html
  });
}

export {
  sendEmail
};

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

function buildEmailVerificationUrl(token) {
  return env.frontendUrl + "/verify-email?token=" + token;
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

async function sendEmailVerificationEmail(payload) {
  const verificationUrl = buildEmailVerificationUrl(payload.token);

  await sendEmail({
    to: payload.email,
    subject: "Verify your JobTrace account",
    text:
      "Welcome to JobTrace.\n\n" +
      "Please verify your email address by opening this link:\n" +
      verificationUrl + "\n\n" +
      "This link will expire in 24 hours.\n\n" +
      "If you did not create a JobTrace account, you can ignore this email.",
    html:
      "<p>Welcome to JobTrace.</p>" +
      "<p>Please verify your email address by opening this link:</p>" +
      "<p><a href=\"" + verificationUrl + "\">Verify your email address</a></p>" +
      "<p>This link will expire in 24 hours.</p>" +
      "<p>If you did not create a JobTrace account, you can ignore this email.</p>"
  });
}

export {
  sendEmail,
  sendEmailVerificationEmail
};

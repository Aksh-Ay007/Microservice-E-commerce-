import nodemailer from "nodemailer";
import dotenv from "dotenv";
import ejs from "ejs";
import path from "path";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: Number(process.env.SMTP_PORT) === 465, // true for port 465, false for 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false, // allows self-signed certs during local dev
  },
});

export const renderEmailTemplate = async (
  templateName: string,
  data: Record<string, any>
): Promise<string> => {
  const templatePath = path.join(
    process.cwd(),
    "apps",
    "order-service",
    "src",
    "utils",
    "email-templates",
    `${templateName}.ejs`
  );
  return await ejs.renderFile(templatePath, data);
};

export const sendEmail = async (
  to: string,
  subject: string,
  templateName: string,
  data: Record<string, any>
) => {
  try {
    console.log("📧 [Email] Preparing email...");
    console.log(`   To: ${to}`);
    console.log(`   Subject: ${subject}`);
    console.log(`   Template: ${templateName}`);

    console.log("🟡 [Email] Rendering template...");
    const html = await renderEmailTemplate(templateName, data);
    console.log("✅ Template rendered successfully.");

    console.log("🚀 [Email] Sending...");
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject,
      html,
    });

    console.log(`✅ [Email] Sent successfully to ${to}`);
    return true;
  } catch (error) {
    console.error(`❌ [Email] Failed to send to ${to}:`, error);
    return false;
  }
};

import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export interface MailAttachment {
  filename: string;
  content: Buffer | string;
  contentType?: string;
}

export async function sendMail({
  to,
  cc,
  bcc,
  subject,
  html,
  attachments,
}: {
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  subject: string;
  html: string;
  attachments?: MailAttachment[];
}) {
  return transporter.sendMail({
    from: `"DOT. OperatingSpace" <${process.env.GMAIL_USER}>`,
    to: Array.isArray(to) ? to.join(", ") : to,
    cc: cc ? (Array.isArray(cc) ? cc.join(", ") : cc) : undefined,
    bcc: bcc ? (Array.isArray(bcc) ? bcc.join(", ") : bcc) : undefined,
    subject,
    html,
    attachments,
  });
}

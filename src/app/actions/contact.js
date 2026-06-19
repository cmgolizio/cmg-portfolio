"use server";

import { Resend } from "resend";

// Where a submitted message lands, and who it's sent as.
//  - CONTACT_TO defaults to the site owner.
//  - CONTACT_FROM defaults to Resend's shared onboarding sender, which delivers
//    to the account owner with no domain setup. For production, point it at a
//    verified-domain sender, e.g. "Christopher Golizio <hi@yourdomain.com>".
const TO = process.env.CONTACT_TO || "cmgolizio@gmail.com";
const FROM = process.env.CONTACT_FROM || "Portfolio <onboarding@resend.dev>";

const MAX = { name: 100, email: 200, message: 4000 };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// What useActionState holds on the client. `values` echoes the input back so a
// rejected submit never wipes what the visitor typed; `errors` is keyed by
// field; `message` is a form-level note (config/transport problems).
function reject(values, errors, message = null) {
  return { ok: false, errors, values, message, sentName: "" };
}

const cleared = { name: "", email: "", message: "" };

export async function sendContactMessage(_prev, formData) {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const message = String(formData.get("message") || "").trim();
  // Honeypot: a field hidden from people but not from bots. If it's filled we
  // report success without sending, so the bot learns nothing.
  const trap = String(formData.get("company") || "");

  if (trap)
    return {
      ok: true,
      errors: {},
      values: cleared,
      message: null,
      sentName: "",
    };

  const values = { name, email, message };
  const errors = {};
  if (!name) errors.name = "Tell me who you are.";
  else if (name.length > MAX.name) errors.name = "That name is a little long.";
  if (!email) errors.email = "I need an address to reply to.";
  else if (email.length > MAX.email || !EMAIL_RE.test(email))
    errors.email = "That email doesn't look right.";
  if (!message)
    errors.message = "Add a line or two about what you have in mind.";
  else if (message.length > MAX.message)
    errors.message = "That's a lot — trim it down a touch.";

  if (Object.keys(errors).length) return reject(values, errors);

  if (!process.env.RESEND_API_KEY) {
    // A misconfiguration, not the visitor's mistake — never pretend it sent.
    return reject(
      values,
      {},
      `Email isn't wired up yet — reach me directly at ${TO}.`,
    );
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: FROM,
      to: [TO],
      replyTo: email,
      subject: `Portfolio message from ${name}`,
      text: `${message}\n\n— ${name} <${email}>`,
    });
    if (error) throw new Error(error.message || "Resend rejected the send");
  } catch (err) {
    console.error("[contact] send failed:", err);
    return reject(
      values,
      {},
      `Something went wrong sending that — try again, or email me at ${TO}.`,
    );
  }

  return {
    ok: true,
    errors: {},
    values: cleared,
    message: null,
    sentName: name,
  };
}

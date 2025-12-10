"use client";

import { useState } from "react";

export default function ContactForm() {
  const [status, setStatus] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("loading");

    const form = new FormData(e.target);

    const res = await fetch("/api/contact", {
      method: "POST",
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        message: form.get("message"),
      }),
    });

    if (res.ok) {
      setStatus("success");
      e.target.reset();
    } else {
      setStatus("error");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className='space-y-5 rounded-2xl border border-[#D1A954]/30 bg-[#FAF7F2] p-6 shadow-sm'
    >
      <div>
        <label className='text-sm font-medium text-[#1A1A1A]'>Name</label>
        <input
          name='name'
          required
          className='mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#D1A954]'
        />
      </div>

      <div>
        <label className='text-sm font-medium text-[#1A1A1A]'>Email</label>
        <input
          name='email'
          type='email'
          required
          className='mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#D1A954]'
        />
      </div>

      <div>
        <label className='text-sm font-medium text-[#1A1A1A]'>Message</label>
        <textarea
          name='message'
          rows='4'
          required
          className='mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#D1A954]'
        />
      </div>

      <button
        type='submit'
        className='w-full rounded-full bg-[#5A3E2B] px-5 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#FAF7F2] shadow-sm transition hover:bg-[#4A301F]'
      >
        Send Message
      </button>

      {status === "success" && (
        <p className='text-center text-sm text-green-700'>
          Message sent successfully!
        </p>
      )}

      {status === "error" && (
        <p className='text-center text-sm text-red-600'>
          Something went wrong. Please try again.
        </p>
      )}
    </form>
  );
}

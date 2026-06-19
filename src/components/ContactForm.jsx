"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { sendContactMessage } from "@/app/actions/contact";

const INITIAL = {
  ok: false,
  errors: {},
  values: { name: "", email: "", message: "" },
  message: null,
  sentName: "",
};

// Outer shell owns a remount key: "Send another" bumps it to give the inner
// form a fresh useActionState (clearing the success state and the fields).
export default function ContactForm() {
  const [instance, setInstance] = useState(0);
  return (
    <ContactFields key={instance} onReset={() => setInstance((n) => n + 1)} />
  );
}

function ContactFields({ onReset }) {
  const [state, action, pending] = useActionState(sendContactMessage, INITIAL);
  const reduceMotion = useReducedMotion();
  const { values, errors } = state;
  const liveRef = useRef(null);

  // Pull focus to the success note when it appears so it's announced and
  // keyboard users land somewhere sensible.
  useEffect(() => {
    if (state.ok) liveRef.current?.focus();
  }, [state.ok]);

  const fade = reduceMotion
    ? { initial: false, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -8 },
        transition: { duration: 0.22 },
      };

  return (
    <AnimatePresence mode='wait' initial={false}>
      {state.ok ? (
        <motion.div
          key='sent'
          className='contact-sent'
          role='status'
          tabIndex={-1}
          ref={liveRef}
          {...fade}
        >
          <span className='contact-sent-mark' aria-hidden='true'>
            ✓
          </span>
          <p className='contact-sent-title'>
            Thanks{state.sentName ? `, ${state.sentName}` : ""}!
          </p>
          <p className='contact-sent-sub'>I&apos;ll get back to you soon.</p>
          <button type='button' className='btn ghost' onClick={onReset}>
            Send another
          </button>
        </motion.div>
      ) : (
        <motion.form
          key='form'
          className='contact-form'
          action={action}
          noValidate
          {...fade}
        >
          <Field
            id='cf-name'
            name='name'
            label='Name'
            autoComplete='name'
            value={values.name}
            error={errors.name}
            disabled={pending}
            delay='d2'
          />
          <Field
            id='cf-email'
            name='email'
            type='email'
            label='Email'
            autoComplete='email'
            value={values.email}
            error={errors.email}
            disabled={pending}
            delay='d3'
          />
          <Field
            id='cf-message'
            name='message'
            label='Message'
            textarea
            value={values.message}
            error={errors.message}
            disabled={pending}
            delay='d4'
          />

          {/* Honeypot — off-screen, ignored by people, catnip for bots. */}
          <div className='hp' aria-hidden='true'>
            <label htmlFor='cf-company'>Company</label>
            <input
              id='cf-company'
              name='company'
              type='text'
              tabIndex={-1}
              autoComplete='off'
            />
          </div>

          <div className='contact-foot reveal d5'>
            <button type='submit' className='btn primary' disabled={pending}>
              {pending ? "Sending…" : "Send message"}
            </button>
            {state.message && (
              <p className='contact-note' role='alert'>
                {state.message}
              </p>
            )}
          </div>
        </motion.form>
      )}
    </AnimatePresence>
  );
}

function Field({
  id,
  name,
  label,
  type = "text",
  textarea = false,
  autoComplete,
  value,
  error,
  disabled,
  delay,
}) {
  const errId = error ? `${id}-err` : undefined;
  const shared = {
    id,
    name,
    defaultValue: value,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": errId,
    autoComplete,
    disabled,
    required: true,
  };
  return (
    <div className={`field reveal ${delay}`}>
      <label htmlFor={id}>{label}</label>
      {textarea ? (
        <textarea {...shared} rows={5} maxLength={4000} />
      ) : (
        <input
          {...shared}
          type={type}
          maxLength={type === "email" ? 200 : 100}
        />
      )}
      {error && (
        <p className='field-err' id={errId}>
          {error}
        </p>
      )}
    </div>
  );
}

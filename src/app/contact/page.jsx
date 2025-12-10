import ContactForm from "@/components/contact/ContactForm";

export const metadata = {
  title: "Branding Station — Contact | Christopher Golizio",
};

export default function ContactPage() {
  return (
    <div className='mx-auto max-w-md px-4 py-12'>
      <header className='mb-8'>
        <p className='text-xs font-semibold uppercase tracking-[0.25em] text-[#D1A954]'>
          Branding Station
        </p>
        <h1 className='mt-2 text-3xl font-semibold text-[#1A1A1A]'>Contact</h1>
        <p className='mt-2 text-sm text-neutral-700'>
          Have a project, collaboration, or opportunity? Get in touch and let’s
          build something worth keeping.
        </p>
      </header>

      <ContactForm />
    </div>
  );
}

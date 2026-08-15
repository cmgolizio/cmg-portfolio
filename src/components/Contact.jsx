import ContactForm from "@/components/ContactForm";

// The contact section owns the #contact anchor (the footer below is now just
// the sign-off). Heading + lede use the same .sec-head / .reveal language as
// every other section, so it re-skins and re-animates with the theme for free.
export default function Contact() {
  return (
    <section id='contact' className='panel contact'>
      <div className='sec-head reveal d1'>
        <span className='idx'>04</span>
        <h2>Talk to me</h2>
      </div>
      {/* <p className='contact-lede reveal d2'>Talk to me.</p> */}
      <ContactForm />
    </section>
  );
}

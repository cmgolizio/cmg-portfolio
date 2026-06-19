import CopyEmail from "@/components/CopyEmail";

export default function Footer() {
  return (
    <footer>
      <div className='big reveal d1'>Let&apos;s build something.</div>
      <div className='muted reveal d2'>
        <CopyEmail />
        {" · "}
        <a
          href='https://github.com/cmgolizio'
          target='_blank'
          rel='noopener noreferrer'
        >
          github.com/cmgolizio
        </a>
        {" · "}
        <a
          href='https://linkedin.com/in/cmgolizio'
          target='_blank'
          rel='noopener noreferrer'
        >
          linkedin.com/in/cmgolizio
        </a>
      </div>
    </footer>
  );
}

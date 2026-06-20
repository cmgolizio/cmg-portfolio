import Link from "next/link";
import WorkInProgress from "@/components/WorkInProgress";

// The single redirect point for sections of the site that aren't ready yet.
// The copy to show is read from the ?message= query param (searchParams is a
// promise in this Next.js — await before reading), so each not-ready link can
// carry its own message.
export default async function WorkInProgressPage({ searchParams }) {
  const { message } = await searchParams;

  return (
    <main className='wrap' id='app'>
      <article className='case section-pad'>
        <Link href='/#work' className='btn ghost case-back'>
          ← Back
        </Link>
        <WorkInProgress message={message ?? "Coming soon!"} />
      </article>
    </main>
  );
}

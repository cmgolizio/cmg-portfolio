export async function POST(req) {
  try {
    const body = await req.json();

    console.log("New contact submission:", body);

    // Later: Send email / store in DB / notify you

    return Response.json({ ok: true });
  } catch (err) {
    return new Response("Server error", { status: 500 });
  }
}

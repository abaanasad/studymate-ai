import Link from "next/link";
export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-zinc-900 to-black text-white">
      <nav className="flex items-center justify-between px-8 py-6 border-b border-zinc-800">
        <h1 className="text-2xl font-bold">StudyMate AI</h1>

        <button className="rounded-lg border border-zinc-700 px-4 py-2 hover:bg-zinc-800 transition">
          Login
        </button>
      </nav>

      <section className="flex flex-col items-center justify-center text-center px-6 py-24">
        <h1 className="text-6xl font-extrabold">
          Learn Smarter with AI
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-gray-400">
          Your personal AI tutor that explains concepts, summarizes notes,
          generates quizzes, and helps you study faster.
        </p>

        <div className="mt-10 flex gap-4">
          <Link href="/chat">
  <button className="rounded-xl bg-blue-600 px-8 py-4 font-semibold hover:bg-blue-700 transition">
    Start Chatting
  </button>
</Link>

          <button className="rounded-xl border border-zinc-700 px-8 py-4 hover:bg-zinc-800 transition">
            Learn More
          </button>
        </div>
      </section>

      <section className="grid gap-6 px-8 pb-20 md:grid-cols-3">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="text-xl font-bold">📚 AI Tutor</h2>
          <p className="mt-3 text-gray-400">
            Understand difficult concepts in simple language.
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="text-xl font-bold">📄 PDF Summaries</h2>
          <p className="mt-3 text-gray-400">
            Upload notes and get instant summaries.
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="text-xl font-bold">📝 Quiz Generator</h2>
          <p className="mt-3 text-gray-400">
            Create quizzes from any topic in seconds.
          </p>
        </div>
      </section>
    </main>
  );
}
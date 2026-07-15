"use client";
import IntroAnimation from "@/app/components/IntroAnimation";
import StarBackground from "./components/StarBackground";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useRef, useState } from "react";
export default function Home() {
  const router = useRouter();
const [opening, setOpening] = useState(false);
const whooshRef = useRef<HTMLAudioElement | null>(null);

function startChat() {
  setOpening(true);
  if (!whooshRef.current) {
  whooshRef.current = new Audio("/sounds/whoosh.mp3");
}

setTimeout(() => {
  if (whooshRef.current) {
    whooshRef.current.currentTime = 0;
    whooshRef.current.play().catch(() => {});
  }
}, 500);

  setTimeout(() => {
    router.push("/chat");
  }, 3500);
}
  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      <motion.div
  animate={{ opacity: opening ? 0 : 1 }}
  transition={{ duration: 0.4 }}
  className="absolute inset-0"
>
  <StarBackground />
</motion.div>
      <div className="relative z-10">
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
        <motion.button
  onClick={startChat}
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  animate={
    opening
      ? {
          scale: [1, 1.15, 1],
          rotate: [0, -2, 2, 0],
        }
      : {}
  }
  transition={{ duration: 0.8 }}
  className="rounded-xl bg-blue-600 px-8 py-4 font-semibold hover:bg-blue-700"
>
  Start Chatting
</motion.button>

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
      <IntroAnimation visible={opening} />
      </div>
    </main>
  );
  }
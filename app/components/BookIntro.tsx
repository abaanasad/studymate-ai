"use client";

import { motion } from "framer-motion";

export default function BookIntro({ visible }: { visible: boolean }) {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <motion.div
        initial={{ scale: 0.2, rotate: -15, opacity: 0 }}
        animate={{
          scale: [0.2, 1.2, 1],
          rotate: [-15, 0],
          opacity: 1,
        }}
        transition={{ duration: 0.8 }}
        className="relative h-80 w-60"
      >
        {/* Back Cover */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-amber-900 via-yellow-800 to-amber-700 shadow-2xl" />

        {/* Spine */}
        <div className="absolute left-0 top-0 h-full w-4 bg-amber-950 rounded-l-xl" />

        {/* Front Cover */}
        <motion.div
          initial={{ rotateY: 0 }}
          animate={{ rotateY: -150 }}
          transition={{
            delay: 0.5,
            duration: 0.8,
            ease: "easeInOut",
          }}
          style={{
            transformStyle: "preserve-3d",
            transformOrigin: "left center",
          }}
          className="absolute inset-0 rounded-xl bg-gradient-to-br from-yellow-700 via-amber-600 to-yellow-500 border border-yellow-300 flex items-center justify-center"
        >
          <span className="text-6xl">📚</span>
        </motion.div>
      </motion.div>
    </div>
  );
}
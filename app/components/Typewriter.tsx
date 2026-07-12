"use client";

import { useEffect, useState } from "react";

type TypewriterProps = {
  text: string;
  speed?: number;
};

export default function Typewriter({
  text,
  speed = 12,
}: TypewriterProps) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    let index = 0;

    setDisplayed("");

    const interval = setInterval(() => {
      index++;

      setDisplayed(text.slice(0, index));

      if (index >= text.length) {
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  return (
    <>
      {displayed}
      {displayed.length < text.length && (
        <span className="animate-pulse">▋</span>
      )}
    </>
  );
}
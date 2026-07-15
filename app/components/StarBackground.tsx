"use client";

import { useEffect, useRef } from "react";

export default function StarBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
window.addEventListener("resize", resize);

const mouse = {
  x: window.innerWidth / 2,
  y: window.innerHeight / 2,
};

let targetX = window.innerWidth / 2;
let targetY = window.innerHeight / 2;
mouse.x = targetX;
mouse.y = targetY;

window.addEventListener("mousemove", (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

const stars = Array.from({ length: 450 }, () => {
  const originX = Math.random() * canvas.width;
  const originY = Math.random() * canvas.height;

  return {
    originX,
    originY,

    x: originX,
    y: originY,

    vx: 0,
    vy: 0,

    r: Math.random() * 2.5 + 0.3,
    phase: Math.random() * Math.PI * 2,
    reactStrength: 0.5 + Math.random() * 1.5,
  };
});
const shootingStars = Array.from({ length: 3 }, () => ({
  x: -200,
  y: -200,
  length: 180,
  speed: 18,
  active: false,
}));
    let animationId: number;
const interval = window.setInterval(() => {
  const available = shootingStars.find((s) => !s.active);

  if (available) {
    available.x = Math.random() * canvas.width;
    available.y = Math.random() * (canvas.height * 0.35);

    available.length = 150 + Math.random() * 120;
    available.speed = 14 + Math.random() * 12;

    available.active = true;
  }
}, 1500 + Math.random() * 1500);
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      stars.forEach((star) => {
  const time = Date.now() * 0.001;


const floatX = Math.sin(time + star.phase) * 2;
const floatY = Math.cos(time + star.phase) * 2;

const offsetX = (mouse.x - canvas.width / 2) * 0.015;
const offsetY = (mouse.y - canvas.height / 2) * 0.015;

// Distance from mouse
const dx = mouse.x - star.originX;
const dy = mouse.y - star.originY;
const distance = Math.sqrt(dx * dx + dy * dy);

// Individual reaction
let reactX = 0;
let reactY = 0;

if (distance < 180) {
  const force = (180 - distance) / 180;

  reactX =
  -(dx / (distance + 1)) *
  force *
  (8 + star.r * 5) *
  star.reactStrength;

reactY =
  -(dy / (distance + 1)) *
  force *
  (8 + star.r * 5) *
  star.reactStrength;
}

const targetX =
  star.originX +
  floatX +
  offsetX * (star.r * 0.8) +
  reactX;

const targetY =
  star.originY +
  floatY +
  offsetY * (star.r * 0.8) +
  reactY;

// Smooth inertia
star.x += (targetX - star.x) * 0.06;
star.y += (targetY - star.y) * 0.06;

  const opacity =
    0.4 + 0.6 * ((Math.sin(time * 4 + star.phase) + 1) / 2);

  ctx.fillStyle = `rgba(255,255,255,${opacity})`;

  ctx.beginPath();
  ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
  ctx.fill();
});
shootingStars.forEach((meteor) => {
  if (!meteor.active) return;

  ctx.beginPath();

  ctx.moveTo(meteor.x, meteor.y);
  ctx.lineTo(
    meteor.x - meteor.length,
    meteor.y - meteor.length * 0.6
  );

  ctx.strokeStyle = "rgba(255,255,255,0.9)";
  ctx.lineWidth = 2;
  ctx.stroke();

  meteor.x += meteor.speed;
  meteor.y += meteor.speed * 0.6;

  if (
    meteor.x > canvas.width + meteor.length ||
    meteor.y > canvas.height + meteor.length
  ) {
    meteor.active = false;
  }
});


      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
  cancelAnimationFrame(animationId);
  clearInterval(interval);
  window.removeEventListener("resize", resize);
};
  }, []);

  return (
    <canvas
  ref={canvasRef}
  className="absolute inset-0 z-0 h-full w-full pointer-events-none"
/>
  );
}
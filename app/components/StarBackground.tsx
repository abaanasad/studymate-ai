"use client";

import { useEffect, useRef } from "react";

type StarBackgroundProps = {
  warp: boolean;
};

type Pointer = {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  active: boolean;
};

type Star = {
  anchorX: number;
  anchorY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  phase: number;
  twinkleSpeed: number;
  floatSpeed: number;
  floatRadius: number;
  parallax: number;
  mouseStrength: number;
  warpDistance: number;
};

type Meteor = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  width: number;
  alpha: number;
  active: boolean;
};

const STAR_COUNT = 450;
const METEOR_POOL_SIZE = 40;
const MOUSE_RADIUS = 180;
const TAU = Math.PI * 2;

const randomBetween = (min: number, max: number) =>
  min + Math.random() * (max - min);

const frameEase = (amount: number, delta: number) =>
  1 - Math.pow(1 - amount, delta * 60);

const createStar = (width: number, height: number): Star => {
  const anchorX = Math.random();
  const anchorY = Math.random();

  return {
    anchorX,
    anchorY,
    x: anchorX * width,
    y: anchorY * height,
    vx: 0,
    vy: 0,
    radius: randomBetween(0.35, 2.6),
    phase: Math.random() * TAU,
    twinkleSpeed: randomBetween(1.4, 4.8),
    floatSpeed: randomBetween(0.35, 1.05),
    floatRadius: randomBetween(0.8, 3.2),
    parallax: randomBetween(0.25, 1.2),
    mouseStrength: randomBetween(0.6, 1.8),
    warpDistance: randomBetween(520, 1250),
  };
};

const createMeteorPool = (): Meteor[] =>
  Array.from({ length: METEOR_POOL_SIZE }, () => ({
    x: -1000,
    y: -1000,
    vx: 0,
    vy: 0,
    length: 0,
    width: 0,
    alpha: 0,
    active: false,
  }));

export default function StarBackground({ warp }: StarBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const warpRef = useRef(warp);

  useEffect(() => {
    warpRef.current = warp;
  }, [warp]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let animationId = 0;
    let resizeId = 0;
    let lastTime = performance.now();
    let warpAmount = 0;
    let wasWarping = false;
    let nextMeteorIn = randomBetween(0.8, 2.2);

    const pointer: Pointer = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      targetX: window.innerWidth / 2,
      targetY: window.innerHeight / 2,
      active: false,
    };

    const stars = Array.from({ length: STAR_COUNT }, () =>
      createStar(window.innerWidth, window.innerHeight)
    );
    const meteors = createMeteorPool();

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width || window.innerWidth;
      height = rect.height || window.innerHeight;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (!pointer.active) {
        pointer.x = width / 2;
        pointer.y = height / 2;
        pointer.targetX = width / 2;
        pointer.targetY = height / 2;
      }
    };

    const requestResize = () => {
      cancelAnimationFrame(resizeId);
      resizeId = requestAnimationFrame(resize);
    };

    const updatePointer = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.targetX = event.clientX - rect.left;
      pointer.targetY = event.clientY - rect.top;
      pointer.active = true;
    };

    const relaxPointer = () => {
      pointer.active = false;
      pointer.targetX = width / 2;
      pointer.targetY = height / 2;
    };

    const spawnMeteor = (isWarping: boolean) => {
      const meteor = meteors.find((candidate) => !candidate.active);
      if (!meteor) return;

      const speed = isWarping
        ? randomBetween(920, 1450)
        : randomBetween(520, 820);
      const directionY = randomBetween(0.48, 0.66);
      const directionLength = Math.hypot(1, directionY);

      meteor.x = randomBetween(-width * 0.35, width * 0.85);
      meteor.y = randomBetween(-height * 0.15, height * 0.45);
      meteor.vx = speed / directionLength;
      meteor.vy = (speed * directionY) / directionLength;
      meteor.length = isWarping
        ? randomBetween(260, 520)
        : randomBetween(150, 280);
      meteor.width = isWarping ? randomBetween(1.6, 2.8) : randomBetween(1, 2);
      meteor.alpha = isWarping ? randomBetween(0.75, 1) : randomBetween(0.5, 0.85);
      meteor.active = true;
    };

    const spawnMeteors = (count: number, isWarping: boolean) => {
      for (let i = 0; i < count; i += 1) {
        spawnMeteor(isWarping);
      }
    };

    const burstStars = () => {
      const centerX = width / 2;
      const centerY = height / 2;

      stars.forEach((star) => {
        const originX = star.anchorX * width;
        const originY = star.anchorY * height;
        const dx = originX - centerX;
        const dy = originY - centerY;
        const distance = Math.hypot(dx, dy) || 1;
        const edgeBias = Math.min(1, distance / Math.hypot(centerX, centerY));
        const burst = randomBetween(260, 760) * (0.45 + edgeBias);

        star.vx += (dx / distance) * burst;
        star.vy += (dy / distance) * burst;
      });
    };

    const drawStar = (star: Star, time: number, alphaBoost: number) => {
      const speed = Math.hypot(star.vx, star.vy);
      const twinkle = (Math.sin(time * star.twinkleSpeed + star.phase) + 1) / 2;
      const alpha = Math.min(1, 0.28 + twinkle * 0.62 + alphaBoost);
      const radius = star.radius * (1 + alphaBoost * 0.8);

      if (speed > 85) {
        const tail = Math.min(42, speed * 0.04);
        const tailX = (star.vx / speed) * tail;
        const tailY = (star.vy / speed) * tail;

        ctx.beginPath();
        ctx.moveTo(star.x, star.y);
        ctx.lineTo(star.x - tailX, star.y - tailY);
        ctx.strokeStyle = `rgba(180, 215, 255, ${Math.min(0.75, alpha * 0.58)})`;
        ctx.lineWidth = Math.max(0.8, radius * 0.8);
        ctx.lineCap = "round";
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.arc(star.x, star.y, radius, 0, TAU);
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.fill();
    };

    const drawMeteor = (meteor: Meteor) => {
      const speed = Math.hypot(meteor.vx, meteor.vy);
      const tailX = (meteor.vx / speed) * meteor.length;
      const tailY = (meteor.vy / speed) * meteor.length;
      const gradient = ctx.createLinearGradient(
        meteor.x,
        meteor.y,
        meteor.x - tailX,
        meteor.y - tailY
      );

      gradient.addColorStop(0, `rgba(255, 255, 255, ${meteor.alpha})`);
      gradient.addColorStop(0.22, `rgba(170, 215, 255, ${meteor.alpha * 0.65})`);
      gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

      ctx.beginPath();
      ctx.moveTo(meteor.x, meteor.y);
      ctx.lineTo(meteor.x - tailX, meteor.y - tailY);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = meteor.width;
      ctx.lineCap = "round";
      ctx.stroke();
    };

    const animate = (now: number) => {
      const delta = Math.min((now - lastTime) / 1000, 0.033);
      const time = now / 1000;
      const isWarping = warpRef.current;

      lastTime = now;

      if (isWarping && !wasWarping) {
        burstStars();
        spawnMeteors(12, true);
        nextMeteorIn = 0.04;
      }

      wasWarping = isWarping;
      warpAmount +=
        ((isWarping ? 1 : 0) - warpAmount) * frameEase(isWarping ? 0.12 : 0.055, delta);

      pointer.x += (pointer.targetX - pointer.x) * frameEase(0.14, delta);
      pointer.y += (pointer.targetY - pointer.y) * frameEase(0.14, delta);

      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;
      const diagonal = Math.hypot(centerX, centerY) || 1;
      const pointerOffsetX = (pointer.x - centerX) * 0.014;
      const pointerOffsetY = (pointer.y - centerY) * 0.014;
      const spring = isWarping ? 7.5 : 8.8;
      const drag = Math.pow(isWarping ? 0.89 : 0.84, delta * 60);

      stars.forEach((star) => {
        const originX = star.anchorX * width;
        const originY = star.anchorY * height;
        const floatX = Math.sin(time * star.floatSpeed + star.phase) * star.floatRadius;
        const floatY =
          Math.cos(time * star.floatSpeed * 0.9 + star.phase) * star.floatRadius;

        const mouseDx = pointer.x - originX;
        const mouseDy = pointer.y - originY;
        const mouseDistance = Math.hypot(mouseDx, mouseDy);
        let reactX = 0;
        let reactY = 0;

        if (pointer.active && mouseDistance < MOUSE_RADIUS) {
          const force = Math.pow((MOUSE_RADIUS - mouseDistance) / MOUSE_RADIUS, 2);
          const push = force * (16 + star.radius * 5) * star.mouseStrength;

          reactX = -(mouseDx / (mouseDistance + 1)) * push;
          reactY = -(mouseDy / (mouseDistance + 1)) * push;
        }

        const warpDx = originX - centerX;
        const warpDy = originY - centerY;
        const warpDistance = Math.hypot(warpDx, warpDy) || 1;
        const edgeBias = 0.45 + Math.min(1, warpDistance / diagonal);
        const warpPush = star.warpDistance * edgeBias * warpAmount;

        const targetX =
          originX +
          floatX +
          pointerOffsetX * star.parallax +
          reactX +
          (warpDx / warpDistance) * warpPush;
        const targetY =
          originY +
          floatY +
          pointerOffsetY * star.parallax +
          reactY +
          (warpDy / warpDistance) * warpPush;

        star.vx += (targetX - star.x) * spring * delta;
        star.vy += (targetY - star.y) * spring * delta;
        star.vx *= drag;
        star.vy *= drag;
        star.x += star.vx * delta;
        star.y += star.vy * delta;

        drawStar(star, time, warpAmount * 0.18);
      });

      nextMeteorIn -= delta;
      if (nextMeteorIn <= 0) {
        const count = isWarping ? Math.floor(randomBetween(2, 5)) : 1;
        spawnMeteors(count, isWarping);
        nextMeteorIn = isWarping
          ? randomBetween(0.08, 0.22)
          : randomBetween(0.9, 2.3);
      }

      meteors.forEach((meteor) => {
        if (!meteor.active) return;

        meteor.x += meteor.vx * delta;
        meteor.y += meteor.vy * delta;
        meteor.alpha *= Math.pow(0.985, delta * 60);

        drawMeteor(meteor);

        if (
          meteor.x > width + meteor.length ||
          meteor.y > height + meteor.length ||
          meteor.alpha < 0.08
        ) {
          meteor.active = false;
        }
      });

      animationId = requestAnimationFrame(animate);
    };

    resize();
    animationId = requestAnimationFrame(animate);

    window.addEventListener("resize", requestResize);
    window.addEventListener("pointermove", updatePointer, { passive: true });
    window.addEventListener("pointerleave", relaxPointer);
    window.addEventListener("blur", relaxPointer);

    const observer =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(requestResize) : null;
    observer?.observe(canvas);

    return () => {
      cancelAnimationFrame(animationId);
      cancelAnimationFrame(resizeId);
      observer?.disconnect();
      window.removeEventListener("resize", requestResize);
      window.removeEventListener("pointermove", updatePointer);
      window.removeEventListener("pointerleave", relaxPointer);
      window.removeEventListener("blur", relaxPointer);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0 h-full w-full pointer-events-none"
      aria-hidden="true"
    />
  );
}

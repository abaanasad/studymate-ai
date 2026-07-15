"use client";

import Spline from "@splinetool/react-spline";

interface IntroAnimationProps {
  visible: boolean;
}

export default function IntroAnimation({
  visible,
}: IntroAnimationProps) {
 return (
  <div
    className={`fixed inset-0 z-50 transition-opacity duration-300 ${
      visible ? "opacity-100" : "opacity-0 pointer-events-none"
    }`}
  >
    {/* Stars behind the book */}

    {/* Book animation */}
    <Spline scene="https://prod.spline.design/sBcWToi0mWuxGGfe/scene.splinecode" />
  </div>
);
}
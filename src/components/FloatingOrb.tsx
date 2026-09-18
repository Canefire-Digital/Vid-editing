import React from "react";
import { interpolate, useCurrentFrame } from "remotion";

export const FloatingOrb: React.FC<{
  color: string;
  size: number;
  x: number;
  y: number;
  delay?: number;
  speed?: number;
}> = ({ color, size, x, y, delay = 0, speed = 1 }) => {
  const frame = useCurrentFrame();
  const floatY = interpolate(
    Math.sin(((frame - delay) * speed) / 30),
    [-1, 1],
    [-20, 20]
  );
  const opacity = interpolate(frame - delay, [0, 40], [0, 0.4], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: size,
        height: size,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${color}88, ${color}00)`,
        filter: `blur(${size / 3}px)`,
        opacity,
        transform: `translateY(${floatY}px)`,
      }}
    />
  );
};

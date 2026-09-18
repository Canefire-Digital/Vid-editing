import React from "react";
import { interpolate, useCurrentFrame } from "remotion";

export const GlassCard: React.FC<{
  children: React.ReactNode;
  delay?: number;
  accentColor: string;
  style?: React.CSSProperties;
}> = ({ children, delay = 0, accentColor, style = {} }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame - delay, [0, 25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scale = interpolate(frame - delay, [0, 25], [0.9, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        opacity,
        transform: `scale(${scale})`,
        background: "rgba(255, 255, 255, 0.08)",
        backdropFilter: "blur(20px)",
        borderRadius: 20,
        border: `1px solid rgba(255, 255, 255, 0.15)`,
        boxShadow: `0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 0 60px ${accentColor}22`,
        padding: 40,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

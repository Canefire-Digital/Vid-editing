import React from "react";
import { interpolate, useCurrentFrame } from "remotion";

export const AnimatedText: React.FC<{
  text: string;
  delay?: number;
  fontSize?: number;
  color?: string;
  fontWeight?: number;
  style?: React.CSSProperties;
}> = ({ text, delay = 0, fontSize = 48, color = "#FFFFFF", fontWeight = 700, style = {} }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame - delay, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const translateY = interpolate(frame - delay, [0, 20], [40, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        fontSize,
        fontWeight,
        color,
        opacity,
        transform: `translateY(${translateY}px)`,
        fontFamily: "system-ui, -apple-system, sans-serif",
        ...style,
      }}
    >
      {text}
    </div>
  );
};

import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { AnimatedText } from "../components/AnimatedText";
import { GlassCard } from "../components/GlassCard";
import { FloatingOrb } from "../components/FloatingOrb";

type SocialAdProps = {
  businessName: string;
  offer: string;
  offerDetail: string;
  phone: string;
  accentColor: string;
  backgroundColor: string;
};

export const SocialAd: React.FC<SocialAdProps> = ({
  businessName,
  offer,
  offerDetail,
  phone,
  accentColor,
  backgroundColor,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const badgeScale = spring({ frame: frame - 20, fps, config: { damping: 12 } });

  const fadeOut = interpolate(
    frame,
    [durationInFrames - 20, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const pulse = interpolate(Math.sin(frame / 8), [-1, 1], [1, 1.05]);

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 30% 30%, ${accentColor}44, ${backgroundColor} 70%)`,
        opacity: fadeOut,
      }}
    >
      <FloatingOrb color={accentColor} size={300} x={-50} y={-50} speed={1} />
      <FloatingOrb color="#4ECDC4" size={200} x={800} y={700} delay={15} speed={0.8} />

      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          padding: 60,
        }}
      >
        {/* Business Name */}
        <AnimatedText
          text={businessName}
          fontSize={32}
          fontWeight={400}
          color="rgba(255,255,255,0.7)"
          style={{
            letterSpacing: 6,
            textTransform: "uppercase",
            marginBottom: 40,
          }}
        />

        {/* Offer Badge */}
        <div
          style={{
            transform: `scale(${badgeScale * pulse})`,
            marginBottom: 30,
          }}
        >
          <GlassCard
            accentColor={accentColor}
            delay={10}
            style={{
              padding: "40px 60px",
              textAlign: "center",
              border: `2px solid ${accentColor}88`,
            }}
          >
            <div
              style={{
                fontSize: 96,
                fontWeight: 900,
                color: accentColor,
                fontFamily: "system-ui, sans-serif",
                lineHeight: 1,
              }}
            >
              {offer}
            </div>
            <div
              style={{
                fontSize: 28,
                fontWeight: 500,
                color: "#FFFFFF",
                marginTop: 12,
                fontFamily: "system-ui, sans-serif",
                letterSpacing: 2,
                textTransform: "uppercase",
              }}
            >
              {offerDetail}
            </div>
          </GlassCard>
        </div>

        {/* Phone CTA */}
        <AnimatedText
          text={`Call ${phone}`}
          delay={40}
          fontSize={36}
          fontWeight={700}
          color="#FFFFFF"
        />
      </AbsoluteFill>

      {/* Corner accents */}
      <div
        style={{
          position: "absolute",
          top: 30,
          left: 30,
          width: 60,
          height: 60,
          borderTop: `3px solid ${accentColor}`,
          borderLeft: `3px solid ${accentColor}`,
          opacity: interpolate(frame, [0, 20], [0, 0.6], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 30,
          right: 30,
          width: 60,
          height: 60,
          borderBottom: `3px solid ${accentColor}`,
          borderRight: `3px solid ${accentColor}`,
          opacity: interpolate(frame, [0, 20], [0, 0.6], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      />
    </AbsoluteFill>
  );
};

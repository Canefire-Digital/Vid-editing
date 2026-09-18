import React from "react";
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { AnimatedText } from "../components/AnimatedText";
import { GlassCard } from "../components/GlassCard";
import { FloatingOrb } from "../components/FloatingOrb";

type TestimonialVideoProps = {
  businessName: string;
  customerName: string;
  location: string;
  rating: number;
  testimonial: string;
  accentColor: string;
  backgroundColor: string;
};

const Star: React.FC<{ filled: boolean; delay: number; color: string }> = ({
  filled,
  delay,
  color,
}) => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame - delay, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const rotation = interpolate(frame - delay, [0, 15], [180, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <span
      style={{
        fontSize: 48,
        transform: `scale(${scale}) rotate(${rotation}deg)`,
        display: "inline-block",
        color: filled ? color : "rgba(255,255,255,0.2)",
        margin: "0 4px",
      }}
    >
      ★
    </span>
  );
};

export const TestimonialVideo: React.FC<TestimonialVideoProps> = ({
  businessName,
  customerName,
  location,
  rating,
  testimonial,
  accentColor,
  backgroundColor,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const fadeOut = interpolate(
    frame,
    [durationInFrames - 30, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(160deg, ${backgroundColor}, ${backgroundColor}EE 60%, ${accentColor}22 100%)`,
        opacity: fadeOut,
      }}
    >
      <FloatingOrb color={accentColor} size={350} x={1400} y={-100} speed={0.6} />
      <FloatingOrb color="#4ECDC4" size={200} x={-50} y={600} delay={30} speed={1} />

      {/* Stars intro */}
      <Sequence from={0} durationInFrames={60}>
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div style={{ marginBottom: 30 }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  filled={i < rating}
                  delay={i * 6 + 5}
                  color={accentColor}
                />
              ))}
            </div>
            <AnimatedText
              text="What Our Customers Say"
              delay={25}
              fontSize={36}
              fontWeight={400}
              color="rgba(255,255,255,0.8)"
              style={{ letterSpacing: 4, textTransform: "uppercase" }}
            />
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Testimonial Card */}
      <Sequence from={50} durationInFrames={140}>
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            padding: 120,
          }}
        >
          <GlassCard
            delay={0}
            accentColor={accentColor}
            style={{ padding: "50px 70px", maxWidth: 1200 }}
          >
            <div
              style={{
                fontSize: 120,
                color: accentColor,
                fontFamily: "Georgia, serif",
                lineHeight: 0.5,
                marginBottom: 20,
                opacity: 0.6,
              }}
            >
              &ldquo;
            </div>
            <AnimatedText
              text={testimonial}
              delay={10}
              fontSize={36}
              fontWeight={400}
              color="#FFFFFF"
              style={{ lineHeight: 1.6, marginBottom: 30 }}
            />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                marginTop: 20,
              }}
            >
              <div
                style={{
                  width: 4,
                  height: 50,
                  background: accentColor,
                  borderRadius: 2,
                  opacity: interpolate(frame - 50, [30, 50], [0, 1], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  }),
                }}
              />
              <div>
                <AnimatedText
                  text={customerName}
                  delay={30}
                  fontSize={28}
                  fontWeight={700}
                  color={accentColor}
                />
                <AnimatedText
                  text={location}
                  delay={35}
                  fontSize={20}
                  fontWeight={300}
                  color="rgba(255,255,255,0.5)"
                />
              </div>
            </div>
          </GlassCard>
        </AbsoluteFill>
      </Sequence>

      {/* Business name outro */}
      <Sequence from={180} durationInFrames={60}>
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <AnimatedText
            text={businessName}
            fontSize={72}
            fontWeight={800}
            color="#FFFFFF"
            style={{ letterSpacing: -1 }}
          />
        </AbsoluteFill>
      </Sequence>

      {/* Bottom accent */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 4,
          background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
          opacity: interpolate(frame, [10, 30], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      />
    </AbsoluteFill>
  );
};

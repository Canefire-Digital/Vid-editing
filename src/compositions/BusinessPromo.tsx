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

type BusinessPromoProps = {
  businessName: string;
  tagline: string;
  services: string[];
  phone: string;
  location: string;
  accentColor: string;
  backgroundColor: string;
};

export const BusinessPromo: React.FC<BusinessPromoProps> = ({
  businessName,
  tagline,
  services,
  phone,
  location,
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
        background: `linear-gradient(135deg, ${backgroundColor} 0%, ${backgroundColor}DD 50%, ${accentColor}33 100%)`,
        opacity: fadeOut,
      }}
    >
      <FloatingOrb color={accentColor} size={400} x={-100} y={-100} speed={0.8} />
      <FloatingOrb color={accentColor} size={300} x={1500} y={600} delay={20} speed={1.2} />
      <FloatingOrb color="#4ECDC4" size={250} x={800} y={-50} delay={40} speed={0.6} />

      {/* Intro: Business Name */}
      <Sequence from={0} durationInFrames={90}>
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <AnimatedText
              text={businessName}
              fontSize={96}
              fontWeight={800}
              color="#FFFFFF"
              style={{ letterSpacing: -2, marginBottom: 16 }}
            />
            <AnimatedText
              text={tagline}
              delay={15}
              fontSize={36}
              fontWeight={400}
              color={accentColor}
              style={{ letterSpacing: 4, textTransform: "uppercase" }}
            />
            <AnimatedText
              text={location}
              delay={30}
              fontSize={24}
              fontWeight={300}
              color="rgba(255,255,255,0.6)"
              style={{ marginTop: 20, letterSpacing: 2 }}
            />
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Services Section */}
      <Sequence from={80} durationInFrames={120}>
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            padding: 80,
          }}
        >
          <div style={{ textAlign: "center", width: "100%" }}>
            <AnimatedText
              text="What We Do"
              fontSize={28}
              fontWeight={400}
              color={accentColor}
              style={{
                letterSpacing: 6,
                textTransform: "uppercase",
                marginBottom: 40,
              }}
            />
            <div
              style={{
                display: "flex",
                gap: 30,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              {services.map((service, i) => (
                <GlassCard
                  key={service}
                  delay={i * 12 + 10}
                  accentColor={accentColor}
                  style={{ padding: "30px 50px", minWidth: 280 }}
                >
                  <AnimatedText
                    text={service}
                    delay={i * 12 + 15}
                    fontSize={32}
                    fontWeight={600}
                    color="#FFFFFF"
                    style={{ textAlign: "center" }}
                  />
                </GlassCard>
              ))}
            </div>
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* CTA Section */}
      <Sequence from={190} durationInFrames={110}>
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <GlassCard
            delay={0}
            accentColor={accentColor}
            style={{
              padding: "60px 80px",
              textAlign: "center",
            }}
          >
            <AnimatedText
              text="Call Us Today"
              fontSize={28}
              fontWeight={400}
              color="rgba(255,255,255,0.7)"
              style={{
                letterSpacing: 6,
                textTransform: "uppercase",
                marginBottom: 20,
              }}
            />
            <AnimatedText
              text={phone}
              delay={10}
              fontSize={72}
              fontWeight={800}
              color={accentColor}
              style={{ letterSpacing: 4 }}
            />
            <AnimatedText
              text={`Serving ${location} & Surrounds`}
              delay={20}
              fontSize={24}
              fontWeight={300}
              color="rgba(255,255,255,0.6)"
              style={{ marginTop: 20 }}
            />
          </GlassCard>
        </AbsoluteFill>
      </Sequence>

      {/* Bottom accent line */}
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

import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  OffthreadVideo,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

type ClipSegment = {
  src: string;
  startFrom: number;
  duration: number;
  originalWidth: number;
  originalHeight: number;
  zoomStart?: number;
  zoomEnd?: number;
  panX?: number;
  panY?: number;
};

const CLIPS: ClipSegment[] = [
  {
    src: "clips/clip1.mp4",
    startFrom: 0,
    duration: 60,
    originalWidth: 1920,
    originalHeight: 1080,
    zoomStart: 1.3,
    zoomEnd: 1.5,
    panY: -5,
  },
  {
    src: "clips/clip4.mp4",
    startFrom: 0,
    duration: 75,
    originalWidth: 480,
    originalHeight: 960,
    zoomStart: 1.0,
    zoomEnd: 1.05,
  },
  {
    src: "clips/clip2.mp4",
    startFrom: 15,
    duration: 60,
    originalWidth: 1920,
    originalHeight: 1080,
    zoomStart: 1.4,
    zoomEnd: 1.6,
    panX: 5,
  },
  {
    src: "clips/clip3.mp4",
    startFrom: 30,
    duration: 60,
    originalWidth: 854,
    originalHeight: 480,
    zoomStart: 2.0,
    zoomEnd: 2.3,
    panY: -3,
  },
  {
    src: "clips/clip1.mp4",
    startFrom: 90,
    duration: 55,
    originalWidth: 1920,
    originalHeight: 1080,
    zoomStart: 1.5,
    zoomEnd: 1.3,
    panX: -5,
  },
  {
    src: "clips/clip2.mp4",
    startFrom: 90,
    duration: 60,
    originalWidth: 1920,
    originalHeight: 1080,
    zoomStart: 1.3,
    zoomEnd: 1.5,
    panY: 5,
  },
];

const TOTAL_DURATION = CLIPS.reduce((sum, c) => sum + c.duration, 0);

const FlashTransition: React.FC<{ at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame - at, [-2, 0, 4], [0, 0.8, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill
      style={{ backgroundColor: "#FFFFFF", opacity, zIndex: 50 }}
    />
  );
};

const TextOverlay: React.FC<{
  text: string;
  subtext?: string;
  startFrame: number;
  durationFrames: number;
  accentColor: string;
  position?: "top" | "center" | "bottom";
}> = ({
  text,
  subtext,
  startFrame,
  durationFrames,
  accentColor,
  position = "bottom",
}) => {
  const frame = useCurrentFrame();
  const relFrame = frame - startFrame;
  const { fps } = useVideoConfig();

  if (relFrame < 0 || relFrame > durationFrames) return null;

  const slideUp = spring({
    frame: relFrame,
    fps,
    config: { damping: 15, stiffness: 120 },
  });

  const fadeOut = interpolate(
    relFrame,
    [durationFrames - 10, durationFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const yMap = { top: 180, center: 860, bottom: 1500 };
  const baseY = yMap[position];

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: baseY,
        zIndex: 40,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        transform: `translateY(${(1 - slideUp) * 60}px)`,
        opacity: slideUp * fadeOut,
      }}
    >
      <div
        style={{
          background: "rgba(0,0,0,0.7)",
          backdropFilter: "blur(12px)",
          borderRadius: 16,
          padding: "18px 36px",
          border: `2px solid ${accentColor}88`,
          boxShadow: `0 4px 30px ${accentColor}44`,
        }}
      >
        <div
          style={{
            color: "#FFFFFF",
            fontSize: 48,
            fontWeight: 800,
            fontFamily: "system-ui, -apple-system, sans-serif",
            textAlign: "center",
            textShadow: "0 2px 8px rgba(0,0,0,0.5)",
            letterSpacing: -1,
          }}
        >
          {text}
        </div>
        {subtext && (
          <div
            style={{
              color: accentColor,
              fontSize: 28,
              fontWeight: 600,
              fontFamily: "system-ui, sans-serif",
              textAlign: "center",
              marginTop: 6,
              letterSpacing: 2,
              textTransform: "uppercase",
            }}
          >
            {subtext}
          </div>
        )}
      </div>
    </div>
  );
};

const ProgressBar: React.FC<{ accentColor: string }> = ({ accentColor }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const progress = (frame / durationInFrames) * 100;

  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 4,
        background: "rgba(255,255,255,0.15)",
        zIndex: 60,
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${progress}%`,
          background: `linear-gradient(90deg, ${accentColor}, ${accentColor}CC)`,
          borderRadius: 2,
        }}
      />
    </div>
  );
};

type SocialClipEditProps = {
  accentColor: string;
  hookText: string;
  middleText: string;
  ctaText: string;
  ctaSubtext: string;
};

export const SocialClipEdit: React.FC<SocialClipEditProps> = ({
  accentColor,
  hookText,
  middleText,
  ctaText,
  ctaSubtext,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  let runningFrame = 0;
  const cutPoints: number[] = [];

  return (
    <AbsoluteFill style={{ backgroundColor: "#000000" }}>
      {CLIPS.map((clip, i) => {
        const seqStart = runningFrame;
        runningFrame += clip.duration;
        cutPoints.push(seqStart);

        const isPortrait =
          clip.originalHeight > clip.originalWidth;

        const baseScale = isPortrait
          ? 1080 / clip.originalWidth
          : 1920 / clip.originalHeight;

        return (
          <Sequence
            key={`${clip.src}-${i}`}
            from={seqStart}
            durationInFrames={clip.duration}
          >
            <ClipWithZoom
              clip={clip}
              baseScale={baseScale}
              isPortrait={isPortrait}
            />
          </Sequence>
        );
      })}

      {cutPoints.slice(1).map((cp) => (
        <FlashTransition key={cp} at={cp} />
      ))}

      <TextOverlay
        text={hookText}
        startFrame={5}
        durationFrames={55}
        accentColor={accentColor}
        position="center"
      />
      <TextOverlay
        text={middleText}
        startFrame={150}
        durationFrames={60}
        accentColor={accentColor}
        position="bottom"
      />
      <TextOverlay
        text={ctaText}
        subtext={ctaSubtext}
        startFrame={TOTAL_DURATION - 70}
        durationFrames={65}
        accentColor={accentColor}
        position="center"
      />

      {/* Vignette for cinematic feel */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.6) 100%)",
          zIndex: 30,
          pointerEvents: "none",
        }}
      />

      <ProgressBar accentColor={accentColor} />
    </AbsoluteFill>
  );
};

const ClipWithZoom: React.FC<{
  clip: ClipSegment;
  baseScale: number;
  isPortrait: boolean;
}> = ({ clip, baseScale, isPortrait }) => {
  const frame = useCurrentFrame();

  const zoomStart = clip.zoomStart ?? 1.3;
  const zoomEnd = clip.zoomEnd ?? 1.5;
  const zoom = interpolate(frame, [0, clip.duration], [zoomStart, zoomEnd], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const panX = interpolate(
    frame,
    [0, clip.duration],
    [0, (clip.panX ?? 0) * 2],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const panY = interpolate(
    frame,
    [0, clip.duration],
    [0, (clip.panY ?? 0) * 2],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const scale = baseScale * zoom;

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      <OffthreadVideo
        src={staticFile(clip.src)}
        startFrom={clip.startFrom}
        style={{
          width: clip.originalWidth,
          height: clip.originalHeight,
          transform: `scale(${scale}) translate(${panX}%, ${panY}%)`,
          objectFit: "cover",
        }}
      />
    </AbsoluteFill>
  );
};

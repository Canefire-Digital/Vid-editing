import { Composition } from "remotion";
import { BusinessPromo } from "./compositions/BusinessPromo";
import { SocialAd } from "./compositions/SocialAd";
import { SocialClipEdit } from "./compositions/SocialClipEdit";
import { TestimonialVideo } from "./compositions/TestimonialVideo";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="SocialClipEdit"
        component={SocialClipEdit}
        durationInFrames={370}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          accentColor: "#FF6B35",
          hookText: "Wait for it... 👀",
          middleText: "The real deal 🔥",
          ctaText: "Follow for more",
          ctaSubtext: "Link in bio",
        }}
      />
      <Composition
        id="BusinessPromo"
        component={BusinessPromo}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          businessName: "Smith's Plumbing",
          tagline: "Your Local Plumbing Experts",
          services: ["Emergency Repairs", "Hot Water Systems", "Blocked Drains"],
          phone: "0412 345 678",
          location: "Townsville, QLD",
          accentColor: "#FF6B35",
          backgroundColor: "#0A1628",
        }}
      />
      <Composition
        id="SocialAd"
        component={SocialAd}
        durationInFrames={150}
        fps={30}
        width={1080}
        height={1080}
        defaultProps={{
          businessName: "Smith's Plumbing",
          offer: "20% OFF",
          offerDetail: "First-Time Customers",
          phone: "0412 345 678",
          accentColor: "#FF6B35",
          backgroundColor: "#0A1628",
        }}
      />
      <Composition
        id="TestimonialVideo"
        component={TestimonialVideo}
        durationInFrames={240}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          businessName: "Smith's Plumbing",
          customerName: "Sarah M.",
          location: "Townsville",
          rating: 5,
          testimonial:
            "Called them for an emergency leak at 2am and they were here within 30 minutes. Absolute legends. Fixed it fast and didn't charge the earth.",
          accentColor: "#FF6B35",
          backgroundColor: "#0A1628",
        }}
      />
    </>
  );
};

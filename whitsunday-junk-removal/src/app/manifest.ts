import type { MetadataRoute } from "next";

// Lets the crew add the dashboard to their phone's home screen like an app.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Whitsunday Junk Removal",
    short_name: "WJR",
    description: "Junk and rubbish removal across the Whitsundays — instant prices, free quotes.",
    start_url: "/",
    display: "standalone",
    background_color: "#f6f9fb",
    theme_color: "#0b2545",
    icons: [{ src: "/apple-icon", sizes: "180x180", type: "image/png" }, { src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}

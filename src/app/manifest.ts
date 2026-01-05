import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "StartAM",
    short_name: "StartAM",
    description: "朝起きてすぐ天気と予定をまとめて見るダッシュボード",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#0d1017",
    theme_color: "#0d1017",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@radix-ui/react-dialog",
    "@radix-ui/react-select",
    "@radix-ui/react-dropdown-menu",
    "@radix-ui/react-tabs",
    "@radix-ui/react-toast",
    "@radix-ui/react-tooltip",
    "@radix-ui/react-label",
    "@radix-ui/react-slot",
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "**.tmdb.org",
      },
      {
        protocol: "https",
        hostname: "**.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "m.media-amazon.com",
      },
    ],
  },
  // Stripe requires raw body for webhook
  serverExternalPackages: ["bcryptjs", "nodemailer", "@prisma/client", "prisma"],
};

export default nextConfig;

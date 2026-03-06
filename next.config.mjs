import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: false, // Set to false to allow custom update prompt
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // any next config options here
};

export default withPWA(nextConfig);

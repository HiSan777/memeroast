import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  // Keeps Next from inferring the parent workspace when this folder sits inside
  // a larger code directory with other lockfiles.
  turbopack: {
    root: rootDir,
  },
  // Cloudflare Pages does not use Next's default Node image optimizer.
  images: {
    unoptimized: true,
  },
  webpack: (config, { webpack }) => {
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^@react-native-async-storage\/async-storage$/,
      }),
      new webpack.IgnorePlugin({
        resourceRegExp: /^pino-pretty$/,
      }),
    );

    return config;
  },
};

export default nextConfig;

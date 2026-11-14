/** @type {import('next').NextConfig} */
const nextConfig = {
  // De lessen in content/ worden bij de build ingelezen.
  outputFileTracingIncludes: { "/ronde/[id]": ["./content/**"], "/invalshoek": ["./content/**"] },
};
export default nextConfig;

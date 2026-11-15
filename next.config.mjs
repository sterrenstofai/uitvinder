/** @type {import('next').NextConfig} */
const nextConfig = {
  // De lessen in content/ worden bij de build ingelezen.
  outputFileTracingIncludes: { "/bouwen": ["./content/**"], "/vandaag": ["./content/**"], "/reis": ["./content/**"], "/administratie": ["./content/**"], "/ronde/[id]": ["./content/**"], "/invalshoek": ["./content/**"] },
};
export default nextConfig;

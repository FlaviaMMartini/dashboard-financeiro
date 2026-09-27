import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  cacheComponents: true,
  // `jose` é ESM-only; listá-lo aqui também faz o next/jest transpilá-lo nos testes.
  transpilePackages: ['jose'],
  compiler: {
    styledComponents: true,
  },
  // O dataset é lido via fs em runtime; garante que ele seja incluído no bundle serverless.
  outputFileTracingIncludes: {
    '/dashboard': ['./data/transactions.json'],
  },
}

export default nextConfig

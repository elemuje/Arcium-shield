# ArciumShield — Private DeFi Lending on Solana

A privacy-first lending & borrowing protocol demo powered by [Arcium](https://arcium.com) MPC on Solana Devnet.

## Supported Wallets

| Wallet | Status |
|--------|--------|
| 🟣 Phantom | ✅ |
| 🟠 Solflare | ✅ |
| 🔴 Backpack | ✅ |

## Features

- 🔐 Encrypted lending & borrowing via Arcium MPC
- 🛡️ Private health factor computation — never revealed on-chain
- ⚡ Anti-MEV design
- 📊 Live APY charts with Recharts
- 🌐 Multi-wallet support (Phantom, Solflare, Backpack)
- 📱 Fully responsive (mobile + desktop)

## Quick Start

```bash
npm install
npm run dev
```

## Deploy to Vercel

```bash
npm run build
# drag & drop the `dist/` folder to Vercel, or:
npx vercel --prod
```

Vercel settings:
- **Framework**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

## Project Structure

```
src/
  arcium/         # Arcium MPC engine (browser-compatible mock)
  components/
    charts/       # APYChart, HealthFactorGauge
    effects/      # FluidBackground
    layout/       # Layout, Sidebar, MobileNav, LoadingScreen
    protocol/     # WalletButton, PoolCard, PrivacyToggle
  contexts/       # SolanaWalletContext (Phantom + Solflare + Backpack)
  hooks/          # useLendingProtocol
  lib/            # utils (cn)
  pages/          # LandingPage, Dashboard, LendPage, BorrowPage, PositionPage
```

## Network

Currently configured for **Solana Devnet**. Change `NETWORK` in `src/contexts/SolanaWalletContext.jsx` to switch to Mainnet.

## Tech Stack

- Vite + React 18
- Tailwind CSS v3
- @solana/wallet-adapter (Phantom, Solflare, Backpack)
- @solana/web3.js
- Recharts
- Framer Motion
- Lucide React

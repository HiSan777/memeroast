# MemeRoast Demo Script

## Project

MemeRoast

## One-line Description

MemeRoast is an AI meme and wallet-roast agent on Arc Testnet that uses tiny
USDC nanopayments to generate viral crypto captions and meme visuals.

## Links

- Live demo: https://memeroast.xyz
- Docs: https://memeroast.xyz/docs
- GitHub: https://github.com/HiSan777/memeroast
- ArcScan contract: https://testnet.arcscan.app/address/0x95848A7eC8E597f4d862f25940dF5102A2782515

## Arc Testnet Deployments

- Network: Arc Testnet
- Chain ID: `5042002`
- RPC: `https://rpc.testnet.arc.network`
- Payment receiver: `0x87CE124f9c32B83b54255583E2a39CB6bcEADc46`
- MemeRoastHistory contract: `0x95848A7eC8E597f4d862f25940dF5102A2782515`

## What It Does

Users connect a wallet, choose a personality, enter a prompt or upload an image,
generate a free preview, then send a `0.05 USDC` Arc Testnet nanopayment to
create a final roast/caption and meme visual.

The final result is saved to wallet-scoped history. Metadata can be stored
through the backend storage route and anchored on Arc Testnet through the
`MemeRoastHistory.recordRoast(metadataUri)` contract event.

## Why Arc / USDC

MemeRoast explores consumer AI payments using USDC as a tiny pay-per-generation
mechanism. Arc Testnet gives the app a fast wallet flow, USDC-native payments,
and a simple on-chain history anchor for generated AI content.

## Demo Flow

1. Open https://memeroast.xyz.
2. Connect wallet and switch to Arc Testnet.
3. Pick a personality such as `Roast Master` or `Meme Lord`.
4. Enter a prompt like `Roast my wallet`.
5. Click `Generate Preview`.
6. Click `Pay 0.05 USDC & Generate Final`.
7. Sign the USDC payment.
8. Sign the optional history contract transaction.
9. View the saved item in `My History`.
10. Click `Sync Arc History` to read `RoastRecorded` events back from Arc.

## 90-second Demo Script

1. "MemeRoast turns wallet pain into viral meme content on Arc Testnet."
2. Show the homepage and select a personality.
3. Connect wallet and switch to Arc Testnet.
4. Enter `Roast my wallet` and generate the free preview.
5. Explain that preview is free, final generation costs `0.05 USDC`.
6. Click final generation and sign the Arc Testnet USDC payment.
7. Show the final caption, meme visual, image seed, payment tx, and metadata.
8. Sign the history transaction and show the ArcScan link.
9. Open `My History`, click `Sync Arc History`, and show the on-chain event
   record loaded back into the UI.
10. Close with: "This is a consumer AI payment loop powered by USDC on Arc."

## Built With

- Next.js 15 App Router
- TypeScript
- Tailwind CSS
- RainbowKit + Wagmi + viem
- Zustand
- Cloudflare Pages
- Arc Testnet
- Circle USDC
- Optional Cloudinary/IPFS metadata hooks

## Current Status

Working public testnet prototype.

## Next Steps

- Wire real Fal.ai / Flux / Grok image generation with Cloudinary upload.
- Store all final metadata on IPFS.
- Improve event indexing and metadata pinning for long-term on-chain history.
- Improve Arc Blueprints agent execution path.

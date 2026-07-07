# MemeRoast Hackathon Submission

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
- Read wallet history back from Arc Testnet events.
- Improve Arc Blueprints agent execution path.

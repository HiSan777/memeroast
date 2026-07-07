# MemeRoast

**AI Meme & Roast Agent on Arc Testnet**

**MemeRoast - Roast your wallet. Go viral.**

MemeRoast helps turn a crypto wallet into viral content with savage AI roasts, crypto meme captions, and clean meme visuals.

Choose a personality -> enter a prompt -> pay `0.05 USDC` -> receive a funny meme image and savage roast.

Live app: https://memeroast.xyz

GitHub: https://github.com/HiSan777/memeroast

User guide: [DOCS.md](./DOCS.md)

## Main Features

- Connect wallet on Arc Testnet
- Funny AI personalities such as `Roast Master`, `Meme Lord`, `Crypto Degenerate`, and `Chill Girl`
- Free preview generation
- Real Arc Testnet USDC nanopayment transfer
- Pro mock Flux-style meme image renderer with changing templates, seeds, palettes, and captions kept separate
- Real image API hook for Fal.ai / Replicate / Grok-compatible image providers
- Cloudinary/IPFS metadata storage hooks
- Optional Arc Testnet on-chain history via `MemeRoastHistory.recordRoast(metadataUri)`
- Wallet-scoped local history plus Arc event sync from `RoastRecorded`
- Dynamic leaderboard with filters, random wallets, random personalities, and auto-refresh
- Clean Share on X flow for creator-ready captions
- Copy PNG image, download PNG image, and caption-only X posting
- Circle Faucet shortcut for Arc Testnet USDC

## Roadmap

**Phase 1: Complete**

- MVP core features
- Deploy `memeroast.xyz`
- Pro Flux-style meme image renderer with diverse layouts
- Faucet shortcut, improved footer, docs, share flow, and dynamic leaderboard

**Phase 2: In Progress**

- Real meme image API with Cloudinary upload
- IPFS metadata storage
- On-chain history event sync
- Share on X automation

**Phase 3: Later**

- Personality marketplace
- Reward system
- Token, if useful

## Social & Contact

- X: https://x.com/asher2222026
- Discord: Coming soon
- Telegram: Coming soon
- GitHub: https://github.com/HiSan777/memeroast

Built on Arc Testnet. Powered by Circle USDC.

## Test USDC Faucet

Arc Testnet uses USDC as the gas token. The app header includes a `Faucet`
button that opens Circle Faucet:

```text
https://faucet.circle.com/
```

Use this only for testnet/demo funds.

## Stack

- Next.js 15 App Router
- TypeScript
- Tailwind CSS
- RainbowKit + Wagmi + viem
- Zustand
- Arc Testnet `5042002`
- USDC gas

## Run Local

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

## Environment

Create `.env.local` from `.env.example`.

Required for wallet modal:

```bash
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
```

Only use public wallet addresses in env files. Never add seed phrases or private keys.

## Build

```bash
npm run lint
npm run build
```

## Deploy on Cloudflare Pages

Cloudflare Pages uses static output from `out/`.

```bash
npm run deploy
```

Production URL:

```text
https://memeroast.xyz
```

## Demo

- Website: https://memeroast.xyz
- Docs: https://memeroast.xyz/docs
- Repository: https://github.com/HiSan777/memeroast
- Network: Arc Testnet `5042002`
- Payment receiver: `0x87CE124f9c32B83b54255583E2a39CB6bcEADc46`
- History contract: `0x95848A7eC8E597f4d862f25940dF5102A2782515`
- Demo script: [docs/demo-script.md](./docs/demo-script.md)

## Arc Integration Notes

Current nanopayment sends a real Arc Testnet native USDC transfer to the public
MemeRoast receiver wallet. Final meme metadata can be stored via the configured
metadata route and anchored by calling `recordRoast(metadataUri)` on the Arc
Testnet history contract. The `My History` tab can also sync `RoastRecorded`
events back from Arc for the connected wallet.

Agent execution and image generation are provider-ready. Without real image API
keys, the app uses the built-in Flux-style SVG renderer so the demo remains
fully usable.

Production replacement points:

- `src/lib/arcBlueprints.ts` for Arc Blueprints Agent execution.
- `src/components/generation/generation-flow.tsx` for Wagmi/viem payment writes.
- `src/lib/memeImage.ts` for Grok Image / Flux image API integration.
- `functions/api/generate-image.ts` for server-side image provider calls on Cloudflare Pages.
- `functions/api/store-metadata.ts` for IPFS/Cloudinary metadata storage.
- `contracts/MemeRoastHistory.sol` for event-based on-chain history.

Image generation now sends a random `seed` and dynamic prompt every final run.
The demo renderer rotates visual templates such as chart meme, pixel-art arcade,
cyberpunk trading desk, rocket crash, gas meter, comic panel, and glitch
terminal. Captions stay outside the image for clean sharing. The mock image is
converted to PNG before copy/download actions so users can paste it into X or
social apps when the browser allows image clipboard access.

To enable a real image provider, set these in Cloudflare Pages or `.env.local`:

```bash
NEXT_PUBLIC_REAL_IMAGE_ENABLED=true
IMAGE_GENERATION_ENDPOINT=https://your-provider-endpoint
IMAGE_GENERATION_API_KEY=your_server_side_key
IMAGE_GENERATION_MODEL=your_model_name
IMAGE_GENERATION_PAYLOAD_MODE=openai
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_UPLOAD_PRESET=your_unsigned_upload_preset
PINATA_JWT=your_pinata_jwt
IPFS_GATEWAY_URL=https://gateway.pinata.cloud
```

`IMAGE_GENERATION_PAYLOAD_MODE` supports:

- `openai` for OpenAI/xAI/Grok-compatible image routes.
- `generic` for providers that accept `{ prompt, seed, size }`.
- `replicate` for providers that expect `{ input: { prompt, seed, width, height } }`.

## On-chain History Contract

The simple contract is in:

```text
contracts/MemeRoastHistory.sol
```

Step-by-step deploy guide:

```text
docs/DEPLOY_ARC_HISTORY_CONTRACT.md
```

Deploy it on Arc Testnet, copy the deployed contract address, then set:

```bash
NEXT_PUBLIC_MEMEROAST_HISTORY_CONTRACT=0x95848A7eC8E597f4d862f25940dF5102A2782515
```

When this env var is set, the app calls:

```solidity
recordRoast(string metadataUri)
```

If the env var is empty, the app skips the contract write and saves the
metadata URL/CID/hash into local history for testing. Do not use your wallet
address as the contract address unless that address is actually a deployed
contract.

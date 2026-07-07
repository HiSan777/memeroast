# Deploy MemeRoast History Contract on Arc Testnet

This guide deploys `contracts/MemeRoastHistory.sol` and connects it to the app.

Do not paste private keys or seed phrases anywhere. Use MetaMask/Rabby to sign.

## 1. Add Arc Testnet to Wallet

Network:

```text
Name: Arc Testnet
Chain ID: 5042002
RPC URL: https://rpc.testnet.arc.network
Currency: USDC
Explorer: https://testnet.arcscan.app
```

Make sure the deployer wallet has Arc Testnet USDC for gas.

## 2. Open Remix

Open:

```text
https://remix.ethereum.org/
```

Create a file:

```text
contracts/MemeRoastHistory.sol
```

Paste this contract:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MemeRoastHistory {
    event RoastRecorded(address indexed user, string metadataUri);

    function recordRoast(string memory _metadataUri) public {
        emit RoastRecorded(msg.sender, _metadataUri);
    }
}
```

## 3. Compile

In Remix:

1. Open `Solidity Compiler`.
2. Select compiler `0.8.20` or newer.
3. Click `Compile MemeRoastHistory.sol`.

## 4. Deploy

In Remix:

1. Open `Deploy & Run Transactions`.
2. Environment: `Injected Provider - MetaMask`.
3. Wallet network must be `Arc Testnet`.
4. Contract: `MemeRoastHistory`.
5. Click `Deploy`.
6. Confirm the transaction in wallet.

After deploy, copy the deployed contract address from `Deployed Contracts`.

The address must be a new contract address. Do not use the payment receiver
wallet address unless that exact address is actually the deployed contract.

## 5. Configure Local App

Create or update `.env.local`:

```bash
NEXT_PUBLIC_MEMEROAST_HISTORY_CONTRACT=0xYourDeployedContractAddress
```

Restart local dev server:

```bash
npm run dev
```

Now final generation flow will:

1. Send `0.05 USDC` payment.
2. Generate final meme.
3. Store metadata URL/CID/hash.
4. Ask wallet to sign `recordRoast(metadataUri)`.
5. Save the on-chain history tx hash in My History.

## 6. Configure Cloudflare Pages

In Cloudflare Dashboard:

1. Go to `Workers & Pages`.
2. Open project `memeroast`.
3. Go to `Settings`.
4. Open `Environment variables`.
5. Add:

```text
NEXT_PUBLIC_MEMEROAST_HISTORY_CONTRACT=0xYourDeployedContractAddress
```

6. Redeploy the project.

You can also deploy from this repo:

```bash
npm run build
npx wrangler pages deploy out --project-name memeroast --branch main --commit-dirty=true
```

## 7. Verify

After generating a final meme, open My History.

You should see:

```text
On-chain history: recorded
History tx 0x...
```

Click the tx link to view it on ArcScan:

```text
https://testnet.arcscan.app
```

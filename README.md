# Cosmos Meme Coin Launcher

A simple, user-friendly platform for launching meme coins on Cosmos Hub using the new permissionless smart contracts enabled by prop 1007. Based on https://github.com/BIG-Labs/cooking-contracts. This is in beta. Contracts should be expected to change and funds should be expected to be lost. This is simply a test deployment. Users of this software should expect to lost everything if they decide to interact with this application.

## Features

- **One-Click Launch**: Create your meme coin with just a name, symbol, and description
- **Fair Launch**: Built-in bonding curve for price discovery
- **Liquidity Management**: Automatic liquidity provision and trading
- **Simple UI**: Clean, intuitive interface for both creators and traders
- **Production Ready**: Built with security and reliability in mind

## Architecture

### Smart Contracts

- **Meme Factory**: Main contract for creating and managing meme coins
- **Meme Token**: Individual CW20-compatible meme coin contract
- **Shared Package**: Common types and utilities

### Frontend

- React-based web application
- Keplr wallet integration
- Real-time price updates
- Mobile-responsive design

## Deployed Contracts (Cosmos Hub)

The contracts are deployed and live on Cosmos Hub mainnet:

- **Meme Factory V2** (with withdraw function): `cosmos1pdguwgdtg225u22097a7wq7leuvulex8hxalr6hdtx6kqhq4sk7qew0k0y`
- **Meme Token Code ID**: `293`
- **Meme Factory V2 Code ID**: `295`

### Previous Versions
- **Meme Factory V1**: `cosmos1dm97n7hnztp73ctekf0a8qfnaqlggpz3mvn5c9kjhjfqzu8tl3uq3d2yd6` (Code ID: 294) - No withdraw function

### Contract Parameters

- **Creation Fee**: 0.1 ATOM
- **Platform Fee**: 2%
- **Min Target Raise**: 100 ATOM  
- **Max Target Raise**: 10,000 ATOM

## Getting Started

### Prerequisites

- Rust 1.70+
- Node.js 18+
- Docker (for optimized builds)
- Keplr wallet (for frontend interaction)

### Development

```bash
# Install Rust target
rustup target add wasm32-unknown-unknown

# Run tests
cargo test

# Build contracts
cargo wasm

# Optimize for production
docker run --rm -v "$(pwd)":/code \
  --mount type=volume,source="$(basename "$(pwd)")_cache",target=/target \
  --mount type=volume,source=registry_cache,target=/usr/local/cargo/registry \
  cosmwasm/optimizer:0.17.0
```

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

The frontend will connect to the deployed contracts on Cosmos Hub mainnet.

## License

MIT License - see LICENSE file for details.

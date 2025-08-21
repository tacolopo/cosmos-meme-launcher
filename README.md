# Cosmos Meme Coin Launcher 🚀

A simple, user-friendly platform for launching meme coins on Cosmos Hub using the new permissionless smart contracts enabled by prop 1007.

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

## Getting Started

### Prerequisites

- Rust 1.70+
- Node.js 18+
- Docker (for optimized builds)

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

## License

MIT License - see LICENSE file for details.

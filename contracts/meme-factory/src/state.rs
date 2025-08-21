use cosmwasm_std::Addr;
use cw_storage_plus::{Item, Map};
use meme_shared::{MemeToken, BondingCurveState, FactoryConfig};

pub const CONFIG: Item<FactoryConfig> = Item::new("config");
pub const MEME_COUNT: Item<u64> = Item::new("meme_count");
pub const MEME_TOKENS: Map<u64, MemeToken> = Map::new("meme_tokens");
pub const CREATOR_TOKENS: Map<&Addr, Vec<u64>> = Map::new("creator_tokens");
pub const BONDING_CURVES: Map<u64, BondingCurveState> = Map::new("bonding_curves");

// User balances for each token
pub const USER_BALANCES: Map<(u64, &Addr), cosmwasm_std::Uint128> = Map::new("user_balances");

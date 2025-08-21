use cosmwasm_std::Addr;
use cw_storage_plus::{Item, Map};

use crate::{MemeToken, BondingCurveState};

// Factory state
pub const CONFIG: Item<FactoryConfig> = Item::new("config");
pub const MEME_COUNT: Item<u64> = Item::new("meme_count");
pub const MEME_TOKENS: Map<u64, MemeToken> = Map::new("meme_tokens");
pub const CREATOR_TOKENS: Map<&Addr, Vec<u64>> = Map::new("creator_tokens");

// Individual meme token state
pub const TOKEN_CONFIG: Item<MemeToken> = Item::new("token_config");
pub const BONDING_CURVE: Item<BondingCurveState> = Item::new("bonding_curve");
pub const BALANCES: Map<&Addr, cosmwasm_std::Uint128> = Map::new("balances");

use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct FactoryConfig {
    pub owner: Addr,
    pub meme_token_code_id: u64,
    pub creation_fee: cosmwasm_std::Uint128,
    pub platform_fee_bps: u16, // basis points for trading fees
    pub min_target_raise: cosmwasm_std::Uint128,
    pub max_target_raise: cosmwasm_std::Uint128,
}

use cosmwasm_std::{Addr, Uint128};
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use meme_shared::{MemeTokenInfo, LaunchConfig, MemeToken};

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct InstantiateMsg {
    pub meme_token_code_id: u64,
    pub creation_fee: Uint128,
    pub platform_fee_bps: u16,
    pub min_target_raise: Uint128,
    pub max_target_raise: Uint128,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub enum ExecuteMsg {
    /// Create a new meme token
    CreateMemeToken {
        token_info: MemeTokenInfo,
        launch_config: Option<LaunchConfig>,
    },
    /// Buy tokens from bonding curve
    BuyTokens {
        token_id: u64,
        min_tokens_out: Uint128,
    },
    /// Sell tokens to bonding curve
    SellTokens {
        token_id: u64,
        token_amount: Uint128,
        min_atom_out: Uint128,
    },
    /// Launch token to DEX (when target raise is met)
    LaunchToken {
        token_id: u64,
    },
    /// Update factory config (owner only)
    UpdateConfig {
        meme_token_code_id: Option<u64>,
        creation_fee: Option<Uint128>,
        platform_fee_bps: Option<u16>,
        min_target_raise: Option<Uint128>,
        max_target_raise: Option<Uint128>,
    },
    /// Withdraw accumulated fees (owner only)
    WithdrawFees {
        amount: Option<Uint128>,
        recipient: Option<String>,
    },
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub enum QueryMsg {
    /// Get factory configuration
    Config {},
    /// Get meme token by ID
    MemeToken { token_id: u64 },
    /// Get all meme tokens (paginated)
    MemeTokens {
        start_after: Option<u64>,
        limit: Option<u32>,
    },
    /// Get meme tokens by creator
    MemeTokensByCreator {
        creator: String,
        start_after: Option<u64>,
        limit: Option<u32>,
    },
    /// Get quote for buying tokens
    BuyQuote {
        token_id: u64,
        atom_amount: Uint128,
    },
    /// Get quote for selling tokens
    SellQuote {
        token_id: u64,
        token_amount: Uint128,
    },
    /// Get user balance for a specific token
    UserBalance {
        token_id: u64,
        user: String,
    },
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct ConfigResponse {
    pub owner: Addr,
    pub meme_token_code_id: u64,
    pub creation_fee: Uint128,
    pub platform_fee_bps: u16,
    pub min_target_raise: Uint128,
    pub max_target_raise: Uint128,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct MemeTokenResponse {
    pub token: MemeToken,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct MemeTokensResponse {
    pub tokens: Vec<MemeToken>,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct QuoteResponse {
    pub amount_out: Uint128,
    pub price_impact: String, // percentage as string
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct UserBalanceResponse {
    pub balance: Uint128,
}

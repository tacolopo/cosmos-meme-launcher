use cosmwasm_std::{Addr, Uint128};
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct MemeTokenInfo {
    pub name: String,
    pub symbol: String,
    pub description: String,
    pub image_url: Option<String>,
    pub website: Option<String>,
    pub twitter: Option<String>,
    pub telegram: Option<String>,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct LaunchConfig {
    pub initial_supply: Uint128,
    pub target_raise: Uint128,
    pub creator_allocation_bps: u16, // basis points (100 = 1%)
}

impl Default for LaunchConfig {
    fn default() -> Self {
        Self {
            initial_supply: Uint128::new(1_000_000_000_000), // 1 trillion tokens
            target_raise: Uint128::new(1_000_000_000), // 1000 ATOM (assuming 6 decimals)
            creator_allocation_bps: 500, // 5% to creator
        }
    }
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct MemeToken {
    pub id: u64,
    pub contract_addr: Addr,
    pub creator: Addr,
    pub info: MemeTokenInfo,
    pub config: LaunchConfig,
    pub total_raised: Uint128,
    pub is_launched: bool,
    pub created_at: u64,
    pub launched_at: Option<u64>,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct BondingCurveState {
    pub virtual_atom_reserves: Uint128,
    pub virtual_token_reserves: Uint128,
    pub real_atom_reserves: Uint128,
    pub real_token_reserves: Uint128,
}

impl BondingCurveState {
    pub fn new(initial_supply: Uint128, target_raise: Uint128) -> Self {
        Self {
            virtual_atom_reserves: target_raise,
            virtual_token_reserves: initial_supply,
            real_atom_reserves: Uint128::zero(),
            real_token_reserves: initial_supply,
        }
    }

    /// Calculate tokens to receive for ATOM input using bonding curve
    pub fn get_tokens_out(&self, atom_in: Uint128) -> Result<Uint128, cosmwasm_std::StdError> {
        if atom_in.is_zero() {
            return Ok(Uint128::zero());
        }

        let total_atom = self.virtual_atom_reserves + self.real_atom_reserves;
        let total_tokens = self.virtual_token_reserves + self.real_token_reserves;

        // Using constant product formula: x * y = k
        // tokens_out = total_tokens - (k / (total_atom + atom_in))
        let k = total_atom.checked_mul(total_tokens)?;
        let new_atom_total = total_atom.checked_add(atom_in)?;
        let new_token_total = k.checked_div(new_atom_total)?;
        let tokens_out = total_tokens.checked_sub(new_token_total)?;

        Ok(tokens_out)
    }

    /// Calculate ATOM to receive for token input
    pub fn get_atom_out(&self, token_in: Uint128) -> Result<Uint128, cosmwasm_std::StdError> {
        if token_in.is_zero() {
            return Ok(Uint128::zero());
        }

        let total_atom = self.virtual_atom_reserves + self.real_atom_reserves;
        let total_tokens = self.virtual_token_reserves + self.real_token_reserves;

        // Using constant product formula: x * y = k
        let k = total_atom.checked_mul(total_tokens)?;
        let new_token_total = total_tokens.checked_add(token_in)?;
        let new_atom_total = k.checked_div(new_token_total)?;
        let atom_out = total_atom.checked_sub(new_atom_total)?;

        Ok(atom_out)
    }
}

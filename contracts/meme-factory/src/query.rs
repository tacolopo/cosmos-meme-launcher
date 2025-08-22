use cosmwasm_std::{to_json_binary, Binary, Deps, Env, StdResult, Uint128};
use meme_shared::ContractError;

use crate::msg::{ConfigResponse, MemeTokenResponse, MemeTokensResponse, QueryMsg, QuoteResponse};
use crate::state::{BONDING_CURVES, CONFIG, CREATOR_TOKENS, MEME_TOKENS};

pub fn query(deps: Deps, _env: Env, msg: QueryMsg) -> StdResult<Binary> {
    match msg {
        QueryMsg::Config {} => to_json_binary(&query_config(deps)?),
        QueryMsg::MemeToken { token_id } => to_json_binary(&query_meme_token(deps, token_id)?),
        QueryMsg::MemeTokens { start_after, limit } => {
            to_json_binary(&query_meme_tokens(deps, start_after, limit)?)
        }
        QueryMsg::MemeTokensByCreator {
            creator,
            start_after,
            limit,
        } => to_json_binary(&query_meme_tokens_by_creator(
            deps,
            creator,
            start_after,
            limit,
        )?),
        QueryMsg::BuyQuote {
            token_id,
            atom_amount,
        } => to_json_binary(&query_buy_quote(deps, token_id, atom_amount)?),
        QueryMsg::SellQuote {
            token_id,
            token_amount,
        } => to_json_binary(&query_sell_quote(deps, token_id, token_amount)?),
    }
}

fn query_config(deps: Deps) -> StdResult<ConfigResponse> {
    let config = CONFIG.load(deps.storage)?;
    Ok(ConfigResponse {
        owner: config.owner,
        meme_token_code_id: config.meme_token_code_id,
        creation_fee: config.creation_fee,
        platform_fee_bps: config.platform_fee_bps,
        min_target_raise: config.min_target_raise,
        max_target_raise: config.max_target_raise,
    })
}

fn query_meme_token(deps: Deps, token_id: u64) -> StdResult<MemeTokenResponse> {
    let token = MEME_TOKENS.load(deps.storage, token_id)?;
    Ok(MemeTokenResponse { token })
}

fn query_meme_tokens(
    deps: Deps,
    start_after: Option<u64>,
    limit: Option<u32>,
) -> StdResult<MemeTokensResponse> {
    let limit = limit.unwrap_or(30).min(100) as usize;
    let start = start_after.unwrap_or(0);

    let tokens: StdResult<Vec<_>> = MEME_TOKENS
        .range(deps.storage, None, None, cosmwasm_std::Order::Ascending)
        .skip_while(|res| res.as_ref().map_or(false, |(k, _)| *k <= start))
        .take(limit)
        .map(|item| item.map(|(_, token)| token))
        .collect();

    Ok(MemeTokensResponse { tokens: tokens? })
}

fn query_meme_tokens_by_creator(
    deps: Deps,
    creator: String,
    start_after: Option<u64>,
    limit: Option<u32>,
) -> StdResult<MemeTokensResponse> {
    let creator_addr = deps.api.addr_validate(&creator)?;
    let token_ids = CREATOR_TOKENS
        .may_load(deps.storage, &creator_addr)?
        .unwrap_or_default();

    let limit = limit.unwrap_or(30).min(100) as usize;
    let start = start_after.unwrap_or(0);

    let tokens: StdResult<Vec<_>> = token_ids
        .into_iter()
        .filter(|&id| id > start)
        .take(limit)
        .map(|id| MEME_TOKENS.load(deps.storage, id))
        .collect();

    Ok(MemeTokensResponse { tokens: tokens? })
}

fn query_buy_quote(deps: Deps, token_id: u64, atom_amount: Uint128) -> StdResult<QuoteResponse> {
    let bonding_curve = BONDING_CURVES.load(deps.storage, token_id)?;
    
    let tokens_out = bonding_curve.get_tokens_out(atom_amount)
        .map_err(|e| cosmwasm_std::StdError::generic_err(e.to_string()))?;

    // Calculate price impact
    let total_atom = bonding_curve.virtual_atom_reserves + bonding_curve.real_atom_reserves;
    let price_impact = if !total_atom.is_zero() {
        let impact = atom_amount
            .checked_mul(Uint128::new(10000))
            .map(|x| x.checked_div(total_atom).unwrap_or_default())
            .unwrap_or_default();
        format!("{:.2}%", impact.u128() as f64 / 100.0)
    } else {
        "0.00%".to_string()
    };

    Ok(QuoteResponse {
        amount_out: tokens_out,
        price_impact,
    })
}

fn query_sell_quote(deps: Deps, token_id: u64, token_amount: Uint128) -> StdResult<QuoteResponse> {
    let bonding_curve = BONDING_CURVES.load(deps.storage, token_id)?;
    
    let atom_out = bonding_curve.get_atom_out(token_amount)
        .map_err(|e| cosmwasm_std::StdError::generic_err(e.to_string()))?;

    // Calculate price impact
    let total_tokens = bonding_curve.virtual_token_reserves + bonding_curve.real_token_reserves;
    let price_impact = if !total_tokens.is_zero() {
        let impact = token_amount
            .checked_mul(Uint128::new(10000))
            .map(|x| x.checked_div(total_tokens).unwrap_or_default())
            .unwrap_or_default();
        format!("{:.2}%", impact.u128() as f64 / 100.0)
    } else {
        "0.00%".to_string()
    };

    Ok(QuoteResponse {
        amount_out: atom_out,
        price_impact,
    })
}

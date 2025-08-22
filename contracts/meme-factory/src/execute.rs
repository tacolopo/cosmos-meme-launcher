use cosmwasm_std::{
    coin, to_json_binary, BankMsg, CosmosMsg, DepsMut, Env, MessageInfo, Response, Uint128, WasmMsg,
};
use meme_shared::{BondingCurveState, ContractError, LaunchConfig, MemeToken, MemeTokenInfo};

use crate::msg::ExecuteMsg;
use crate::state::{BONDING_CURVES, CONFIG, CREATOR_TOKENS, MEME_COUNT, MEME_TOKENS, USER_BALANCES};

pub fn execute(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    msg: ExecuteMsg,
) -> Result<Response, ContractError> {
    match msg {
        ExecuteMsg::CreateMemeToken {
            token_info,
            launch_config,
        } => create_meme_token(deps, env, info, token_info, launch_config),
        ExecuteMsg::BuyTokens {
            token_id,
            min_tokens_out,
        } => buy_tokens(deps, env, info, token_id, min_tokens_out),
        ExecuteMsg::SellTokens {
            token_id,
            token_amount,
            min_atom_out,
        } => sell_tokens(deps, env, info, token_id, token_amount, min_atom_out),
        ExecuteMsg::LaunchToken { token_id } => launch_token(deps, env, info, token_id),
        ExecuteMsg::UpdateConfig {
            meme_token_code_id,
            creation_fee,
            platform_fee_bps,
            min_target_raise,
            max_target_raise,
        } => update_config(
            deps,
            info,
            meme_token_code_id,
            creation_fee,
            platform_fee_bps,
            min_target_raise,
            max_target_raise,
        ),
        ExecuteMsg::WithdrawFees { amount, recipient } => {
            withdraw_fees(deps, env, info, amount, recipient)
        }
    }
}

fn create_meme_token(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    token_info: MemeTokenInfo,
    launch_config: Option<LaunchConfig>,
) -> Result<Response, ContractError> {
    let config = CONFIG.load(deps.storage)?;

    // Check creation fee
    let sent_amount = info
        .funds
        .iter()
        .find(|coin| coin.denom == "uatom")
        .map(|coin| coin.amount)
        .unwrap_or_default();

    if sent_amount < config.creation_fee {
        return Err(ContractError::InsufficientFunds {
            required: config.creation_fee.to_string(),
            sent: sent_amount.to_string(),
        });
    }

    // Validate token info
    validate_token_info(&token_info)?;

    let launch_config = launch_config.unwrap_or_default();
    validate_launch_config(&launch_config, &config)?;

    // Get next token ID
    let token_id = MEME_COUNT.load(deps.storage)?;
    let next_id = token_id + 1;
    MEME_COUNT.save(deps.storage, &next_id)?;

    // Create meme token
    let meme_token = MemeToken {
        id: token_id,
        contract_addr: env.contract.address.clone(), // Will be updated when token contract is instantiated
        creator: info.sender.clone(),
        info: token_info.clone(),
        config: launch_config.clone(),
        total_raised: Uint128::zero(),
        is_launched: false,
        created_at: env.block.time.seconds(),
        launched_at: None,
    };

    // Initialize bonding curve
    let bonding_curve = BondingCurveState::new(launch_config.initial_supply, launch_config.target_raise);

    // Save state
    MEME_TOKENS.save(deps.storage, token_id, &meme_token)?;
    BONDING_CURVES.save(deps.storage, token_id, &bonding_curve)?;

    // Update creator's token list
    let mut creator_tokens = CREATOR_TOKENS
        .may_load(deps.storage, &info.sender)?
        .unwrap_or_default();
    creator_tokens.push(token_id);
    CREATOR_TOKENS.save(deps.storage, &info.sender, &creator_tokens)?;

    // Allocate creator tokens
    let creator_allocation = launch_config.initial_supply
        .checked_mul(Uint128::new(launch_config.creator_allocation_bps as u128))?
        .checked_div(Uint128::new(10000))?;

    if !creator_allocation.is_zero() {
        USER_BALANCES.save(deps.storage, (token_id, &info.sender), &creator_allocation)?;
    }

    Ok(Response::new()
        .add_attribute("method", "create_meme_token")
        .add_attribute("token_id", token_id.to_string())
        .add_attribute("creator", info.sender)
        .add_attribute("name", token_info.name)
        .add_attribute("symbol", token_info.symbol)
        .add_attribute("initial_supply", launch_config.initial_supply)
        .add_attribute("target_raise", launch_config.target_raise))
}

fn buy_tokens(
    deps: DepsMut,
    _env: Env,
    info: MessageInfo,
    token_id: u64,
    min_tokens_out: Uint128,
) -> Result<Response, ContractError> {
    let mut meme_token = MEME_TOKENS.load(deps.storage, token_id)?;
    
    if meme_token.is_launched {
        return Err(ContractError::TradingNotActive {});
    }

    let mut bonding_curve = BONDING_CURVES.load(deps.storage, token_id)?;

    // Get ATOM amount sent
    let atom_amount = info
        .funds
        .iter()
        .find(|coin| coin.denom == "uatom")
        .map(|coin| coin.amount)
        .unwrap_or_default();

    if atom_amount.is_zero() {
        return Err(ContractError::InvalidSwapAmount {});
    }

    // Calculate tokens out
    let tokens_out = bonding_curve.get_tokens_out(atom_amount)?;
    
    if tokens_out < min_tokens_out {
        return Err(ContractError::SlippageExceeded {});
    }

    // Update bonding curve state
    bonding_curve.real_atom_reserves = bonding_curve.real_atom_reserves.checked_add(atom_amount)?;
    bonding_curve.real_token_reserves = bonding_curve.real_token_reserves.checked_sub(tokens_out)?;

    // Update user balance
    let current_balance = USER_BALANCES
        .may_load(deps.storage, (token_id, &info.sender))?
        .unwrap_or_default();
    let new_balance = current_balance.checked_add(tokens_out)?;
    USER_BALANCES.save(deps.storage, (token_id, &info.sender), &new_balance)?;

    // Update total raised
    meme_token.total_raised = meme_token.total_raised.checked_add(atom_amount)?;

    // Save updated state
    BONDING_CURVES.save(deps.storage, token_id, &bonding_curve)?;
    MEME_TOKENS.save(deps.storage, token_id, &meme_token)?;

    Ok(Response::new()
        .add_attribute("method", "buy_tokens")
        .add_attribute("token_id", token_id.to_string())
        .add_attribute("buyer", info.sender)
        .add_attribute("atom_amount", atom_amount)
        .add_attribute("tokens_received", tokens_out))
}

fn sell_tokens(
    deps: DepsMut,
    _env: Env,
    info: MessageInfo,
    token_id: u64,
    token_amount: Uint128,
    min_atom_out: Uint128,
) -> Result<Response, ContractError> {
    let mut meme_token = MEME_TOKENS.load(deps.storage, token_id)?;
    
    if meme_token.is_launched {
        return Err(ContractError::TradingNotActive {});
    }

    let mut bonding_curve = BONDING_CURVES.load(deps.storage, token_id)?;

    // Check user balance
    let user_balance = USER_BALANCES
        .may_load(deps.storage, (token_id, &info.sender))?
        .unwrap_or_default();

    if user_balance < token_amount {
        return Err(ContractError::InsufficientFunds {
            required: token_amount.to_string(),
            sent: user_balance.to_string(),
        });
    }

    // Calculate ATOM out
    let atom_out = bonding_curve.get_atom_out(token_amount)?;
    
    if atom_out < min_atom_out {
        return Err(ContractError::SlippageExceeded {});
    }

    // Update bonding curve state
    bonding_curve.real_atom_reserves = bonding_curve.real_atom_reserves.checked_sub(atom_out)?;
    bonding_curve.real_token_reserves = bonding_curve.real_token_reserves.checked_add(token_amount)?;

    // Update user balance
    let new_balance = user_balance.checked_sub(token_amount)?;
    USER_BALANCES.save(deps.storage, (token_id, &info.sender), &new_balance)?;

    // Update total raised
    meme_token.total_raised = meme_token.total_raised.checked_sub(atom_out)?;

    // Save updated state
    BONDING_CURVES.save(deps.storage, token_id, &bonding_curve)?;
    MEME_TOKENS.save(deps.storage, token_id, &meme_token)?;

    // Send ATOM to user
    let send_msg = BankMsg::Send {
        to_address: info.sender.to_string(),
        amount: vec![coin(atom_out.u128(), "uatom")],
    };

    Ok(Response::new()
        .add_message(send_msg)
        .add_attribute("method", "sell_tokens")
        .add_attribute("token_id", token_id.to_string())
        .add_attribute("seller", info.sender)
        .add_attribute("tokens_sold", token_amount)
        .add_attribute("atom_received", atom_out))
}

fn launch_token(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    token_id: u64,
) -> Result<Response, ContractError> {
    let mut meme_token = MEME_TOKENS.load(deps.storage, token_id)?;

    if meme_token.is_launched {
        return Err(ContractError::TokenAlreadyLaunched {});
    }

    if meme_token.total_raised < meme_token.config.target_raise {
        return Err(ContractError::InvalidLaunchConfig {
            reason: "Target raise not met".to_string(),
        });
    }

    // Mark as launched
    meme_token.is_launched = true;
    meme_token.launched_at = Some(env.block.time.seconds());

    MEME_TOKENS.save(deps.storage, token_id, &meme_token)?;

    Ok(Response::new()
        .add_attribute("method", "launch_token")
        .add_attribute("token_id", token_id.to_string())
        .add_attribute("launcher", info.sender)
        .add_attribute("total_raised", meme_token.total_raised))
}

fn update_config(
    deps: DepsMut,
    info: MessageInfo,
    meme_token_code_id: Option<u64>,
    creation_fee: Option<Uint128>,
    platform_fee_bps: Option<u16>,
    min_target_raise: Option<Uint128>,
    max_target_raise: Option<Uint128>,
) -> Result<Response, ContractError> {
    let mut config = CONFIG.load(deps.storage)?;

    if info.sender != config.owner {
        return Err(ContractError::Unauthorized {});
    }

    if let Some(code_id) = meme_token_code_id {
        config.meme_token_code_id = code_id;
    }
    if let Some(fee) = creation_fee {
        config.creation_fee = fee;
    }
    if let Some(fee_bps) = platform_fee_bps {
        if fee_bps > 1000 {
            return Err(ContractError::InvalidLaunchConfig {
                reason: "Platform fee cannot exceed 10%".to_string(),
            });
        }
        config.platform_fee_bps = fee_bps;
    }
    if let Some(min_raise) = min_target_raise {
        config.min_target_raise = min_raise;
    }
    if let Some(max_raise) = max_target_raise {
        config.max_target_raise = max_raise;
    }

    CONFIG.save(deps.storage, &config)?;

    Ok(Response::new()
        .add_attribute("method", "update_config")
        .add_attribute("owner", info.sender))
}

fn validate_token_info(token_info: &MemeTokenInfo) -> Result<(), ContractError> {
    if token_info.name.is_empty() || token_info.name.len() > 64 {
        return Err(ContractError::InvalidTokenInfo {
            reason: "Name must be 1-64 characters".to_string(),
        });
    }

    if token_info.symbol.is_empty() || token_info.symbol.len() > 12 {
        return Err(ContractError::InvalidTokenInfo {
            reason: "Symbol must be 1-12 characters".to_string(),
        });
    }

    if token_info.description.len() > 500 {
        return Err(ContractError::InvalidTokenInfo {
            reason: "Description must be less than 500 characters".to_string(),
        });
    }

    Ok(())
}

fn validate_launch_config(
    config: &LaunchConfig,
    factory_config: &meme_shared::FactoryConfig,
) -> Result<(), ContractError> {
    if config.initial_supply.is_zero() {
        return Err(ContractError::InvalidLaunchConfig {
            reason: "Initial supply must be greater than zero".to_string(),
        });
    }

    if config.target_raise < factory_config.min_target_raise
        || config.target_raise > factory_config.max_target_raise
    {
        return Err(ContractError::InvalidLaunchConfig {
            reason: format!(
                "Target raise must be between {} and {}",
                factory_config.min_target_raise, factory_config.max_target_raise
            ),
        });
    }

    if config.creator_allocation_bps > 2000 {
        return Err(ContractError::InvalidLaunchConfig {
            reason: "Creator allocation cannot exceed 20%".to_string(),
        });
    }

    Ok(())
}

fn withdraw_fees(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    amount: Option<Uint128>,
    recipient: Option<String>,
) -> Result<Response, ContractError> {
    let config = CONFIG.load(deps.storage)?;

    // Only owner can withdraw fees
    if info.sender != config.owner {
        return Err(ContractError::Unauthorized {});
    }

    // Get contract balance
    let contract_balance = deps
        .querier
        .query_balance(&env.contract.address, "uatom")?;

    // Determine withdrawal amount
    let withdraw_amount = if let Some(amt) = amount {
        if amt > contract_balance.amount {
            return Err(ContractError::InsufficientFunds {
                required: amt.to_string(),
                sent: contract_balance.amount.to_string(),
            });
        }
        amt
    } else {
        // Withdraw all if no amount specified
        contract_balance.amount
    };

    if withdraw_amount.is_zero() {
        return Err(ContractError::InvalidSwapAmount {});
    }

    // Determine recipient (owner if not specified)
    let recipient_addr = if let Some(addr) = recipient {
        deps.api.addr_validate(&addr)?
    } else {
        config.owner
    };

    // Send funds
    let send_msg = BankMsg::Send {
        to_address: recipient_addr.to_string(),
        amount: vec![coin(withdraw_amount.u128(), "uatom")],
    };

    Ok(Response::new()
        .add_message(send_msg)
        .add_attribute("method", "withdraw_fees")
        .add_attribute("amount", withdraw_amount)
        .add_attribute("recipient", recipient_addr)
        .add_attribute("withdrawn_by", info.sender))
}

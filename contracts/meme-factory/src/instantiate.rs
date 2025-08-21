use cosmwasm_std::{DepsMut, Env, MessageInfo, Response};
use cw2::set_contract_version;
use meme_shared::{ContractError, FactoryConfig};

use crate::msg::InstantiateMsg;
use crate::state::{CONFIG, MEME_COUNT};

const CONTRACT_NAME: &str = "crates.io:meme-factory";
const CONTRACT_VERSION: &str = env!("CARGO_PKG_VERSION");

pub fn instantiate(
    deps: DepsMut,
    _env: Env,
    info: MessageInfo,
    msg: InstantiateMsg,
) -> Result<Response, ContractError> {
    set_contract_version(deps.storage, CONTRACT_NAME, CONTRACT_VERSION)?;

    // Validate inputs
    if msg.platform_fee_bps > 1000 {
        return Err(ContractError::InvalidLaunchConfig {
            reason: "Platform fee cannot exceed 10%".to_string(),
        });
    }

    if msg.min_target_raise >= msg.max_target_raise {
        return Err(ContractError::InvalidLaunchConfig {
            reason: "Min target raise must be less than max target raise".to_string(),
        });
    }

    let config = FactoryConfig {
        owner: info.sender.clone(),
        meme_token_code_id: msg.meme_token_code_id,
        creation_fee: msg.creation_fee,
        platform_fee_bps: msg.platform_fee_bps,
        min_target_raise: msg.min_target_raise,
        max_target_raise: msg.max_target_raise,
    };

    CONFIG.save(deps.storage, &config)?;
    MEME_COUNT.save(deps.storage, &0u64)?;

    Ok(Response::new()
        .add_attribute("method", "instantiate")
        .add_attribute("owner", info.sender)
        .add_attribute("meme_token_code_id", msg.meme_token_code_id.to_string())
        .add_attribute("creation_fee", msg.creation_fee)
        .add_attribute("platform_fee_bps", msg.platform_fee_bps.to_string()))
}

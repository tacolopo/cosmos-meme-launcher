use cosmwasm_std::{
    entry_point, to_json_binary, Binary, Deps, DepsMut, Env, MessageInfo, Response, StdResult,
};
use cw20_base::{
    contract::{execute as cw20_execute, instantiate as cw20_instantiate, query as cw20_query},
    msg::{ExecuteMsg, InstantiateMsg, QueryMsg},
};
use meme_shared::ContractError;

#[entry_point]
pub fn instantiate(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    msg: InstantiateMsg,
) -> Result<Response, ContractError> {
    cw20_instantiate(deps, env, info, msg).map_err(ContractError::from)
}

#[entry_point]
pub fn execute(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    msg: ExecuteMsg,
) -> Result<Response, ContractError> {
    cw20_execute(deps, env, info, msg).map_err(ContractError::from)
}

#[entry_point]
pub fn query(deps: Deps, env: Env, msg: QueryMsg) -> StdResult<Binary> {
    cw20_query(deps, env, msg)
}

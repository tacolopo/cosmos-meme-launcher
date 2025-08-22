use cosmwasm_std::{StdError, OverflowError, DivideByZeroError};
use thiserror::Error;

#[derive(Error, Debug)]
pub enum ContractError {
    #[error("{0}")]
    Std(#[from] StdError),

    #[error("{0}")]
    Overflow(#[from] OverflowError),

    #[error("{0}")]
    DivideByZero(#[from] DivideByZeroError),

    #[error("Unauthorized")]
    Unauthorized {},

    #[error("Invalid token info: {reason}")]
    InvalidTokenInfo { reason: String },

    #[error("Invalid launch config: {reason}")]
    InvalidLaunchConfig { reason: String },

    #[error("Insufficient funds: required {required}, sent {sent}")]
    InsufficientFunds { required: String, sent: String },

    #[error("Token already launched")]
    TokenAlreadyLaunched {},

    #[error("Token not found")]
    TokenNotFound {},

    #[error("Trading not active")]
    TradingNotActive {},

    #[error("Slippage tolerance exceeded")]
    SlippageExceeded {},

    #[error("Invalid swap amount")]
    InvalidSwapAmount {},

    #[error("Insufficient liquidity")]
    InsufficientLiquidity {},
}

// CW20 base error conversion - only enabled when cw20-base feature is active
#[cfg(feature = "cw20-base")]
impl From<cw20_base::ContractError> for ContractError {
    fn from(err: cw20_base::ContractError) -> Self {
        ContractError::Std(cosmwasm_std::StdError::generic_err(err.to_string()))
    }
}

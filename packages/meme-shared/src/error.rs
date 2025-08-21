use cosmwasm_std::StdError;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum ContractError {
    #[error("{0}")]
    Std(#[from] StdError),

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

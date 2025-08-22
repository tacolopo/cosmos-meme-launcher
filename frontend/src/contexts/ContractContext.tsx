import React, { createContext, useContext, ReactNode } from 'react';
import { useWallet } from './WalletContext';
import { CONTRACTS } from '../config/contracts';

interface ContractContextType {
  factoryAddress: string;
  executeContract: (msg: any, funds?: any[]) => Promise<any>;
  queryContract: (msg: any) => Promise<any>;
}

const ContractContext = createContext<ContractContextType | undefined>(undefined);

export const useContract = () => {
  const context = useContext(ContractContext);
  if (!context) {
    throw new Error('useContract must be used within a ContractProvider');
  }
  return context;
};

interface ContractProviderProps {
  children: ReactNode;
}

export const ContractProvider: React.FC<ContractProviderProps> = ({ children }) => {
  const { client, address } = useWallet();
  
  // Use deployed contract address from config
  const factoryAddress = CONTRACTS.MEME_FACTORY;

  const executeContract = async (msg: any, funds: any[] = []) => {
    if (!client || !address) {
      throw new Error('Wallet not connected');
    }

    const fee = {
      amount: [{ denom: CONTRACTS.DENOM, amount: '15000' }], // Updated gas fee
      gas: '600000', // Increased gas limit for contract execution
    };

    return await client.execute(address, factoryAddress, msg, fee, '', funds);
  };

  const queryContract = async (msg: any) => {
    if (!client) {
      throw new Error('Wallet not connected');
    }

    return await client.queryContractSmart(factoryAddress, msg);
  };

  const value = {
    factoryAddress,
    executeContract,
    queryContract,
  };

  return (
    <ContractContext.Provider value={value}>
      {children}
    </ContractContext.Provider>
  );
};

import React, { createContext, useContext, ReactNode } from 'react';
import { useWallet } from './WalletContext';

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
  
  // TODO: Replace with actual deployed contract address
  const factoryAddress = 'cosmos1...'; // Will be set after deployment

  const executeContract = async (msg: any, funds: any[] = []) => {
    if (!client || !address) {
      throw new Error('Wallet not connected');
    }

    const fee = {
      amount: [{ denom: 'uatom', amount: '5000' }],
      gas: '200000',
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

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import { GasPrice } from '@cosmjs/stargate';

interface WalletContextType {
  isConnected: boolean;
  address: string | null;
  client: SigningCosmWasmClient | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  isConnecting: boolean;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [client, setClient] = useState<SigningCosmWasmClient | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const connect = async () => {
    setIsConnecting(true);
    try {
      if (!window.keplr) {
        throw new Error('Keplr wallet not found');
      }

      const chainId = 'cosmoshub-4';
      await window.keplr.enable(chainId);

      const offlineSigner = window.keplr.getOfflineSigner(chainId);
      const accounts = await offlineSigner.getAccounts();
      
      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const rpcEndpoint = 'https://cosmos-rpc.publicnode.com:443'; // Using memory preference
      const gasPrice = GasPrice.fromString('0.025uatom');

      const cosmWasmClient = await SigningCosmWasmClient.connectWithSigner(
        rpcEndpoint,
        offlineSigner,
        { gasPrice }
      );

      setClient(cosmWasmClient);
      setAddress(accounts[0].address);
      setIsConnected(true);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setClient(null);
    setAddress(null);
    setIsConnected(false);
  };

  useEffect(() => {
    // Auto-connect if Keplr is available and user was previously connected
    const autoConnect = async () => {
      if (window.keplr && localStorage.getItem('cosmos-meme-wallet-connected')) {
        try {
          await connect();
        } catch (error) {
          console.error('Auto-connect failed:', error);
          localStorage.removeItem('cosmos-meme-wallet-connected');
        }
      }
    };

    autoConnect();
  }, []);

  useEffect(() => {
    if (isConnected) {
      localStorage.setItem('cosmos-meme-wallet-connected', 'true');
    } else {
      localStorage.removeItem('cosmos-meme-wallet-connected');
    }
  }, [isConnected]);

  const value = {
    isConnected,
    address,
    client,
    connect,
    disconnect,
    isConnecting,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

// Extend the Window interface to include Keplr
declare global {
  interface Window {
    keplr: any;
  }
}

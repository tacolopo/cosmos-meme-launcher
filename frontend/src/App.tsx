import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box } from '@chakra-ui/react';
import { WalletProvider } from './contexts/WalletContext';
import { ContractProvider } from './contexts/ContractContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Launch from './pages/Launch';
import Trade from './pages/Trade';
import Portfolio from './pages/Portfolio';

function App() {
  return (
    <WalletProvider>
      <ContractProvider>
        <Box minH="100vh" bg="gray.900">
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/launch" element={<Launch />} />
              <Route path="/trade/:tokenId?" element={<Trade />} />
              <Route path="/portfolio" element={<Portfolio />} />
            </Routes>
          </Layout>
        </Box>
      </ContractProvider>
    </WalletProvider>
  );
}

export default App;

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardBody,
  VStack,
  HStack,
  Text,
  Button,
  Input,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Badge,
  Progress,
  Image,
  Heading,
  useColorModeValue,
  useToast,
  NumberInput,
  NumberInputField,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
} from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useWallet } from '../contexts/WalletContext';
import { useContract } from '../contexts/ContractContext';

interface MemeToken {
  id: number;
  info: {
    name: string;
    symbol: string;
    description: string;
    image_url?: string;
  };
  creator: string;
  total_raised: string;
  is_launched: boolean;
  config: {
    target_raise: string;
    initial_supply: string;
  };
}

const Trade: React.FC = () => {
  const { tokenId } = useParams<{ tokenId: string }>();
  const [selectedToken, setSelectedToken] = useState<MemeToken | null>(null);
  const [tokens, setTokens] = useState<MemeToken[]>([]);
  const [buyAmount, setBuyAmount] = useState('');
  const [sellAmount, setSellAmount] = useState('');
  const [buyQuote, setBuyQuote] = useState<any>(null);
  const [sellQuote, setSellQuote] = useState<any>(null);
  const [isTrading, setIsTrading] = useState(false);
  const [userBalance, setUserBalance] = useState('0');

  const { isConnected, connect } = useWallet();
  const { queryContract, executeContract } = useContract();
  const toast = useToast();

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Demo chart data
  const chartData = [
    { time: '00:00', price: 0.001 },
    { time: '04:00', price: 0.0015 },
    { time: '08:00', price: 0.0012 },
    { time: '12:00', price: 0.0018 },
    { time: '16:00', price: 0.0025 },
    { time: '20:00', price: 0.0022 },
    { time: '24:00', price: 0.0028 },
  ];

  useEffect(() => {
    loadTokens();
  }, [isConnected]);

  useEffect(() => {
    if (tokenId && tokens.length > 0) {
      const token = tokens.find(t => t.id === parseInt(tokenId));
      if (token) {
        setSelectedToken(token);
      }
    } else if (!tokenId && tokens.length > 0) {
      setSelectedToken(tokens[0]);
    }
  }, [tokenId, tokens]);

  useEffect(() => {
    if (buyAmount && selectedToken) {
      getBuyQuote();
    }
  }, [buyAmount, selectedToken]);

  useEffect(() => {
    if (sellAmount && selectedToken) {
      getSellQuote();
    }
  }, [sellAmount, selectedToken]);

  const loadTokens = async () => {
    if (!isConnected) {
      // No demo data - show empty state
      setTokens([]);
      return;
    }

    try {
      const response = await queryContract({
        meme_tokens: { limit: 50 }
      });
      setTokens(response.tokens || []);
    } catch (error) {
      console.error('Failed to load tokens:', error);
    }
  };

  const getBuyQuote = async () => {
    if (!selectedToken || !buyAmount || !isConnected) return;

    try {
      const response = await queryContract({
        buy_quote: {
          token_id: selectedToken.id,
          atom_amount: (parseFloat(buyAmount) * 1000000).toString()
        }
      });
      setBuyQuote(response);
    } catch (error) {
      console.error('Failed to get buy quote:', error);
    }
  };

  const getSellQuote = async () => {
    if (!selectedToken || !sellAmount || !isConnected) return;

    try {
      const response = await queryContract({
        sell_quote: {
          token_id: selectedToken.id,
          token_amount: sellAmount
        }
      });
      setSellQuote(response);
    } catch (error) {
      console.error('Failed to get sell quote:', error);
    }
  };

  const handleBuy = async () => {
    if (!selectedToken || !buyAmount || !isConnected) return;

    setIsTrading(true);
    try {
      const msg = {
        buy_tokens: {
          token_id: selectedToken.id,
          min_tokens_out: buyQuote?.amount_out || '0'
        }
      };

      const funds = [{
        denom: 'uatom',
        amount: (parseFloat(buyAmount) * 1000000).toString()
      }];

      await executeContract(msg, funds);

      toast({
        title: 'Purchase successful! 🎉',
        description: `You bought ${selectedToken.info.symbol} tokens!`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      setBuyAmount('');
      setBuyQuote(null);
    } catch (error) {
      console.error('Buy failed:', error);
      toast({
        title: 'Purchase failed',
        description: 'Failed to buy tokens. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsTrading(false);
    }
  };

  const handleSell = async () => {
    if (!selectedToken || !sellAmount || !isConnected) return;

    setIsTrading(true);
    try {
      const msg = {
        sell_tokens: {
          token_id: selectedToken.id,
          token_amount: sellAmount,
          min_atom_out: sellQuote?.amount_out || '0'
        }
      };

      await executeContract(msg);

      toast({
        title: 'Sale successful! 💰',
        description: `You sold ${selectedToken.info.symbol} tokens!`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      setSellAmount('');
      setSellQuote(null);
    } catch (error) {
      console.error('Sell failed:', error);
      toast({
        title: 'Sale failed',
        description: 'Failed to sell tokens. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsTrading(false);
    }
  };

  const formatAmount = (amount: string) => {
    const num = parseFloat(amount) / 1000000;
    return num.toFixed(2);
  };

  const calculateProgress = (raised: string, target: string) => {
    const raisedNum = parseFloat(raised);
    const targetNum = parseFloat(target);
    return Math.min((raisedNum / targetNum) * 100, 100);
  };

  if (!isConnected) {
    return (
      <Box textAlign="center" py={10}>
        <VStack spacing={6}>
          <Heading size="lg">Connect Your Wallet</Heading>
          <Text color="gray.400">
            You need to connect your wallet to trade meme coins
          </Text>
          <Button colorScheme="brand" onClick={connect}>
            Connect Wallet
          </Button>
        </VStack>
      </Box>
    );
  }

  if (!selectedToken) {
    return (
      <Box textAlign="center" py={10}>
        <Text>Loading...</Text>
      </Box>
    );
  }

  return (
    <Grid templateColumns={{ base: '1fr', lg: '1fr 400px' }} gap={8}>
      {/* Main Trading Area */}
      <VStack spacing={6} align="stretch">
        {/* Token Header */}
        <Card bg={cardBg} borderColor={borderColor}>
          <CardBody>
            <HStack spacing={4} align="start">
              {selectedToken.info.image_url ? (
                <Image
                  src={selectedToken.info.image_url}
                  alt={selectedToken.info.name}
                  boxSize="80px"
                  borderRadius="full"
                  fallbackSrc="https://via.placeholder.com/80?text=🪙"
                />
              ) : (
                <Box
                  boxSize="80px"
                  borderRadius="full"
                  bg="brand.500"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  fontSize="2xl"
                >
                  🪙
                </Box>
              )}
              
              <VStack align="start" spacing={2} flex={1}>
                <HStack>
                  <Heading size="lg">{selectedToken.info.name}</Heading>
                  <Badge colorScheme="brand" fontSize="md">${selectedToken.info.symbol}</Badge>
                  <Badge colorScheme={selectedToken.is_launched ? 'green' : 'blue'}>
                    {selectedToken.is_launched ? 'Launched' : 'Raising Funds'}
                  </Badge>
                </HStack>
                
                <Text color="gray.400">{selectedToken.info.description}</Text>
                
                <HStack spacing={8}>
                  <Stat size="sm">
                    <StatLabel>Raised</StatLabel>
                    <StatNumber>{formatAmount(selectedToken.total_raised)} ATOM</StatNumber>
                    <StatHelpText>
                      {calculateProgress(selectedToken.total_raised, selectedToken.config.target_raise).toFixed(1)}% of target
                    </StatHelpText>
                  </Stat>
                  
                  <Stat size="sm">
                    <StatLabel>Target</StatLabel>
                    <StatNumber>{formatAmount(selectedToken.config.target_raise)} ATOM</StatNumber>
                  </Stat>
                </HStack>
                
                <Progress
                  value={calculateProgress(selectedToken.total_raised, selectedToken.config.target_raise)}
                  colorScheme="brand"
                  w="100%"
                  borderRadius="full"
                />
              </VStack>
            </HStack>
          </CardBody>
        </Card>

        {/* Price Chart */}
        <Card bg={cardBg} borderColor={borderColor}>
          <CardBody>
            <Heading size="md" mb={4}>Price Chart</Heading>
            <Box h="300px">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="time" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="#0EA5E9"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </CardBody>
        </Card>

        {/* Trading Interface */}
        <Card bg={cardBg} borderColor={borderColor}>
          <CardBody>
            <Tabs colorScheme="brand">
              <TabList>
                <Tab>Buy</Tab>
                <Tab>Sell</Tab>
              </TabList>
              
              <TabPanels>
                <TabPanel px={0}>
                  <VStack spacing={4} align="stretch">
                    <Text fontWeight="semibold">Buy {selectedToken.info.symbol}</Text>
                    
                    <HStack>
                      <NumberInput
                        value={buyAmount}
                        onChange={setBuyAmount}
                        min={0}
                        step={0.1}
                        flex={1}
                      >
                        <NumberInputField placeholder="0.0" />
                      </NumberInput>
                      <Text minW="60px">ATOM</Text>
                    </HStack>
                    
                    {buyQuote && (
                      <Box p={3} bg="gray.700" borderRadius="md">
                        <VStack align="start" spacing={1}>
                          <HStack justify="space-between" w="100%">
                            <Text fontSize="sm">You'll receive:</Text>
                            <Text fontSize="sm" fontWeight="bold">
                              {parseFloat(buyQuote.amount_out).toLocaleString()} {selectedToken.info.symbol}
                            </Text>
                          </HStack>
                          <HStack justify="space-between" w="100%">
                            <Text fontSize="sm">Price impact:</Text>
                            <Text fontSize="sm" color="yellow.400">{buyQuote.price_impact}</Text>
                          </HStack>
                        </VStack>
                      </Box>
                    )}
                    
                    <Button
                      colorScheme="green"
                      onClick={handleBuy}
                      isLoading={isTrading}
                      disabled={!buyAmount || parseFloat(buyAmount) <= 0}
                    >
                      Buy {selectedToken.info.symbol}
                    </Button>
                  </VStack>
                </TabPanel>
                
                <TabPanel px={0}>
                  <VStack spacing={4} align="stretch">
                    <Text fontWeight="semibold">Sell {selectedToken.info.symbol}</Text>
                    
                    <HStack>
                      <NumberInput
                        value={sellAmount}
                        onChange={setSellAmount}
                        min={0}
                        flex={1}
                      >
                        <NumberInputField placeholder="0" />
                      </NumberInput>
                      <Text minW="60px">{selectedToken.info.symbol}</Text>
                    </HStack>
                    
                    <Text fontSize="sm" color="gray.400">
                      Balance: {parseFloat(userBalance).toLocaleString()} {selectedToken.info.symbol}
                    </Text>
                    
                    {sellQuote && (
                      <Box p={3} bg="gray.700" borderRadius="md">
                        <VStack align="start" spacing={1}>
                          <HStack justify="space-between" w="100%">
                            <Text fontSize="sm">You'll receive:</Text>
                            <Text fontSize="sm" fontWeight="bold">
                              {(parseFloat(sellQuote.amount_out) / 1000000).toFixed(6)} ATOM
                            </Text>
                          </HStack>
                          <HStack justify="space-between" w="100%">
                            <Text fontSize="sm">Price impact:</Text>
                            <Text fontSize="sm" color="yellow.400">{sellQuote.price_impact}</Text>
                          </HStack>
                        </VStack>
                      </Box>
                    )}
                    
                    <Button
                      colorScheme="red"
                      onClick={handleSell}
                      isLoading={isTrading}
                      disabled={!sellAmount || parseFloat(sellAmount) <= 0}
                    >
                      Sell {selectedToken.info.symbol}
                    </Button>
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </CardBody>
        </Card>
      </VStack>

      {/* Sidebar */}
      <VStack spacing={6} align="stretch">
        {/* Token List */}
        <Card bg={cardBg} borderColor={borderColor}>
          <CardBody>
            <Heading size="md" mb={4}>Available Tokens</Heading>
            <VStack spacing={3} align="stretch">
              {tokens.map((token) => (
                <Box
                  key={token.id}
                  p={3}
                  borderRadius="md"
                  bg={selectedToken?.id === token.id ? 'brand.500' : 'gray.700'}
                  cursor="pointer"
                  onClick={() => setSelectedToken(token)}
                  _hover={{ bg: selectedToken?.id === token.id ? 'brand.600' : 'gray.600' }}
                >
                  <HStack justify="space-between">
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="bold" fontSize="sm">{token.info.name}</Text>
                      <Text fontSize="xs" color="gray.400">${token.info.symbol}</Text>
                    </VStack>
                    <Badge colorScheme={token.is_launched ? 'green' : 'blue'} size="sm">
                      {token.is_launched ? 'Live' : 'Raising'}
                    </Badge>
                  </HStack>
                </Box>
              ))}
            </VStack>
          </CardBody>
        </Card>

        {/* Quick Stats */}
        <Card bg={cardBg} borderColor={borderColor}>
          <CardBody>
            <Heading size="md" mb={4}>Market Stats</Heading>
            <VStack spacing={4} align="stretch">
              <Stat size="sm">
                <StatLabel>24h Volume</StatLabel>
                <StatNumber>-- ATOM</StatNumber>
                <StatHelpText>Coming soon</StatHelpText>
              </Stat>
              
              <Stat size="sm">
                <StatLabel>Active Traders</StatLabel>
                <StatNumber>--</StatNumber>
                <StatHelpText>Coming soon</StatHelpText>
              </Stat>
              
              <Stat size="sm">
                <StatLabel>Total Raised</StatLabel>
                <StatNumber>{selectedToken ? formatAmount(selectedToken.total_raised) : '--'} ATOM</StatNumber>
                <StatHelpText>Current token</StatHelpText>
              </Stat>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Grid>
  );
};

export default Trade;

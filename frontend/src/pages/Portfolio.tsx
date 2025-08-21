import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardBody,
  VStack,
  HStack,
  Text,
  Badge,
  Heading,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Image,
  Button,
  useColorModeValue,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { useWallet } from '../contexts/WalletContext';
import { useContract } from '../contexts/ContractContext';

interface UserToken {
  id: number;
  name: string;
  symbol: string;
  balance: string;
  value: number;
  change24h: number;
  image_url?: string;
}

interface CreatedToken {
  id: number;
  name: string;
  symbol: string;
  total_raised: string;
  target_raise: string;
  is_launched: boolean;
  created_at: number;
}

const Portfolio: React.FC = () => {
  const [userTokens, setUserTokens] = useState<UserToken[]>([]);
  const [createdTokens, setCreatedTokens] = useState<CreatedToken[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  const [totalPnL, setTotalPnL] = useState(0);

  const { isConnected, address, connect } = useWallet();
  const { queryContract } = useContract();

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const COLORS = ['#0EA5E9', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444'];

  useEffect(() => {
    if (isConnected && address) {
      loadPortfolioData();
    } else {
      // Show demo data when not connected
      setUserTokens([
        {
          id: 1,
          name: 'CosmoDoge',
          symbol: 'CDOGE',
          balance: '1500000',
          value: 45.67,
          change24h: 12.5,
          image_url: 'https://via.placeholder.com/40?text=🐕',
        },
        {
          id: 2,
          name: 'AtomCat',
          symbol: 'ACAT',
          balance: '750000',
          value: 23.45,
          change24h: -5.2,
          image_url: 'https://via.placeholder.com/40?text=🐱',
        },
        {
          id: 3,
          name: 'RocketMoon',
          symbol: 'MOON',
          balance: '2000000',
          value: 89.12,
          change24h: 34.7,
          image_url: 'https://via.placeholder.com/40?text=🚀',
        },
      ]);

      setCreatedTokens([
        {
          id: 1,
          name: 'CosmoDoge',
          symbol: 'CDOGE',
          total_raised: '500000000',
          target_raise: '1000000000',
          is_launched: false,
          created_at: Date.now() - 86400000, // 1 day ago
        },
      ]);

      setTotalValue(158.24);
      setTotalPnL(15.67);
    }
  }, [isConnected, address]);

  const loadPortfolioData = async () => {
    try {
      // Load user's created tokens
      const createdResponse = await queryContract({
        meme_tokens_by_creator: {
          creator: address,
          limit: 50
        }
      });
      setCreatedTokens(createdResponse.tokens || []);

      // TODO: Load user balances for each token
      // This would require querying each token contract individually
      
    } catch (error) {
      console.error('Failed to load portfolio:', error);
    }
  };

  const formatAmount = (amount: string) => {
    const num = parseFloat(amount);
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(2)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(2)}K`;
    }
    return num.toFixed(0);
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const pieData = userTokens.map((token, index) => ({
    name: token.symbol,
    value: token.value,
    color: COLORS[index % COLORS.length],
  }));

  const performanceData = userTokens.map(token => ({
    name: token.symbol,
    value: token.value,
    change: token.change24h,
  }));

  if (!isConnected) {
    return (
      <Box textAlign="center" py={10}>
        <VStack spacing={6}>
          <Heading size="lg">Connect Your Wallet</Heading>
          <Text color="gray.400">
            You need to connect your wallet to view your portfolio
          </Text>
          <Button colorScheme="brand" onClick={connect}>
            Connect Wallet
          </Button>
        </VStack>
      </Box>
    );
  }

  return (
    <VStack spacing={8} align="stretch">
      <Box>
        <Heading size="xl" mb={2}>Your Portfolio</Heading>
        <Text color="gray.400">Track your meme coin investments and creations</Text>
      </Box>

      {/* Portfolio Overview */}
      <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={6}>
        <Card bg={cardBg} borderColor={borderColor}>
          <CardBody>
            <Stat>
              <StatLabel>Total Portfolio Value</StatLabel>
              <StatNumber>{formatCurrency(totalValue)}</StatNumber>
              <StatHelpText color={totalPnL >= 0 ? 'green.400' : 'red.400'}>
                {totalPnL >= 0 ? '+' : ''}{formatCurrency(totalPnL)} (
                {((totalPnL / (totalValue - totalPnL)) * 100).toFixed(2)}%)
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={cardBg} borderColor={borderColor}>
          <CardBody>
            <Stat>
              <StatLabel>Tokens Owned</StatLabel>
              <StatNumber>{userTokens.length}</StatNumber>
              <StatHelpText>Across {userTokens.length} different meme coins</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={cardBg} borderColor={borderColor}>
          <CardBody>
            <Stat>
              <StatLabel>Tokens Created</StatLabel>
              <StatNumber>{createdTokens.length}</StatNumber>
              <StatHelpText>
                {createdTokens.filter(t => t.is_launched).length} launched successfully
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </Grid>

      <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={8}>
        {/* Holdings Table */}
        <Card bg={cardBg} borderColor={borderColor}>
          <CardBody>
            <Heading size="md" mb={4}>Your Holdings</Heading>
            {userTokens.length > 0 ? (
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Token</Th>
                    <Th isNumeric>Balance</Th>
                    <Th isNumeric>Value</Th>
                    <Th isNumeric>24h Change</Th>
                    <Th>Action</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {userTokens.map((token) => (
                    <Tr key={token.id}>
                      <Td>
                        <HStack>
                          {token.image_url ? (
                            <Image
                              src={token.image_url}
                              alt={token.name}
                              boxSize="32px"
                              borderRadius="full"
                              fallbackSrc="https://via.placeholder.com/32?text=🪙"
                            />
                          ) : (
                            <Box
                              boxSize="32px"
                              borderRadius="full"
                              bg="brand.500"
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              fontSize="sm"
                            >
                              🪙
                            </Box>
                          )}
                          <VStack align="start" spacing={0}>
                            <Text fontWeight="semibold" fontSize="sm">{token.name}</Text>
                            <Text fontSize="xs" color="gray.400">${token.symbol}</Text>
                          </VStack>
                        </HStack>
                      </Td>
                      <Td isNumeric>{formatAmount(token.balance)}</Td>
                      <Td isNumeric>{formatCurrency(token.value)}</Td>
                      <Td isNumeric>
                        <Text color={token.change24h >= 0 ? 'green.400' : 'red.400'}>
                          {token.change24h >= 0 ? '+' : ''}{token.change24h.toFixed(2)}%
                        </Text>
                      </Td>
                      <Td>
                        <Button
                          as={RouterLink}
                          to={`/trade/${token.id}`}
                          size="sm"
                          colorScheme="brand"
                          variant="outline"
                        >
                          Trade
                        </Button>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            ) : (
              <Box textAlign="center" py={8}>
                <Text color="gray.400" mb={4}>You don't own any meme coins yet</Text>
                <Button as={RouterLink} to="/trade" colorScheme="brand">
                  Start Trading
                </Button>
              </Box>
            )}
          </CardBody>
        </Card>

        {/* Portfolio Distribution */}
        <VStack spacing={6} align="stretch">
          <Card bg={cardBg} borderColor={borderColor}>
            <CardBody>
              <Heading size="md" mb={4}>Portfolio Distribution</Heading>
              {pieData.length > 0 ? (
                <Box h="200px">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              ) : (
                <Text color="gray.400" textAlign="center">No holdings to display</Text>
              )}
            </CardBody>
          </Card>

          <Card bg={cardBg} borderColor={borderColor}>
            <CardBody>
              <Heading size="md" mb={4}>Performance</Heading>
              {performanceData.length > 0 ? (
                <Box h="200px">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="name" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1F2937',
                          border: '1px solid #374151',
                          borderRadius: '8px',
                        }}
                        formatter={(value) => [`${value}%`, '24h Change']}
                      />
                      <Bar dataKey="change" fill="#0EA5E9" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              ) : (
                <Text color="gray.400" textAlign="center">No data to display</Text>
              )}
            </CardBody>
          </Card>
        </VStack>
      </Grid>

      {/* Created Tokens */}
      {createdTokens.length > 0 && (
        <Card bg={cardBg} borderColor={borderColor}>
          <CardBody>
            <Heading size="md" mb={4}>Your Created Tokens</Heading>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Token</Th>
                  <Th isNumeric>Raised</Th>
                  <Th isNumeric>Target</Th>
                  <Th>Status</Th>
                  <Th>Created</Th>
                  <Th>Action</Th>
                </Tr>
              </Thead>
              <Tbody>
                {createdTokens.map((token) => (
                  <Tr key={token.id}>
                    <Td>
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="semibold">{token.name}</Text>
                        <Text fontSize="sm" color="gray.400">${token.symbol}</Text>
                      </VStack>
                    </Td>
                    <Td isNumeric>{(parseFloat(token.total_raised) / 1000000).toFixed(0)} ATOM</Td>
                    <Td isNumeric>{(parseFloat(token.target_raise) / 1000000).toFixed(0)} ATOM</Td>
                    <Td>
                      <Badge colorScheme={token.is_launched ? 'green' : 'blue'}>
                        {token.is_launched ? 'Launched' : 'Raising'}
                      </Badge>
                    </Td>
                    <Td>{formatDate(token.created_at)}</Td>
                    <Td>
                      <Button
                        as={RouterLink}
                        to={`/trade/${token.id}`}
                        size="sm"
                        colorScheme="brand"
                        variant="outline"
                      >
                        View
                      </Button>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </CardBody>
        </Card>
      )}
    </VStack>
  );
};

export default Portfolio;

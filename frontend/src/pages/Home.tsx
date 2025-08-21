import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardBody,
  Text,
  Badge,
  VStack,
  HStack,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  Heading,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Image,
  Flex,
  useColorModeValue,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { Link as RouterLink } from 'react-router-dom';
import { useContract } from '../contexts/ContractContext';
import { useWallet } from '../contexts/WalletContext';

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
  };
}

const Home: React.FC = () => {
  const [tokens, setTokens] = useState<MemeToken[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { queryContract } = useContract();
  const { isConnected } = useWallet();

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    loadTokens();
  }, [isConnected]);

  const loadTokens = async () => {
    if (!isConnected) {
      // Show demo data when not connected
      setTokens([
        {
          id: 1,
          info: {
            name: 'CosmoDoge',
            symbol: 'CDOGE',
            description: 'The first meme coin on Cosmos Hub! Much wow, very decentralized! 🐕',
            image_url: 'https://via.placeholder.com/100?text=🐕',
          },
          creator: 'cosmos1abc...def',
          total_raised: '500000000',
          is_launched: false,
          config: {
            target_raise: '1000000000',
          },
        },
        {
          id: 2,
          info: {
            name: 'AtomCat',
            symbol: 'ACAT',
            description: 'Meow meow on the interchain! The purrfect investment 🐱',
            image_url: 'https://via.placeholder.com/100?text=🐱',
          },
          creator: 'cosmos1xyz...abc',
          total_raised: '800000000',
          is_launched: false,
          config: {
            target_raise: '1000000000',
          },
        },
        {
          id: 3,
          info: {
            name: 'RocketMoon',
            symbol: 'MOON',
            description: 'To the moon and beyond with Cosmos technology! 🚀🌙',
            image_url: 'https://via.placeholder.com/100?text=🚀',
          },
          creator: 'cosmos1def...xyz',
          total_raised: '1200000000',
          is_launched: true,
          config: {
            target_raise: '1000000000',
          },
        },
      ]);
      setLoading(false);
      return;
    }

    try {
      const response = await queryContract({
        meme_tokens: { limit: 50 }
      });
      setTokens(response.tokens || []);
    } catch (error) {
      console.error('Failed to load tokens:', error);
      setTokens([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredTokens = tokens.filter(token =>
    token.info.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    token.info.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    token.info.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatAmount = (amount: string) => {
    const num = parseFloat(amount) / 1000000; // Convert from uatom
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toFixed(0);
  };

  const calculateProgress = (raised: string, target: string) => {
    const raisedNum = parseFloat(raised);
    const targetNum = parseFloat(target);
    return Math.min((raisedNum / targetNum) * 100, 100);
  };

  if (loading) {
    return (
      <Box textAlign="center" py={10}>
        <Text>Loading meme coins...</Text>
      </Box>
    );
  }

  return (
    <VStack spacing={8} align="stretch">
      {/* Hero Section */}
      <Box textAlign="center" py={10}>
        <Heading size="2xl" mb={4} bgGradient="linear(to-r, brand.400, purple.400)" bgClip="text">
          Discover & Trade Meme Coins
        </Heading>
        <Text fontSize="lg" color="gray.400" mb={6}>
          The easiest way to launch and trade meme coins on Cosmos Hub
        </Text>
        <HStack spacing={4} justify="center">
          <Button as={RouterLink} to="/launch" colorScheme="brand" size="lg">
            Launch Your Coin
          </Button>
          <Button as={RouterLink} to="/trade" variant="outline" size="lg">
            Start Trading
          </Button>
        </HStack>
      </Box>

      {/* Search */}
      <Box>
        <InputGroup size="lg">
          <InputLeftElement>
            <SearchIcon color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder="Search meme coins..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            bg={cardBg}
            borderColor={borderColor}
          />
        </InputGroup>
      </Box>

      {/* Stats */}
      <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={6}>
        <Card bg={cardBg} borderColor={borderColor}>
          <CardBody>
            <Stat>
              <StatLabel>Total Meme Coins</StatLabel>
              <StatNumber>{tokens.length}</StatNumber>
              <StatHelpText>Launched on Cosmos</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        <Card bg={cardBg} borderColor={borderColor}>
          <CardBody>
            <Stat>
              <StatLabel>Active Launches</StatLabel>
              <StatNumber>{tokens.filter(t => !t.is_launched).length}</StatNumber>
              <StatHelpText>Currently raising funds</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        <Card bg={cardBg} borderColor={borderColor}>
          <CardBody>
            <Stat>
              <StatLabel>Successfully Launched</StatLabel>
              <StatNumber>{tokens.filter(t => t.is_launched).length}</StatNumber>
              <StatHelpText>Ready for trading</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </Grid>

      {/* Token Grid */}
      <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={6}>
        {filteredTokens.map((token) => (
          <Card
            key={token.id}
            bg={cardBg}
            borderColor={borderColor}
            _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }}
            transition="all 0.2s"
            cursor="pointer"
            as={RouterLink}
            to={`/trade/${token.id}`}
          >
            <CardBody>
              <VStack align="start" spacing={4}>
                <HStack justify="space-between" w="100%">
                  <HStack>
                    {token.info.image_url ? (
                      <Image
                        src={token.info.image_url}
                        alt={token.info.name}
                        boxSize="40px"
                        borderRadius="full"
                        fallbackSrc="https://via.placeholder.com/40?text=🪙"
                      />
                    ) : (
                      <Box
                        boxSize="40px"
                        borderRadius="full"
                        bg="brand.500"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        fontSize="lg"
                      >
                        🪙
                      </Box>
                    )}
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="bold">{token.info.name}</Text>
                      <Text fontSize="sm" color="gray.400">${token.info.symbol}</Text>
                    </VStack>
                  </HStack>
                  <Badge colorScheme={token.is_launched ? 'green' : 'blue'}>
                    {token.is_launched ? 'Launched' : 'Raising'}
                  </Badge>
                </HStack>

                <Text fontSize="sm" color="gray.400" noOfLines={2}>
                  {token.info.description}
                </Text>

                <Box w="100%">
                  <Flex justify="space-between" mb={2}>
                    <Text fontSize="sm">Progress</Text>
                    <Text fontSize="sm" color="brand.400">
                      {formatAmount(token.total_raised)} / {formatAmount(token.config.target_raise)} ATOM
                    </Text>
                  </Flex>
                  <Box bg="gray.700" borderRadius="full" h="6px">
                    <Box
                      bg="brand.400"
                      h="100%"
                      borderRadius="full"
                      width={`${calculateProgress(token.total_raised, token.config.target_raise)}%`}
                    />
                  </Box>
                </Box>

                <Text fontSize="xs" color="gray.500">
                  Created by {token.creator.slice(0, 12)}...
                </Text>
              </VStack>
            </CardBody>
          </Card>
        ))}
      </Grid>

      {filteredTokens.length === 0 && (
        <Box textAlign="center" py={10}>
          <Text color="gray.400">
            {searchTerm ? 'No meme coins found matching your search.' : 'No meme coins available yet.'}
          </Text>
          <Button as={RouterLink} to="/launch" colorScheme="brand" mt={4}>
            Launch the First One!
          </Button>
        </Box>
      )}
    </VStack>
  );
};

export default Home;

import React, { ReactNode } from 'react';
import {
  Box,
  Flex,
  HStack,
  Link,
  Button,
  Text,
  useColorModeValue,
  Container,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Badge,
} from '@chakra-ui/react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isConnected, address, connect, disconnect, isConnecting } = useWallet();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
  };

  return (
    <Box minH="100vh">
      {/* Header */}
      <Box bg="gray.800" borderBottom="1px" borderColor="gray.700">
        <Container maxW="7xl">
          <Flex h={16} alignItems="center" justifyContent="space-between">
            <HStack spacing={8} alignItems="center">
              <Text fontSize="xl" fontWeight="bold" color="brand.400">
                🚀 Cosmos Meme Launcher
              </Text>
              <HStack as="nav" spacing={4} display={{ base: 'none', md: 'flex' }}>
                <Link
                  as={RouterLink}
                  to="/"
                  px={2}
                  py={1}
                  rounded="md"
                  color={isActive('/') ? 'brand.400' : 'gray.300'}
                  fontWeight={isActive('/') ? 'semibold' : 'normal'}
                  _hover={{ textDecoration: 'none', color: 'brand.300' }}
                >
                  Explore
                </Link>
                <Link
                  as={RouterLink}
                  to="/launch"
                  px={2}
                  py={1}
                  rounded="md"
                  color={isActive('/launch') ? 'brand.400' : 'gray.300'}
                  fontWeight={isActive('/launch') ? 'semibold' : 'normal'}
                  _hover={{ textDecoration: 'none', color: 'brand.300' }}
                >
                  Launch
                </Link>
                <Link
                  as={RouterLink}
                  to="/trade"
                  px={2}
                  py={1}
                  rounded="md"
                  color={isActive('/trade') ? 'brand.400' : 'gray.300'}
                  fontWeight={isActive('/trade') ? 'semibold' : 'normal'}
                  _hover={{ textDecoration: 'none', color: 'brand.300' }}
                >
                  Trade
                </Link>
                <Link
                  as={RouterLink}
                  to="/portfolio"
                  px={2}
                  py={1}
                  rounded="md"
                  color={isActive('/portfolio') ? 'brand.400' : 'gray.300'}
                  fontWeight={isActive('/portfolio') ? 'semibold' : 'normal'}
                  _hover={{ textDecoration: 'none', color: 'brand.300' }}
                >
                  Portfolio
                </Link>
              </HStack>
            </HStack>

            <Flex alignItems="center">
              {isConnected && address ? (
                <Menu>
                  <MenuButton>
                    <HStack>
                      <Avatar size="sm" />
                      <Text fontSize="sm">{formatAddress(address)}</Text>
                      <Badge colorScheme="green" variant="subtle">
                        Connected
                      </Badge>
                    </HStack>
                  </MenuButton>
                  <MenuList bg="gray.800" borderColor="gray.700">
                    <MenuItem bg="gray.800" _hover={{ bg: 'gray.700' }} onClick={disconnect}>
                      Disconnect
                    </MenuItem>
                  </MenuList>
                </Menu>
              ) : (
                <Button
                  colorScheme="brand"
                  size="sm"
                  onClick={connect}
                  isLoading={isConnecting}
                  loadingText="Connecting..."
                >
                  Connect Wallet
                </Button>
              )}
            </Flex>
          </Flex>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxW="7xl" py={8}>
        {children}
      </Container>
    </Box>
  );
};

export default Layout;

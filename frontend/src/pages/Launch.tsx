import React, { useState } from 'react';
import {
  Box,
  Card,
  CardBody,
  CardHeader,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  Text,
  Heading,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Progress,
  Badge,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { useWallet } from '../contexts/WalletContext';
import { useContract } from '../contexts/ContractContext';

const Launch: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    description: '',
    imageUrl: '',
    website: '',
    twitter: '',
    telegram: '',
    initialSupply: '1000000000000', // 1 trillion
    targetRaise: '1000000000', // 1000 ATOM
    creatorAllocation: '5', // 5%
  });
  const [isLaunching, setIsLaunching] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const { isConnected, connect } = useWallet();
  const { executeContract } = useContract();
  const toast = useToast();

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const steps = [
    'Token Information',
    'Launch Configuration',
    'Social Links',
    'Review & Launch'
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleLaunch = async () => {
    if (!isConnected) {
      await connect();
      return;
    }

    setIsLaunching(true);
    try {
      const tokenInfo = {
        name: formData.name,
        symbol: formData.symbol,
        description: formData.description,
        image_url: formData.imageUrl || null,
        website: formData.website || null,
        twitter: formData.twitter || null,
        telegram: formData.telegram || null,
      };

      const launchConfig = {
        initial_supply: formData.initialSupply,
        target_raise: formData.targetRaise,
        creator_allocation_bps: Math.floor(parseFloat(formData.creatorAllocation) * 100),
      };

      const msg = {
        create_meme_token: {
          token_info: tokenInfo,
          launch_config: launchConfig,
        },
      };

      const funds = [{ denom: 'uatom', amount: '1000000' }]; // 1 ATOM creation fee

      await executeContract(msg, funds);

      toast({
        title: 'Meme coin launched! 🚀',
        description: `${formData.name} (${formData.symbol}) has been successfully launched!`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Reset form
      setFormData({
        name: '',
        symbol: '',
        description: '',
        imageUrl: '',
        website: '',
        twitter: '',
        telegram: '',
        initialSupply: '1000000000000',
        targetRaise: '1000000000',
        creatorAllocation: '5',
      });
      setCurrentStep(0);
    } catch (error) {
      console.error('Launch failed:', error);
      toast({
        title: 'Launch failed',
        description: 'Failed to launch your meme coin. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLaunching(false);
    }
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 0:
        return formData.name && formData.symbol && formData.description;
      case 1:
        return formData.initialSupply && formData.targetRaise;
      case 2:
        return true; // Social links are optional
      case 3:
        return true; // Review step
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <VStack spacing={6}>
            <FormControl isRequired>
              <FormLabel>Token Name</FormLabel>
              <Input
                placeholder="e.g., CosmoDoge"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                maxLength={64}
              />
              <Text fontSize="sm" color="gray.400" mt={1}>
                {formData.name.length}/64 characters
              </Text>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Token Symbol</FormLabel>
              <Input
                placeholder="e.g., CDOGE"
                value={formData.symbol}
                onChange={(e) => handleInputChange('symbol', e.target.value.toUpperCase())}
                maxLength={12}
              />
              <Text fontSize="sm" color="gray.400" mt={1}>
                {formData.symbol.length}/12 characters
              </Text>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Description</FormLabel>
              <Textarea
                placeholder="Describe your meme coin in a fun and engaging way..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                maxLength={500}
                rows={4}
              />
              <Text fontSize="sm" color="gray.400" mt={1}>
                {formData.description.length}/500 characters
              </Text>
            </FormControl>

            <FormControl>
              <FormLabel>Image URL (Optional)</FormLabel>
              <Input
                placeholder="https://example.com/image.png"
                value={formData.imageUrl}
                onChange={(e) => handleInputChange('imageUrl', e.target.value)}
              />
            </FormControl>
          </VStack>
        );

      case 1:
        return (
          <VStack spacing={6}>
            <FormControl isRequired>
              <FormLabel>Initial Supply</FormLabel>
              <NumberInput
                value={formData.initialSupply}
                onChange={(value) => handleInputChange('initialSupply', value)}
                min={1}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <Text fontSize="sm" color="gray.400" mt={1}>
                Total number of tokens to create
              </Text>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Target Raise (in microATOM)</FormLabel>
              <NumberInput
                value={formData.targetRaise}
                onChange={(value) => handleInputChange('targetRaise', value)}
                min={100000000} // 100 ATOM minimum
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <Text fontSize="sm" color="gray.400" mt={1}>
                Amount needed to launch to DEX ({(parseFloat(formData.targetRaise) / 1000000).toFixed(0)} ATOM)
              </Text>
            </FormControl>

            <FormControl>
              <FormLabel>Creator Allocation (%)</FormLabel>
              <NumberInput
                value={formData.creatorAllocation}
                onChange={(value) => handleInputChange('creatorAllocation', value)}
                min={0}
                max={20}
                step={0.1}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <Text fontSize="sm" color="gray.400" mt={1}>
                Percentage of tokens allocated to you as creator (max 20%)
              </Text>
            </FormControl>
          </VStack>
        );

      case 2:
        return (
          <VStack spacing={6}>
            <Text color="gray.400" textAlign="center">
              Add social links to build trust and community (all optional)
            </Text>

            <FormControl>
              <FormLabel>Website</FormLabel>
              <Input
                placeholder="https://yourproject.com"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Twitter</FormLabel>
              <Input
                placeholder="https://twitter.com/yourproject"
                value={formData.twitter}
                onChange={(e) => handleInputChange('twitter', e.target.value)}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Telegram</FormLabel>
              <Input
                placeholder="https://t.me/yourproject"
                value={formData.telegram}
                onChange={(e) => handleInputChange('telegram', e.target.value)}
              />
            </FormControl>
          </VStack>
        );

      case 3:
        return (
          <VStack spacing={6}>
            <Text fontSize="lg" fontWeight="bold" textAlign="center">
              Review Your Meme Coin
            </Text>

            <Card bg={cardBg} borderColor={borderColor} w="100%">
              <CardBody>
                <VStack align="start" spacing={4}>
                  <HStack justify="space-between" w="100%">
                    <Text fontWeight="bold" fontSize="lg">{formData.name}</Text>
                    <Badge colorScheme="brand">${formData.symbol}</Badge>
                  </HStack>
                  
                  <Text color="gray.400">{formData.description}</Text>
                  
                  <VStack align="start" spacing={2} w="100%">
                    <HStack justify="space-between" w="100%">
                      <Text>Initial Supply:</Text>
                      <Text>{parseFloat(formData.initialSupply).toLocaleString()}</Text>
                    </HStack>
                    <HStack justify="space-between" w="100%">
                      <Text>Target Raise:</Text>
                      <Text>{(parseFloat(formData.targetRaise) / 1000000).toFixed(0)} ATOM</Text>
                    </HStack>
                    <HStack justify="space-between" w="100%">
                      <Text>Creator Allocation:</Text>
                      <Text>{formData.creatorAllocation}%</Text>
                    </HStack>
                  </VStack>

                  {(formData.website || formData.twitter || formData.telegram) && (
                    <VStack align="start" spacing={2} w="100%">
                      <Text fontWeight="semibold">Social Links:</Text>
                      {formData.website && <Text fontSize="sm">🌐 {formData.website}</Text>}
                      {formData.twitter && <Text fontSize="sm">🐦 {formData.twitter}</Text>}
                      {formData.telegram && <Text fontSize="sm">📱 {formData.telegram}</Text>}
                    </VStack>
                  )}
                </VStack>
              </CardBody>
            </Card>

            <Alert status="info">
              <AlertIcon />
              <Box>
                <AlertTitle>Launch Fee: 1 ATOM</AlertTitle>
                <AlertDescription>
                  This fee helps prevent spam and supports the platform.
                </AlertDescription>
              </Box>
            </Alert>
          </VStack>
        );

      default:
        return null;
    }
  };

  if (!isConnected) {
    return (
      <Box textAlign="center" py={10}>
        <VStack spacing={6}>
          <Heading size="lg">Connect Your Wallet</Heading>
          <Text color="gray.400">
            You need to connect your wallet to launch a meme coin
          </Text>
          <Button colorScheme="brand" onClick={connect}>
            Connect Wallet
          </Button>
        </VStack>
      </Box>
    );
  }

  return (
    <Box maxW="2xl" mx="auto">
      <VStack spacing={8}>
        <Box textAlign="center">
          <Heading size="xl" mb={2}>
            Launch Your Meme Coin 🚀
          </Heading>
          <Text color="gray.400">
            Create and launch your meme coin on Cosmos Hub in just a few steps
          </Text>
        </Box>

        {/* Progress */}
        <Box w="100%">
          <HStack justify="space-between" mb={2}>
            {steps.map((step, index) => (
              <Text
                key={index}
                fontSize="sm"
                color={index <= currentStep ? 'brand.400' : 'gray.400'}
                fontWeight={index === currentStep ? 'bold' : 'normal'}
              >
                {step}
              </Text>
            ))}
          </HStack>
          <Progress
            value={(currentStep / (steps.length - 1)) * 100}
            colorScheme="brand"
            borderRadius="full"
          />
        </Box>

        {/* Form */}
        <Card bg={cardBg} borderColor={borderColor} w="100%">
          <CardHeader>
            <Heading size="md">{steps[currentStep]}</Heading>
          </CardHeader>
          <CardBody>
            {renderStep()}
          </CardBody>
        </Card>

        {/* Navigation */}
        <HStack justify="space-between" w="100%">
          <Button
            variant="ghost"
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            Previous
          </Button>
          
          {currentStep < steps.length - 1 ? (
            <Button
              colorScheme="brand"
              onClick={handleNext}
              disabled={!isStepValid(currentStep)}
            >
              Next
            </Button>
          ) : (
            <Button
              colorScheme="brand"
              onClick={handleLaunch}
              isLoading={isLaunching}
              loadingText="Launching..."
              disabled={!isStepValid(currentStep)}
            >
              Launch Meme Coin 🚀
            </Button>
          )}
        </HStack>
      </VStack>
    </Box>
  );
};

export default Launch;

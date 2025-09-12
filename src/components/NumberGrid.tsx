import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shuffle, ArrowLeft } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useWallet } from '@solana/wallet-adapter-react';
import TicketPurchaseCardSmartContract from './TicketPurchaseCardSmartContract';
import { validateTicketNumbers, checkDuplicateNumbers, generateTicketHash } from '@/lib/ticketValidation';
import { Connection } from '@solana/web3.js';

interface NumberGridProps {
  onBack: () => void;
  onBuyTicket: (quantity: number) => void;
}

const NumberGrid = ({ onBack, onBuyTicket }: NumberGridProps) => {
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [ticketCombinations, setTicketCombinations] = useState<number[][]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const { toast } = useToast();
  const { publicKey } = useWallet();
  const maxNumbers = 5;
  const maxNumber = 49;

  const toggleNumber = (number: number) => {
    if (selectedNumbers.includes(number)) {
      setSelectedNumbers(prev => prev.filter(n => n !== number));
    } else if (selectedNumbers.length < maxNumbers) {
      setSelectedNumbers(prev => [...prev, number].sort((a, b) => a - b));
    } else {
      toast({
        title: "Maximum numbers selected",
        description: `You can only select ${maxNumbers} numbers.`,
        variant: "destructive",
      });
    }
  };

  const quickPick = () => {
    const numbers: number[] = [];
    while (numbers.length < maxNumbers) {
      const randomNumber = Math.floor(Math.random() * maxNumber) + 1;
      if (!numbers.includes(randomNumber)) {
        numbers.push(randomNumber);
      }
    }
    setSelectedNumbers(numbers.sort((a, b) => a - b));
    toast({
      title: "Numbers selected!",
      description: "Your lucky numbers have been randomly chosen.",
    });
  };

  const clearSelection = () => {
    setSelectedNumbers([]);
  };

  const addCombination = () => {
    if (selectedNumbers.length === maxNumbers) {
      setTicketCombinations(prev => [...prev, [...selectedNumbers]]);
      setSelectedNumbers([]);
      toast({
        title: "Combination added!",
        description: `Added combination ${ticketCombinations.length + 1}`,
      });
    } else {
      toast({
        title: "Incomplete selection",
        description: `Please select ${maxNumbers} numbers first.`,
        variant: "destructive",
      });
    }
  };

  const removeCombination = (index: number) => {
    setTicketCombinations(prev => prev.filter((_, i) => i !== index));
    toast({
      title: "Combination removed",
      description: `Removed combination ${index + 1}`,
    });
  };

  const clearAllCombinations = () => {
    setTicketCombinations([]);
    setSelectedNumbers([]);
    toast({
      title: "All combinations cleared",
      description: "Start fresh with new combinations",
    });
  };

  const handlePurchaseTickets = async (quantity: number) => {
    if (!publicKey) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet first.",
        variant: "destructive",
      });
      return;
    }

    setIsValidating(true);

    try {
      // Déterminer la combinaison à utiliser
      let baseCombination: number[];
      
      if (selectedNumbers.length === maxNumbers) {
        // Utiliser la combinaison actuellement sélectionnée
        baseCombination = selectedNumbers;
      } else if (ticketCombinations.length > 0) {
        // Utiliser la première combinaison sauvegardée
        baseCombination = ticketCombinations[0];
      } else {
        toast({
          title: "No numbers selected",
          description: "Please select 5 numbers or add a combination first.",
          variant: "destructive",
        });
        return;
      }

      // Créer les combinaisons (même combinaison répétée pour chaque ticket)
      const combinationsToUse: number[][] = [];
      for (let i = 0; i < quantity; i++) {
        combinationsToUse.push([...baseCombination]);
      }

      // Valider toutes les combinaisons
      for (let i = 0; i < combinationsToUse.length; i++) {
        const combination = combinationsToUse[i];
        
        // 1. Valider les numéros
        const validation = validateTicketNumbers(combination);
        if (!validation.isValid) {
          toast({
            title: "Invalid numbers",
            description: `Combination ${i + 1}: ${validation.reason}`,
            variant: "destructive",
          });
          return;
        }

        // 2. Vérifier les doublons
        const duplicateCheck = await checkDuplicateNumbers(
          new Connection('https://api.mainnet-beta.solana.com'),
          combination,
          1 // raffleId
        );

        if (!duplicateCheck.isValid) {
          toast({
            title: "Duplicate numbers",
            description: `Combination ${i + 1}: ${duplicateCheck.reason}`,
            variant: "destructive",
          });
          return;
        }
      }

      // Sauvegarder toutes les combinaisons
      const existingTickets = JSON.parse(localStorage.getItem('lotteryTickets') || '[]');
      const timestamp = Date.now();

      for (let i = 0; i < combinationsToUse.length; i++) {
        const combination = combinationsToUse[i];
        const ticketHash = generateTicketHash(combination, publicKey.toString(), timestamp + i);

        const ticketData = {
          numbers: combination,
          quantity: 1, // Chaque combinaison = 1 ticket
          timestamp: timestamp + i,
          txHash: 'pending',
          buyer: publicKey.toString(),
          ticketHash: ticketHash
        };

        existingTickets.push(ticketData);
      }

      // Sauvegarder
      localStorage.setItem('lotteryTickets', JSON.stringify(existingTickets));
      
      // Log les numéros pour l'admin (simulation d'un log blockchain)
      console.log('🎫 LuckySol Ticket Purchase:', {
        buyer: publicKey.toString(),
        numbers: combinationsToUse.map(combo => combo.join(',')).join(' | '),
        quantity: quantity,
        timestamp: new Date().toISOString(),
        ticketHash: generateTicketHash(baseCombination, publicKey.toString(), timestamp)
      });
      
      // Simuler l'envoi des numéros dans les logs de transaction
      // Dans une vraie implémentation, cela serait fait par le smart contract
      const logMessage = `LuckySol: Numbers: [${baseCombination.join(',')}] | Buyer: ${publicKey.toString()} | Quantity: ${quantity}`;
      console.log('📝 Transaction Log:', logMessage);
      
      console.log('Tickets validated and saved:', combinationsToUse.length, 'combinations');
      
    onBuyTicket(quantity);
      
    } catch (error) {
      console.error('Validation error:', error);
      toast({
        title: "Validation failed",
        description: "An error occurred while validating your tickets.",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-lottery-bg to-lottery-orange-light p-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Number Selection */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center justify-between"
            >
              <Button
                variant="outline"
                onClick={onBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
              
              <div className="text-right">
                <h1 className="text-2xl font-bold text-foreground">Pick Your Numbers</h1>
                <p className="text-muted-foreground">Select {maxNumbers} numbers from 1 to {maxNumber}</p>
              </div>
            </motion.div>

            {/* Selection Status */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="bg-lottery-card border-lottery-border shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span>Your Selection</span>
                    <Badge variant={selectedNumbers.length === maxNumbers ? "default" : "secondary"}>
                      {selectedNumbers.length}/{maxNumbers}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3 mb-4">
                    {selectedNumbers.length > 0 ? (
                      selectedNumbers.map((number) => (
                        <motion.div
                          key={number}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-12 h-12 bg-primary text-primary-foreground rounded-xl flex items-center justify-center font-bold text-lg shadow-md"
                        >
                          {number}
                        </motion.div>
                      ))
                    ) : (
                      <p className="text-muted-foreground">No numbers selected</p>
                    )}
                  </div>
                  
                  <div className="flex gap-3 flex-wrap">
                    <Button
                      onClick={quickPick}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Shuffle className="h-4 w-4" />
                      Quick Pick
                    </Button>
                    
                    {selectedNumbers.length === maxNumbers && (
                      <Button
                        onClick={addCombination}
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        Add Combination
                      </Button>
                    )}
                    
                    {selectedNumbers.length > 0 && (
                      <Button
                        onClick={clearSelection}
                        variant="outline"
                      >
                        Clear Current
                      </Button>
                    )}
                    
                    {ticketCombinations.length > 0 && (
                      <Button
                        onClick={clearAllCombinations}
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                      >
                        Clear All
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Number Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="bg-lottery-card border-lottery-border shadow-lg">
                <CardHeader>
                  <CardTitle>Choose Numbers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-7 sm:grid-cols-10 gap-2">
                    {Array.from({ length: maxNumber }, (_, i) => i + 1).map((number) => {
                      const isSelected = selectedNumbers.includes(number);
                      return (
                        <motion.button
                          key={number}
                          onClick={() => toggleNumber(number)}
                          disabled={!isSelected && selectedNumbers.length >= maxNumbers}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`
                            aspect-square rounded-xl font-bold text-lg transition-all duration-200 shadow-sm
                            ${isSelected
                              ? 'bg-primary text-primary-foreground shadow-md scale-105'
                              : 'bg-muted hover:bg-accent text-foreground hover:scale-105'
                            }
                            ${!isSelected && selectedNumbers.length >= maxNumbers
                              ? 'opacity-50 cursor-not-allowed'
                              : 'cursor-pointer'
                            }
                          `}
                        >
                          {number}
                        </motion.button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Saved Combinations */}
            {ticketCombinations.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Card className="bg-lottery-card border-lottery-border shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Saved Combinations ({ticketCombinations.length})</span>
                      <Badge variant="secondary">
                        {ticketCombinations.length} combinations
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {ticketCombinations.map((combination, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-muted-foreground">
                              #{index + 1}
                            </span>
                            <div className="flex gap-1">
                              {combination.map((number) => (
                                <div
                                  key={number}
                                  className="w-8 h-8 bg-primary text-primary-foreground rounded text-xs flex items-center justify-center font-bold"
                                >
                                  {number}
                                </div>
                              ))}
                            </div>
                          </div>
                          <Button
                            onClick={() => removeCombination(index)}
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            Remove
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Tip:</strong> When you buy multiple tickets, the same combination will be used for all tickets. 
                        For example: 5 tickets = 5 times the same 5 numbers, 10 tickets = 10 times the same 5 numbers.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Right Column - Ticket Purchase */}
          <div className="lg:col-span-1">
            <TicketPurchaseCardSmartContract 
              selectedNumbers={selectedNumbers}
              onPurchaseTickets={handlePurchaseTickets}
              allowWithoutNumbers={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NumberGrid;
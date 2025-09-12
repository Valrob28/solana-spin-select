import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useWallet } from '@solana/wallet-adapter-react';
import { Ticket, DollarSign, Zap, Gift } from 'lucide-react';
import { LotteryProgram } from '@/lib/lotteryProgram';
import { Connection } from '@solana/web3.js';

interface TicketPurchaseCardSmartContractProps {
  selectedNumbers: number[];
  onPurchaseTickets: (quantity: number) => void;
  allowWithoutNumbers?: boolean;
  disabled?: boolean;
}

const ticketOptions = [
  { id: 'single', quantity: 1, price: 0.01, popular: false },
  { id: 'bundle', quantity: 5, price: 0.04, popular: true, discount: 20, bonus: 'Best value!' },
  { id: 'mega', quantity: 10, price: 0.07, popular: false, discount: 30, bonus: 'Mega deal!' },
];

type TicketOption = typeof ticketOptions[0];

const TicketPurchaseCardSmartContract = ({ 
  selectedNumbers, 
  onPurchaseTickets, 
  allowWithoutNumbers = false, 
  disabled = false 
}: TicketPurchaseCardSmartContractProps) => {
  const [selectedOption, setSelectedOption] = useState<TicketOption>(ticketOptions[0]);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const { connected, publicKey, wallet } = useWallet();
  const { toast } = useToast();

  const handlePurchase = async () => {
    if (disabled) {
      toast({
        title: "Pool complete",
        description: "The prize pool has reached its target. Sales are closed.",
        variant: "destructive",
      });
      return;
    }

    if (!connected || !publicKey || !wallet) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to purchase tickets.",
        variant: "destructive",
      });
      return;
    }

    if (!allowWithoutNumbers && selectedNumbers.length !== 5) {
      toast({
        title: "Incomplete selection",
        description: "Please select exactly 5 numbers first.",
        variant: "destructive",
      });
      return;
    }

    setIsPurchasing(true);

    try {
      // Connexion à la blockchain
      const connection = new Connection(
        import.meta.env.VITE_SOLANA_RPC || 'https://api.mainnet-beta.solana.com',
        'confirmed'
      );

      // Créer l'instance du programme de loterie
      const lotteryProgram = new LotteryProgram(connection, wallet.adapter);

      // Acheter les tickets via le smart contract
      const signature = await lotteryProgram.buyTickets(
        selectedNumbers.length > 0 ? selectedNumbers : [1, 2, 3, 4, 5], // Fallback si pas de sélection
        selectedOption.quantity
      );

      // Mettre à jour le localStorage avec les données du smart contract
      if (selectedNumbers.length > 0) {
        const existingTickets = JSON.parse(localStorage.getItem('lotteryTickets') || '[]');
        
        // Créer une entrée pour chaque ticket
        for (let i = 0; i < selectedOption.quantity; i++) {
          const ticketData = {
            numbers: selectedNumbers,
            quantity: 1,
            timestamp: Date.now() + i,
            txHash: signature,
            buyer: publicKey.toString(),
            ticketHash: `smart_contract_${signature}_${i}`,
            smartContract: true, // Marquer comme venant du smart contract
          };
          
          existingTickets.push(ticketData);
        }
        
        localStorage.setItem('lotteryTickets', JSON.stringify(existingTickets));
      }

      onPurchaseTickets(selectedOption.quantity);
      
      toast({
        title: "Tickets purchased successfully!",
        description: `Transaction: ${signature.slice(0, 8)}...`,
      });

    } catch (error: any) {
      console.error('Smart contract purchase failed:', error);
      
      let errorMessage = 'Failed to purchase tickets';
      if (error.message) {
        if (error.message.includes('InsufficientFunds')) {
          errorMessage = 'Insufficient SOL. Please top up your wallet.';
        } else if (error.message.includes('InvalidNumber')) {
          errorMessage = 'Invalid numbers selected. Please choose numbers between 1-49.';
        } else if (error.message.includes('DuplicateNumbers')) {
          errorMessage = 'Duplicate numbers detected. Please select unique numbers.';
        } else if (error.message.includes('PoolComplete')) {
          errorMessage = 'The prize pool is complete. Sales are closed.';
        } else if (error.message.includes('RaffleNotActive')) {
          errorMessage = 'The lottery is not active.';
        } else {
          errorMessage = error.message;
        }
      }

      toast({
        title: "Purchase failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
      className="sticky top-6"
    >
      <Card className="bg-lottery-card border-lottery-border shadow-xl overflow-hidden">
        <CardHeader className="pb-4 bg-gradient-to-r from-primary/10 to-accent/10">
          <CardTitle className="text-xl flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <Ticket className="h-5 w-5 text-primary-foreground" />
            </div>
            Buy Lottery Tickets
            <Badge variant="secondary" className="ml-auto">
              Smart Contract
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-primary" />
            <span className="text-2xl font-bold text-primary">
              @{selectedOption.price.toFixed(2)} SOL
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Selected Numbers Display */}
          {selectedNumbers.length > 0 && (
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm font-medium text-muted-foreground mb-2">Your numbers</p>
              <div className="flex gap-2 flex-wrap">
                {selectedNumbers.map((number) => (
                  <div
                    key={number}
                    className="w-8 h-8 bg-primary text-primary-foreground rounded-lg flex items-center justify-center font-bold text-sm"
                  >
                    {number}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ticket Options */}
          <div className="space-y-3">
            <p className="font-medium text-foreground">Choose tickets</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {ticketOptions.map((option) => (
                <motion.button
                  key={option.id}
                  onClick={() => setSelectedOption(option)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`
                    relative p-3 rounded-lg border-2 transition-all duration-200 text-left
                    ${selectedOption.id === option.id
                      ? 'border-primary bg-primary/10 shadow-md'
                      : 'border-lottery-border bg-background hover:border-primary/50'
                    }
                  `}
                >
                  {option.popular && (
                    <Badge className="absolute -top-2 -right-2 bg-primary text-primary-foreground">
                      <Zap className="h-3 w-3 mr-1" />
                      Popular
                    </Badge>
                  )}

                  <div className="font-bold text-lg text-foreground">
                    {option.quantity} Ticket{option.quantity > 1 ? 's' : ''}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-primary font-bold">
                      {option.price.toFixed(2)} SOL
                    </span>
                    {option.discount && (
                      <Badge variant="secondary" className="text-xs">
                        -{option.discount}%
                      </Badge>
                    )}
                  </div>

                  {option.bonus && (
                    <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Gift className="h-3 w-3" />
                      {option.bonus}
                    </div>
                  )}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Total Summary */}
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-muted-foreground">Quantity:</span>
              <span className="font-bold text-foreground">{selectedOption.quantity} tickets</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-muted-foreground">Price per ticket:</span>
              <span className="font-bold text-foreground">0.01 SOL</span>
            </div>
            {selectedOption.discount && (
              <div className="flex justify-between items-center mb-2">
                <span className="text-muted-foreground">Discount:</span>
                <span className="font-bold text-green-600">-{selectedOption.discount}%</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-2 border-t border-border">
              <span className="text-lg font-bold text-foreground">Total:</span>
              <span className="text-lg font-bold text-primary">{selectedOption.price.toFixed(2)} SOL</span>
            </div>
          </div>

          {/* Smart Contract Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>🔒 Secure:</strong> Your numbers are recorded on the blockchain for transparency.
            </p>
          </div>

          {/* Purchase Button */}
          <Button
            onClick={handlePurchase}
            disabled={disabled || !connected || (!allowWithoutNumbers && selectedNumbers.length !== 5) || isPurchasing}
            size="lg"
            className="w-full bg-gradient-to-r from-primary to-lottery-orange-dark text-primary-foreground hover:from-primary/90 hover:to-lottery-orange-dark/90 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
          >
            <Ticket className="mr-2 h-5 w-5" />
            {isPurchasing 
              ? 'Processing...' 
              : disabled 
                ? 'Pool complete' 
                : !connected 
                  ? 'Connect wallet' 
                  : (!allowWithoutNumbers && selectedNumbers.length !== 5) 
                    ? 'Pick 5 numbers' 
                    : 'Buy tickets (Smart Contract)'
            }
          </Button>

          {/* Special Offer */}
          {selectedOption.quantity >= 5 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-green-500/10 to-green-600/10 border border-green-200 rounded-lg p-4 text-center"
            >
              <Gift className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="font-bold text-green-800 mb-1">Special bonus!</p>
              <p className="text-sm text-green-700">{selectedOption.bonus}</p>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default TicketPurchaseCardSmartContract;

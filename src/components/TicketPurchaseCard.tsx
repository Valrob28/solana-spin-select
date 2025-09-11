import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from '@solana/wallet-adapter-react';
import { Ticket, Zap, Gift, DollarSign } from 'lucide-react';

interface TicketOption {
  id: string;
  quantity: number;
  price: number;
  discount?: number;
  popular?: boolean;
  bonus?: string;
}

const ticketOptions: TicketOption[] = [
  { id: '1', quantity: 1, price: 0.02 },
  { id: '5', quantity: 5, price: 0.09, discount: 10, popular: true },
  { id: '10', quantity: 10, price: 0.16, discount: 20 },
  { id: '25', quantity: 25, price: 0.35, discount: 30 },
  { id: '50', quantity: 50, price: 0.65, discount: 35, bonus: 'Free NFT Badge' },
  { id: '100', quantity: 100, price: 1.2, discount: 40, bonus: 'Premium Merch Package' },
];

interface TicketPurchaseCardProps {
  selectedNumbers: number[];
  onPurchaseTickets: (quantity: number) => void;
  allowWithoutNumbers?: boolean;
}

const TicketPurchaseCard = ({ selectedNumbers, onPurchaseTickets, allowWithoutNumbers = false }: TicketPurchaseCardProps) => {
  const [selectedOption, setSelectedOption] = useState<TicketOption>(ticketOptions[0]);
  const { connected } = useWallet();
  const { toast } = useToast();

  const handlePurchase = () => {
    if (!connected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to purchase tickets.",
        variant: "destructive",
      });
      return;
    }

    if (!allowWithoutNumbers && selectedNumbers.length !== 5) {
      toast({
        title: "Sélection incomplète",
        description: "Veuillez d'abord choisir exactement 5 numéros.",
        variant: "destructive",
      });
      return;
    }

    onPurchaseTickets(selectedOption.quantity);
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
            Acheter des tickets
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
              <p className="text-sm font-medium text-muted-foreground mb-2">Vos numéros</p>
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
            <p className="font-medium text-foreground">Choisissez vos tickets</p>
            <div className="grid grid-cols-2 gap-3">
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
                      Populaire
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
              <span className="text-muted-foreground">Quantité :</span>
              <span className="font-bold text-foreground">{selectedOption.quantity} tickets</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-muted-foreground">Prix par ticket :</span>
              <span className="font-bold text-foreground">0.02 SOL</span>
            </div>
            {selectedOption.discount && (
              <div className="flex justify-between items-center mb-2">
                <span className="text-muted-foreground">Réduction :</span>
                <span className="font-bold text-green-600">-{selectedOption.discount}%</span>
              </div>
            )}
            <div className="border-t border-lottery-border pt-2 mt-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-foreground">Total :</span>
                <span className="text-xl font-bold text-primary">{selectedOption.price.toFixed(2)} SOL</span>
              </div>
            </div>
          </div>

          {/* Purchase Button */}
          <Button
            onClick={handlePurchase}
            disabled={!connected || (!allowWithoutNumbers && selectedNumbers.length !== 5)}
            size="lg"
            className="w-full bg-gradient-to-r from-primary to-lottery-orange-dark text-primary-foreground hover:from-primary/90 hover:to-lottery-orange-dark/90 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
          >
            <Ticket className="mr-2 h-5 w-5" />
            {!connected ? 'Connecter le wallet' : (!allowWithoutNumbers && selectedNumbers.length !== 5) ? 'Choisir 5 numéros' : 'Acheter les tickets'}
          </Button>

          {/* Special Offer */}
          {selectedOption.quantity >= 25 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-green-500/10 to-green-600/10 border border-green-200 rounded-lg p-4 text-center"
            >
              <Gift className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="font-bold text-green-800 mb-1">Bonus spécial !</p>
              <p className="text-sm text-green-700">{selectedOption.bonus}</p>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default TicketPurchaseCard;
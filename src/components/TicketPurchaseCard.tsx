import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { Ticket, Zap, Gift, DollarSign } from 'lucide-react';
import { useRaffleProgram, buyTickets, getRaffleData, RAFFLE_PROGRAM_ID } from '@/lib/anchor';

interface TicketOption {
  id: string;
  quantity: number;
  price: number;
  discount?: number;
  popular?: boolean;
  bonus?: string;
}

const ticketOptions: TicketOption[] = [
  { id: '1', quantity: 1, price: 0.01 },
  { id: '5', quantity: 5, price: 0.04, discount: 20, bonus: 'Best value!', popular: true },
  { id: '10', quantity: 10, price: 0.07, discount: 30, bonus: 'Mega deal!', popular: false },
];

interface TicketPurchaseCardProps {
  selectedNumbers: number[];
  onPurchaseTickets: (quantity: number) => void;
  allowWithoutNumbers?: boolean;
  onTicketQuantityChange?: (quantity: number) => void;
  recipient?: string; // Solana public key to receive funds
  rpcEndpoint?: string; // optional custom RPC endpoint
  disabled?: boolean; // disable purchases when pool is complete
}

const TicketPurchaseCard = ({ selectedNumbers, onPurchaseTickets, allowWithoutNumbers = false, onTicketQuantityChange, recipient, rpcEndpoint, disabled = false }: TicketPurchaseCardProps) => {
  const [selectedOption, setSelectedOption] = useState<TicketOption>(ticketOptions[0]);
  const { connected, publicKey, sendTransaction } = useWallet();
  const { toast } = useToast();
  const { getProgram } = useRaffleProgram();

  const handlePurchase = async () => {
    if (disabled) {
      toast({
        title: "Pool complete",
        description: "The prize pool has reached its target. Sales are closed.",
        variant: "destructive",
      });
      return;
    }

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
        title: "Incomplete selection",
        description: "Please select exactly 5 numbers first.",
        variant: "destructive",
      });
      return;
    }
    try {
      const toAddress = (recipient || import.meta.env.VITE_POOL_WALLET) as string;
      if (!toAddress) throw new Error('Missing recipient wallet');
      if (!publicKey) throw new Error('Missing sender public key');

      // Validate recipient
      let toPubkey: PublicKey;
      try { toPubkey = new PublicKey(toAddress); } catch { throw new Error('Invalid recipient address'); }

      const endpoint = (rpcEndpoint || (import.meta.env.VITE_SOLANA_RPC as string)) || 'https://api.mainnet-beta.solana.com';
      const connection = new Connection(endpoint, 'confirmed');

      const lamports = Math.round(selectedOption.price * LAMPORTS_PER_SOL);
      if (lamports <= 0) throw new Error('Invalid amount');

      // Ne pas fixer le recentBlockhash: laisser le wallet adapter en récupérer un frais
      const transaction = new Transaction({ feePayer: publicKey }).add(
        SystemProgram.transfer({ fromPubkey: publicKey, toPubkey, lamports })
      );

      const tryOnce = async () => {
        const sig = await sendTransaction(transaction, connection, {
          skipPreflight: false,
          preflightCommitment: 'processed',
          maxRetries: 3,
        });
        await connection.confirmTransaction(sig, 'confirmed');
        return sig;
      };

      let signature: string;
      try {
        signature = await tryOnce();
      } catch (e: any) {
        const msg = (e?.message || '').toLowerCase();
        if (msg.includes('blockhash') || msg.includes('expired')) {
          // Réessayer avec un nouveau recent blockhash géré par le wallet adapter
          signature = await tryOnce();
        } else {
          throw e;
        }
      }

      // Mettre à jour le hash de transaction dans localStorage
      if (selectedNumbers.length > 0) {
        const existingTickets = JSON.parse(localStorage.getItem('lotteryTickets') || '[]');
        if (existingTickets.length > 0) {
          // Mettre à jour le dernier ticket avec le hash de transaction
          existingTickets[existingTickets.length - 1].txHash = signature;
          localStorage.setItem('lotteryTickets', JSON.stringify(existingTickets));
        }
      }

      onPurchaseTickets(selectedOption.quantity);
      toast({ title: 'Payment sent', description: `Signature: ${signature.slice(0, 8)}…` });
    } catch (err: any) {
      const message = (err?.message || String(err)).toLowerCase();
      let hint = '';
      if (message.includes('insufficient') || message.includes('0x1')) hint = 'Insufficient SOL. Please top up your wallet.';
      if (message.includes('blockhash')) hint = 'Please try again; the recent blockhash may have expired.';
      if (message.includes('rejected')) hint = 'Transaction was rejected in the wallet.';
      console.error('Payment failed', err);
      toast({ title: 'Payment failed', description: hint || (err?.message || String(err)), variant: 'destructive' });
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
                  onClick={() => {
                    setSelectedOption(option);
                    onTicketQuantityChange?.(option.quantity);
                  }}
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
            <div className="border-t border-lottery-border pt-2 mt-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-foreground">Total:</span>
                <span className="text-xl font-bold text-primary">{selectedOption.price.toFixed(2)} SOL</span>
              </div>
            </div>
          </div>

          {/* Purchase Button */}
          <Button
            onClick={handlePurchase}
            disabled={disabled || !connected || (!allowWithoutNumbers && selectedNumbers.length !== 5)}
            size="lg"
            className="w-full bg-gradient-to-r from-primary to-lottery-orange-dark text-primary-foreground hover:from-primary/90 hover:to-lottery-orange-dark/90 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
          >
            <Ticket className="mr-2 h-5 w-5" />
            {disabled ? 'Pool complete' : !connected ? 'Connect wallet' : (!allowWithoutNumbers && selectedNumbers.length !== 5) ? 'Pick 5 numbers' : 'Buy tickets'}
          </Button>

          {/* Special Offer */}
          {selectedOption.quantity >= 25 && (
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

export default TicketPurchaseCard;
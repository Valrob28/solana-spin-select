import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Sparkles, Car, Home, DollarSign, Plane, Watch, Laptop, Gamepad2, Gift, Shield } from 'lucide-react';
import WalletConnectButton from './WalletConnectButton';
import TicketPurchaseCard from './TicketPurchaseCard';
import NumberSelector from './NumberSelector';
import TokenBanner from './TokenBanner';
import MobileHeader from './MobileHeader';
import Footer from './Footer';
// import TicketPurchaseCardAnchor from './TicketPurchaseCardAnchor';
import { Progress } from "@/components/ui/progress";
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import pudgyImg from '@/assets/Pudgy.webp';
import retardioImg from '@/assets/retardio.jpg';
import mercedesImg from '@/assets/mercedes-amg.jpg';
import cashPrizeImg from '@/assets/cash-prize.jpg';
import dreamVacationImg from '@/assets/dream-vacation.jpg';
import rolexImg from '@/assets/rolex-submariner.jpg';

interface Prize {
  id: number;
  title: string;
  description: string;
  image?: string;
  icon: React.ComponentType<any>;
  value: string;
}

const prizes: Prize[] = [
  { id: 1, title: "RETARDIO NFT", description: "Exclusive NFT prize", image: retardioImg, icon: Car, value: "$450" },
  { id: 2, title: "BAG OF PENGU", description: "A bag of pengu", image: pudgyImg, icon: Car, value: "$50" },
];

// Calculer la valeur totale des lots
const totalPrizeValue = prizes.reduce((total, prize) => {
  const value = parseFloat(prize.value.replace('$', '').replace(',', ''));
  return total + value;
}, 0);
interface HomePageProps {
  onConnectAndPlay: () => void;
  onPurchaseTickets?: (quantity: number) => void;
  poolWalletAddress?: string;
  poolTargetSol?: number; // objectif en SOL
  onLotteryManager?: () => void;
  onHowToPlay?: () => void;
  onTerms?: () => void;
  onFAQ?: () => void;
  onAdmin?: () => void;
}

const HomePage = ({ onConnectAndPlay, onPurchaseTickets, poolWalletAddress, poolTargetSol = 2.5, onLotteryManager, onHowToPlay, onTerms, onFAQ, onAdmin }: HomePageProps) => {
  const [poolBalanceSol, setPoolBalanceSol] = useState<number>(0);
  const [isLoadingPool, setIsLoadingPool] = useState<boolean>(false);
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [ticketCombinations, setTicketCombinations] = useState<number[][]>([]);
  const [selectedTicketQuantity, setSelectedTicketQuantity] = useState<number>(1);

  const fetchBalance = async () => {
    if (!poolWalletAddress) return;
    try {
      setIsLoadingPool(true);
      const connection = new Connection(import.meta.env.VITE_SOLANA_RPC || 'https://api.mainnet-beta.solana.com', 'confirmed');
      const pubkey = new PublicKey(poolWalletAddress);
      const lamports = await connection.getBalance(pubkey);
      setPoolBalanceSol(lamports / LAMPORTS_PER_SOL);
    } catch {
      // ignore
    } finally {
      setIsLoadingPool(false);
    }
  };

  useEffect(() => {
    if (!poolWalletAddress) return;
    fetchBalance();
    const interval = window.setInterval(fetchBalance, 5000);
    return () => {
      window.clearInterval(interval);
    };
  }, [poolWalletAddress]);

  const handlePurchaseTickets = (quantity: number) => {
    onPurchaseTickets?.(quantity);
    // Refresh balance immediately after purchase
    setTimeout(fetchBalance, 2000); // Wait 2s for transaction to be confirmed
  };

  const handleNumbersSelected = (numbers: number[]) => {
    setSelectedNumbers(numbers);
  };

  const handleQuickPick = () => {
    // Quick pick animation effect
    console.log('Quick pick selected!');
  };

  const handleCombinationsChanged = (combinations: number[][]) => {
    setTicketCombinations(combinations);
  };

  const handleTicketQuantityChange = (quantity: number) => {
    setSelectedTicketQuantity(quantity);
    // Reset combinations when quantity changes
    setTicketCombinations([]);
    setSelectedNumbers([]);
  };

  const progressValue = Math.max(0, Math.min(100, poolTargetSol > 0 ? (poolBalanceSol / poolTargetSol) * 100 : 0));
  const ticketsRemaining = useMemo(() => {
    const remainingSol = Math.max(0, poolTargetSol - poolBalanceSol);
    
    // Calcul simple : combien de tickets à 0.01 SOL on peut encore acheter
    const ticketsRemaining = Math.floor(remainingSol / 0.01);
    
    return ticketsRemaining;
  }, [poolBalanceSol, poolTargetSol]);

  // Vérifier si le pool est complet
  const isPoolComplete = poolBalanceSol >= poolTargetSol;
  return (
    <div className="min-h-screen bg-gradient-to-b from-lottery-bg via-background to-lottery-orange-light flex flex-col">
      {/* Mobile Header */}
      <MobileHeader 
        onHowToPlay={onHowToPlay}
        onTerms={onTerms}
        onFAQ={onFAQ}
        onAdmin={onAdmin}
      />

      {/* Desktop Header */}
      <motion.header 
        className="hidden lg:flex justify-between items-center p-4 sm:p-6 max-w-7xl mx-auto"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary to-lottery-orange-dark rounded-xl flex items-center justify-center shadow-lg">
            <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg sm:text-2xl font-bold text-foreground">LuckySol.xyz</h1>
            <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">Solana blockchain</p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <nav className="hidden lg:flex items-center gap-4 text-sm">
            <button 
              onClick={onHowToPlay}
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              How to play
            </button>
            <button 
              onClick={onTerms}
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Terms
            </button>
            <button 
              onClick={onFAQ}
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              FAQ
            </button>
            <button 
              onClick={onAdmin}
              className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
            >
              <Shield className="h-3 w-3" />
              Admin
            </button>
          </nav>
          <WalletConnectButton />
        </div>
      </motion.header>

      {/* Hero Section */}
      <motion.section 
        className="text-center py-8 sm:py-16 px-4 sm:px-6 max-w-4xl mx-auto"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <div className="flex justify-center mb-4 sm:mb-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-primary via-lottery-orange to-lottery-orange-dark rounded-2xl flex items-center justify-center shadow-xl animate-bounce-gentle">
            <Sparkles className="h-8 w-8 sm:h-10 sm:w-10 text-primary-foreground" />
          </div>
        </div>
        
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 sm:mb-6 bg-gradient-to-r from-primary via-lottery-orange to-lottery-orange-dark bg-clip-text text-transparent">
          <span className="inline-block animate-[fade-in_0.6s_ease-out]">LuckySol.xyz</span>
        </h2>
        
        <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-4 sm:mb-6 max-w-3xl mx-auto">
          <span className="inline-block animate-[fade-in_0.8s_ease-out]">Win</span>
          <span className="inline-block ml-1 sm:ml-2 animate-[fade-in_1s_ease-out]">incredible</span>
          <span className="inline-block ml-1 sm:ml-2 animate-[fade-in_1.2s_ease-out]">prizes</span>
        </p>

        {/* Pool progress */}
        <motion.div 
          className="mb-6 sm:mb-8 p-4 sm:p-6 rounded-xl border border-lottery-border bg-lottery-card shadow-lg max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-2">
            <span className="text-sm font-medium text-muted-foreground">Prize pool progress</span>
            <span className="text-base sm:text-lg font-bold text-foreground">{isLoadingPool ? '—' : poolBalanceSol.toFixed(2)} / {poolTargetSol.toLocaleString()} SOL</span>
          </div>
          <Progress value={progressValue} className="h-3 mb-3" />
          <div className="text-sm text-muted-foreground flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
            <span>Tickets remaining: {ticketsRemaining}</span>
            <span>Total raised: {(poolBalanceSol).toFixed(2)} SOL</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            {isPoolComplete ? '🎉 Pool complete! Sales are closed.' : 'Refund guaranteed if the goal isn\'t reached by the deadline.'}
          </p>
        </motion.div>
        
        <p className="text-lg sm:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed px-4">
          <span className="inline-block animate-[fade-in_1.2s_ease-out]">Buy</span>
          <span className="inline-block ml-1 sm:ml-2 animate-[fade-in_1.4s_ease-out]">a ticket</span>
          <span className="inline-block ml-1 sm:ml-2 animate-[fade-in_1.6s_ease-out]">from 0.01 SOL</span>
          <span className="inline-block ml-1 sm:ml-2 animate-[fade-in_1.8s_ease-out]">and join the draw.</span>
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
          <Button 
            onClick={onConnectAndPlay}
            size="lg"
            className="w-full sm:w-auto bg-gradient-to-r from-primary to-lottery-orange-dark text-primary-foreground hover:from-primary/90 hover:to-lottery-orange-dark/90 text-base sm:text-lg px-8 sm:px-12 py-3 sm:py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
          >
            <Trophy className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5" />
            Pick numbers & play
          </Button>
          
          {onLotteryManager && (
            <Button 
              onClick={onLotteryManager}
              variant="outline"
              size="lg"
              className="w-full sm:w-auto border-primary text-primary hover:bg-primary hover:text-primary-foreground text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Trophy className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5" />
              Smart Contract
            </Button>
          )}
        </div>
      </motion.section>

      {/* Purchase + Pool Progress + Prizes */}
      <motion.section 
        className="px-4 sm:px-6 pb-12 sm:pb-16 max-w-7xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.4 }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Colonne achat */}
          <div className="lg:col-span-1 order-1 lg:order-none space-y-6">
            {/* Number Selector */}
            <div>
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-foreground mb-2">Choose Your Numbers</h3>
                <p className="text-sm text-muted-foreground">Select 5 lucky numbers or use quick pick</p>
              </div>
              <NumberSelector
                onNumbersSelected={handleNumbersSelected}
                onQuickPick={handleQuickPick}
                maxNumbers={5}
                maxNumber={49}
                allowMultipleCombinations={selectedTicketQuantity > 1}
                ticketQuantity={selectedTicketQuantity}
                onCombinationsChanged={handleCombinationsChanged}
              />
            </div>

            {/* Purchase Card */}
            <div>
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-foreground mb-2">Buy Tickets</h3>
                <p className="text-sm text-muted-foreground">Choose your ticket package</p>
              </div>
              <TicketPurchaseCard 
                selectedNumbers={selectedNumbers} 
                onPurchaseTickets={handlePurchaseTickets} 
                allowWithoutNumbers 
                onTicketQuantityChange={handleTicketQuantityChange}
                recipient={poolWalletAddress || import.meta.env.VITE_POOL_WALLET || '4egAsAmuctNJVDTzYqXTh9yXcr8LjjnCBSV7hy46xbPf'} 
                rpcEndpoint={import.meta.env.VITE_SOLANA_RPC}
                disabled={isPoolComplete}
              />
            </div>
          </div>

          {/* Grille des lots */}
          <div className="lg:col-span-2">
            <div className="text-left mb-4 sm:mb-6">
              <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">🏆 Exceptional Prizes to Win</h3>
              <p className="text-muted-foreground text-base sm:text-lg">Amazing rewards waiting for lucky winners</p>
              <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                <Badge className="bg-gradient-to-r from-primary to-lottery-orange-dark text-white px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm">
                  🎯 Total Value: ${totalPrizeValue.toLocaleString()}
                </Badge>
                <Badge variant="outline" className="border-primary text-primary text-xs sm:text-sm">
                  🎲 Multiple Winners
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {prizes.map((prize, index) => (
                <motion.div
                  key={prize.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 + index * 0.05 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="h-full"
                >
                  <Card className="h-full bg-gradient-to-br from-lottery-card to-lottery-card/80 border-lottery-border shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group hover:scale-105">
                    <CardContent className="p-0 h-full flex flex-col">
                      <div className="relative h-40 sm:h-48 bg-gradient-to-br from-lottery-orange-light to-accent overflow-hidden">
                        {prize.image ? (
                          <img 
                            src={prize.image} 
                            alt={prize.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <prize.icon className="h-16 w-16 sm:h-20 sm:w-20 text-primary" />
                          </div>
                        )}
                        <div className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-gradient-to-r from-primary to-lottery-orange-dark text-white px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-bold shadow-lg">
                          {prize.value}
                        </div>
                        <div className="absolute top-2 sm:top-3 left-2 sm:left-3 bg-black/50 text-white px-2 py-1 rounded-lg text-xs font-medium">
                          #{prize.id}
                        </div>
                      </div>
                      
                      <div className="p-3 sm:p-5 flex-1 flex flex-col bg-gradient-to-b from-background to-muted/20">
                        <h4 className="font-bold text-foreground text-base sm:text-lg mb-2 line-clamp-1">{prize.title}</h4>
                        <p className="text-muted-foreground text-xs sm:text-sm flex-1 line-clamp-2">{prize.description}</p>
                        <div className="mt-3 sm:mt-4 flex items-center justify-between">
                          <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                            🎁 Prize
                          </Badge>
                          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-primary to-lottery-orange-dark flex items-center justify-center shadow-md">
                            <prize.icon className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* Call to Action */}
      <motion.section 
        className="text-center py-12 sm:py-16 px-4 sm:px-6 bg-gradient-to-r from-primary/5 via-lottery-orange-light/20 to-primary/5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1 }}
      >
        <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 sm:mb-4">Ready to try your luck?</h3>
        <p className="text-muted-foreground mb-6 sm:mb-8 max-w-md mx-auto text-sm sm:text-base">Connect your Solana wallet and choose your lucky numbers. Your next ticket could change everything!</p>
        <Button 
          onClick={onConnectAndPlay}
          size="lg"
          className="w-full sm:w-auto bg-gradient-to-r from-primary to-lottery-orange-dark text-primary-foreground hover:from-primary/90 hover:to-lottery-orange-dark/90 text-base sm:text-lg px-8 sm:px-12 py-3 sm:py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300"
        >
          Start playing
        </Button>
      </motion.section>

      {/* Token Banner - Moved to bottom */}
      <TokenBanner />

      {/* Footer */}
      <Footer 
        onHowToPlay={onHowToPlay}
        onTerms={onTerms}
        onFAQ={onFAQ}
        onAdmin={onAdmin}
      />
    </div>
  );
};

export default HomePage;
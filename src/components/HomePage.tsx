import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Sparkles, Car, Home, DollarSign, Plane, Watch, Laptop, Gamepad2, Gift } from 'lucide-react';
import WalletConnectButton from './WalletConnectButton';
import TicketPurchaseCard from './TicketPurchaseCard';
import { Progress } from "@/components/ui/progress";
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import ferrariImg from '@/assets/IMG_5846.JPG';
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
  { id: 1, title: "RETARDIO NFT", description: "Exclusive NFT prize", image: ferrariImg, icon: Car, value: "$2500" },
];
interface HomePageProps {
  onConnectAndPlay: () => void;
  onPurchaseTickets?: (quantity: number) => void;
  poolWalletAddress?: string;
  poolTargetSol?: number; // objectif en SOL
}

const HomePage = ({ onConnectAndPlay, onPurchaseTickets, poolWalletAddress, poolTargetSol = 2.5 }: HomePageProps) => {
  const [poolBalanceSol, setPoolBalanceSol] = useState<number>(0);
  const [isLoadingPool, setIsLoadingPool] = useState<boolean>(false);

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

  const progressValue = Math.max(0, Math.min(100, poolTargetSol > 0 ? (poolBalanceSol / poolTargetSol) * 100 : 0));
  const ticketsRemaining = useMemo(() => {
    const remainingSol = Math.max(0, poolTargetSol - poolBalanceSol);
    const maxTickets = Math.ceil(remainingSol / 0.01); // si tout le monde prend 1 ticket
    const minTickets = Math.ceil(remainingSol / 0.04); // si tout le monde prend bundle 5
    return { min: minTickets, max: maxTickets };
  }, [poolBalanceSol, poolTargetSol]);
  return (
    <div className="min-h-screen bg-gradient-to-b from-lottery-bg via-background to-lottery-orange-light">
      {/* Header */}
      <motion.header 
        className="flex justify-between items-center p-6 max-w-7xl mx-auto"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-lottery-orange-dark rounded-xl flex items-center justify-center shadow-lg">
            <Trophy className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Crypto Lottery</h1>
            <p className="text-sm text-muted-foreground">Solana blockchain</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <nav className="hidden md:flex items-center gap-4 text-sm">
            <button 
              onClick={() => window.location.href = '#how-to-play'}
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              How to play
            </button>
            <button 
              onClick={() => window.location.href = '#terms'}
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Terms
            </button>
            <button 
              onClick={() => window.location.href = '#faq'}
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              FAQ
            </button>
          </nav>
          <WalletConnectButton />
        </div>
      </motion.header>

      {/* Hero Section */}
      <motion.section 
        className="text-center py-16 px-6 max-w-4xl mx-auto"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-primary via-lottery-orange to-lottery-orange-dark rounded-2xl flex items-center justify-center shadow-xl animate-bounce-gentle">
            <Sparkles className="h-10 w-10 text-primary-foreground" />
          </div>
        </div>
        
        <h2 className="text-5xl md:text-6xl font-bold text-foreground mb-6 bg-gradient-to-r from-primary via-lottery-orange to-lottery-orange-dark bg-clip-text text-transparent">
          <span className="inline-block animate-[fade-in_0.6s_ease-out]">Win</span>
          <span className="inline-block ml-2 animate-[fade-in_0.8s_ease-out]">incredible</span>
          <span className="inline-block ml-2 animate-[fade-in_1s_ease-out]">prizes</span>
        </h2>
        
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
          <span className="inline-block animate-[fade-in_1.2s_ease-out]">Buy</span>
          <span className="inline-block ml-2 animate-[fade-in_1.4s_ease-out]">a ticket</span>
          <span className="inline-block ml-2 animate-[fade-in_1.6s_ease-out]">from 0.01 SOL</span>
          <span className="inline-block ml-2 animate-[fade-in_1.8s_ease-out]">and join the draw.</span>
        </p>
        
        <Button 
          onClick={onConnectAndPlay}
          size="lg"
          className="bg-gradient-to-r from-primary to-lottery-orange-dark text-primary-foreground hover:from-primary/90 hover:to-lottery-orange-dark/90 text-lg px-12 py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
        >
          <Trophy className="mr-3 h-5 w-5" />
          Connect wallet & play
        </Button>
      </motion.section>

      {/* Purchase + Pool Progress + Prizes */}
      <motion.section 
        className="px-6 pb-16 max-w-7xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.4 }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne achat */}
          <div className="lg:col-span-1 order-1 lg:order-none">
            <TicketPurchaseCard selectedNumbers={[]} onPurchaseTickets={handlePurchaseTickets} allowWithoutNumbers recipient={poolWalletAddress || import.meta.env.VITE_POOL_WALLET} rpcEndpoint={import.meta.env.VITE_SOLANA_RPC} />

            {/* Pool progress */
            }
            <div className="mt-6 p-5 rounded-xl border border-lottery-border bg-lottery-card shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Raised for prize pool</span>
                <span className="text-sm font-medium text-foreground">{isLoadingPool ? '—' : poolBalanceSol.toFixed(2)} / {poolTargetSol.toLocaleString()} SOL</span>
              </div>
              <Progress value={progressValue} />
              <div className="mt-2 text-xs text-muted-foreground flex items-center justify-between">
                <span>Tickets remaining: {ticketsRemaining.min}–{ticketsRemaining.max}</span>
                <span>Total raised: {(poolBalanceSol).toFixed(2)} SOL</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Refund guaranteed if the goal isn’t reached by the deadline.</p>
            </div>
          </div>

          {/* Grille des lots */}
          <div className="lg:col-span-2">
            <div className="text-left mb-6">
              <h3 className="text-3xl font-bold text-foreground mb-2">Exceptional prizes to win</h3>
              <p className="text-muted-foreground text-lg">10 amazing rewards for the winners</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {prizes.map((prize, index) => (
                <motion.div
                  key={prize.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 + index * 0.05 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="h-full"
                >
                  <Card className="h-full bg-lottery-card border-lottery-border shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
                    <CardContent className="p-0 h-full flex flex-col">
                      <div className="relative h-40 bg-gradient-to-br from-lottery-orange-light to-accent overflow-hidden">
                        {prize.image ? (
                          <img 
                            src={prize.image} 
                            alt={prize.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <prize.icon className="h-16 w-16 text-primary" />
                          </div>
                        )}
                        <div className="absolute top-3 right-3 bg-primary/90 text-primary-foreground px-2 py-1 rounded-lg text-xs font-medium">
                          {prize.value}
                        </div>
                      </div>
                      
                      <div className="p-4 flex-1 flex flex-col">
                        <h4 className="font-bold text-foreground text-sm mb-2 line-clamp-1">{prize.title}</h4>
                        <p className="text-muted-foreground text-xs flex-1 line-clamp-2">{prize.description}</p>
                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-xs text-primary font-medium">Prize #{prize.id}</span>
                          <div className="w-6 h-6 rounded-full bg-lottery-orange-light flex items-center justify-center">
                            <prize.icon className="h-3 w-3 text-primary" />
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
        className="text-center py-16 px-6 bg-gradient-to-r from-primary/5 via-lottery-orange-light/20 to-primary/5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1 }}
      >
        <h3 className="text-3xl font-bold text-foreground mb-4">Ready to try your luck?</h3>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">Connect your Solana wallet and choose your lucky numbers. Your next ticket could change everything!</p>
        <Button 
          onClick={onConnectAndPlay}
          size="lg"
          className="bg-gradient-to-r from-primary to-lottery-orange-dark text-primary-foreground hover:from-primary/90 hover:to-lottery-orange-dark/90 text-lg px-12 py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300"
        >
          Start playing
        </Button>
      </motion.section>
    </div>
  );
};

export default HomePage;
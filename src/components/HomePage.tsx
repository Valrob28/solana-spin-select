import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Sparkles, Car, Home, DollarSign, Plane, Watch, Laptop, Gamepad2, Gift } from 'lucide-react';
import WalletConnectButton from './WalletConnectButton';
import ferrariImg from '@/assets/ferrari-488.jpg';
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
  { id: 1, title: "Ferrari 488 Italia", description: "Luxury sports car", image: ferrariImg, icon: Car, value: "$250,000" },
  { id: 2, title: "Mercedes-AMG GT", description: "High-performance coupe", image: mercedesImg, icon: Car, value: "$150,000" },
  { id: 3, title: "Luxury Cash Prize", description: "$50,000 in cash", image: cashPrizeImg, icon: DollarSign, value: "$50,000" },
  { id: 4, title: "Dream Vacation for 2", description: "Luxury resort getaway", image: dreamVacationImg, icon: Plane, value: "$25,000" },
  { id: 5, title: "Real Estate Down Payment", description: "$20,000 cash for your dream home", icon: Home, value: "$20,000" },
  { id: 6, title: "High-End Tech Pack", description: "iPhone 15 Pro + latest gadgets", icon: Laptop, value: "$5,000" },
  { id: 7, title: "Rolex Submariner", description: "Luxury Swiss timepiece", image: rolexImg, icon: Watch, value: "$15,000" },
  { id: 8, title: "MacBook Pro M3 Max", description: "Top-of-the-line laptop", icon: Laptop, value: "$4,000" },
  { id: 9, title: "Gaming & Entertainment Bundle", description: "PS5, Xbox, accessories & games", icon: Gamepad2, value: "$2,500" },
  { id: 10, title: "Consolation Gifts", description: "Gift cards & exclusive merch", icon: Gift, value: "$500" }
];

interface HomePageProps {
  onConnectAndPlay: () => void;
}

const HomePage = ({ onConnectAndPlay }: HomePageProps) => {
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
            <p className="text-sm text-muted-foreground">Solana Blockchain</p>
          </div>
        </div>
        <WalletConnectButton />
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
          Win Incredible Prizes
        </h2>
        
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
          Buy a ticket for <span className="font-bold text-primary">0.02 SOL</span>, pick your lucky numbers, 
          and stand a chance to win amazing prizes worth over $500,000!
        </p>
        
        <Button 
          onClick={onConnectAndPlay}
          size="lg"
          className="bg-gradient-to-r from-primary to-lottery-orange-dark text-primary-foreground hover:from-primary/90 hover:to-lottery-orange-dark/90 text-lg px-12 py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
        >
          <Trophy className="mr-3 h-5 w-5" />
          Connect Wallet & Play Now
        </Button>
      </motion.section>

      {/* Prizes Grid */}
      <motion.section 
        className="px-6 pb-16 max-w-7xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.4 }}
      >
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-foreground mb-4">Amazing Prizes to Win</h3>
          <p className="text-muted-foreground text-lg">10 incredible prizes waiting for lucky winners</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {prizes.map((prize, index) => (
            <motion.div
              key={prize.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="h-full"
            >
              <Card className="h-full bg-lottery-card border-lottery-border shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
                <CardContent className="p-0 h-full flex flex-col">
                  {/* Prize Image or Icon */}
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
                  
                  {/* Prize Info */}
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
      </motion.section>

      {/* Call to Action */}
      <motion.section 
        className="text-center py-16 px-6 bg-gradient-to-r from-primary/5 via-lottery-orange-light/20 to-primary/5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1 }}
      >
        <h3 className="text-3xl font-bold text-foreground mb-4">Ready to Win?</h3>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          Connect your Solana wallet and pick your lucky numbers. Your next ticket could change everything!
        </p>
        <Button 
          onClick={onConnectAndPlay}
          size="lg"
          className="bg-gradient-to-r from-primary to-lottery-orange-dark text-primary-foreground hover:from-primary/90 hover:to-lottery-orange-dark/90 text-lg px-12 py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300"
        >
          Start Playing Now
        </Button>
      </motion.section>
    </div>
  );
};

export default HomePage;
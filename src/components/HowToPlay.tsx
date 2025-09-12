import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, MousePointer, ShoppingCart, Trophy, Clock, Gift } from 'lucide-react';

const steps = [
  {
    id: 1,
    title: "Connect Your Wallet",
    description: "Link your Solana wallet (Phantom or Solflare) to get started",
    icon: Wallet,
    details: ["Supports Phantom, Solflare, and other Solana wallets", "Your wallet must have SOL for ticket purchases", "Connection is secure and decentralized"]
  },
  {
    id: 2,
    title: "Select Your Numbers",
    description: "Choose 5 numbers from 1 to 49 or use Quick Pick for random selection",
    icon: MousePointer,
    details: ["Pick 5 unique numbers from 1-49", "Use Quick Pick for instant random selection", "Review your selection before purchase"]
  },
  {
    id: 3,
    title: "Purchase Tickets",
    description: "Buy tickets for 0.01 SOL each with bulk discounts available",
    icon: ShoppingCart,
    details: ["Individual tickets: 0.01 SOL each", "5 tickets bundle: 0.04 SOL (20% discount)", "10 tickets bundle: 0.07 SOL (30% discount)"]
  },
  {
    id: 4,
    title: "Wait for Pool Target",
    description: "Draw happens when the prize pool reaches 2.5 SOL target",
    icon: Clock,
    details: ["Pool target: 2.5 SOL collected", "Real-time progress tracking", "Automatic draw when target reached"]
  },
  {
    id: 5,
    title: "Check Results & Claim",
    description: "Match numbers to win incredible NFT and crypto prizes",
    icon: Trophy,
    details: ["Match all 5 numbers for the jackpot", "Win RETARDIO NFT ($450) or BAG OF PENGU ($50)", "Prizes automatically sent to your wallet"]
  }
];

const HowToPlay = () => {
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h2 className="text-4xl font-bold text-foreground mb-4">How to Play</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Solana Lottery tickets cost 0.01 SOL per play, with bulk discounts available. Players pick 5 numbers from 1 to 49 or use Quick Pick for random selection. The draw happens when the prize pool reaches 2.5 SOL target.
        </p>
      </motion.div>

      <div className="grid gap-6 md:gap-8">
        {steps.map((step, index) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <Card className="bg-lottery-card border-lottery-border shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-lottery-orange-dark rounded-xl flex items-center justify-center shadow-lg">
                      <step.icon className="h-6 w-6 text-primary-foreground" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge className="bg-primary/10 text-primary border-primary/20">
                        Step {step.id}
                      </Badge>
                      <CardTitle className="text-xl text-foreground">{step.title}</CardTitle>
                    </div>
                    <p className="text-muted-foreground text-base">{step.description}</p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-2">
                  {step.details.map((detail, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <p className="text-sm text-muted-foreground">{detail}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Prize Structure */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <Card className="bg-gradient-to-r from-primary/5 to-lottery-orange-light/20 border-primary/20">
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center gap-2">
              <Gift className="h-6 w-6 text-primary" />
              Prize Structure
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-center p-4 bg-lottery-card rounded-lg">
                <div className="text-2xl font-bold text-primary mb-2">5 Matches</div>
                <div className="text-sm text-muted-foreground">Jackpot Prize</div>
                <div className="font-semibold text-foreground">RETARDIO NFT - $450</div>
              </div>
              <div className="text-center p-4 bg-lottery-card rounded-lg">
                <div className="text-2xl font-bold text-primary mb-2">4 Matches</div>
                <div className="text-sm text-muted-foreground">Secondary Prize</div>
                <div className="font-semibold text-foreground">BAG OF PENGU - $50</div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
              <h4 className="font-semibold text-foreground mb-2">🎯 Pool Target System</h4>
              <p className="text-sm text-muted-foreground">
                The lottery draw happens automatically when the prize pool reaches 2.5 SOL target. 
                Track progress in real-time and watch the pool fill up with each ticket purchase!
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default HowToPlay;
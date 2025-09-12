import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useWallet } from '@solana/wallet-adapter-react';
import { Trophy, Users, Clock, Target, CheckCircle, AlertCircle } from 'lucide-react';
import { LotteryProgram, RaffleData } from '@/lib/lotteryProgram';
import { Connection } from '@solana/web3.js';

interface LotteryManagerProps {
  onBack: () => void;
}

const LotteryManager = ({ onBack }: LotteryManagerProps) => {
  const [raffleData, setRaffleData] = useState<RaffleData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConductingDraw, setIsConductingDraw] = useState(false);
  const { connected, publicKey, wallet } = useWallet();
  const { toast } = useToast();

  const fetchRaffleData = async () => {
    if (!connected || !wallet) return;
    
    try {
      setIsLoading(true);
      const connection = new Connection(
        import.meta.env.VITE_SOLANA_RPC || 'https://api.mainnet-beta.solana.com',
        'confirmed'
      );
      
      const lotteryProgram = new LotteryProgram(connection, wallet.adapter);
      const data = await lotteryProgram.getRaffleData();
      setRaffleData(data);
    } catch (error) {
      console.error('Error fetching raffle data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch lottery data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const conductDraw = async () => {
    if (!connected || !wallet || !publicKey) return;
    
    try {
      setIsConductingDraw(true);
      const connection = new Connection(
        import.meta.env.VITE_SOLANA_RPC || 'https://api.mainnet-beta.solana.com',
        'confirmed'
      );
      
      const lotteryProgram = new LotteryProgram(connection, wallet.adapter);
      const signature = await lotteryProgram.conductDraw();
      
      toast({
        title: "Draw conducted successfully!",
        description: `Transaction: ${signature.slice(0, 8)}...`,
      });
      
      // Refresh data
      await fetchRaffleData();
    } catch (error: any) {
      console.error('Error conducting draw:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to conduct draw",
        variant: "destructive",
      });
    } finally {
      setIsConductingDraw(false);
    }
  };

  useEffect(() => {
    fetchRaffleData();
    const interval = setInterval(fetchRaffleData, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, [connected, wallet]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-lottery-bg to-lottery-orange-light p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading lottery data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!raffleData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-lottery-bg to-lottery-orange-light p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-muted-foreground">No lottery data found</p>
              <Button onClick={onBack} className="mt-4">
                Back to Home
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const progressValue = Math.max(0, Math.min(100, (raffleData.totalSolCollected / raffleData.targetSol) * 100));
  const isPoolComplete = raffleData.totalSolCollected >= raffleData.targetSol;
  const isAuthority = connected && publicKey && publicKey.equals(raffleData.authority);

  return (
    <div className="min-h-screen bg-gradient-to-b from-lottery-bg to-lottery-orange-light p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
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
            <h1 className="text-3xl font-bold text-foreground">Lottery Manager</h1>
            <p className="text-muted-foreground">Smart Contract Dashboard</p>
          </div>
        </motion.div>

        {/* Lottery Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <Card className="bg-lottery-card border-lottery-border">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Target</p>
                  <p className="text-2xl font-bold text-foreground">{raffleData.targetSol} SOL</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-lottery-card border-lottery-border">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
                  <Trophy className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Collected</p>
                  <p className="text-2xl font-bold text-foreground">{raffleData.totalSolCollected.toFixed(2)} SOL</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-lottery-card border-lottery-border">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tickets Sold</p>
                  <p className="text-2xl font-bold text-foreground">{raffleData.totalTicketsSold}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-lottery-card border-lottery-border">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center">
                  <Clock className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge 
                    variant={raffleData.status === 'Active' ? 'default' : 
                            raffleData.status === 'PoolComplete' ? 'secondary' : 'outline'}
                    className="text-xs"
                  >
                    {raffleData.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <Card className="bg-lottery-card border-lottery-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Prize Pool Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Progress</span>
                  <span className="text-lg font-bold text-foreground">
                    {raffleData.totalSolCollected.toFixed(2)} / {raffleData.targetSol} SOL
                  </span>
                </div>
                <Progress value={progressValue} className="h-3" />
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{progressValue.toFixed(1)}% complete</span>
                  <span>{isPoolComplete ? '🎉 Pool complete!' : 'In progress...'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Winning Numbers */}
        {raffleData.isDrawComplete && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <Card className="bg-lottery-card border-lottery-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Winning Numbers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3 justify-center">
                  {raffleData.winningNumbers.map((number, index) => (
                    <div
                      key={index}
                      className="w-12 h-12 bg-primary text-primary-foreground rounded-xl flex items-center justify-center font-bold text-lg shadow-md"
                    >
                      {number}
                    </div>
                  ))}
                </div>
                {raffleData.winner && !raffleData.winner.equals(publicKey || new PublicKey('11111111111111111111111111111111')) && (
                  <div className="mt-4 text-center">
                    <p className="text-sm text-muted-foreground">Winner:</p>
                    <p className="font-mono text-sm">{raffleData.winner.toString().slice(0, 8)}...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Authority Actions */}
        {isAuthority && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="bg-lottery-card border-lottery-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Authority Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isPoolComplete && !raffleData.isDrawComplete && (
                    <Button
                      onClick={conductDraw}
                      disabled={isConductingDraw}
                      className="w-full bg-gradient-to-r from-primary to-lottery-orange-dark"
                    >
                      {isConductingDraw ? 'Conducting Draw...' : 'Conduct Draw'}
                    </Button>
                  )}
                  
                  {raffleData.isDrawComplete && (
                    <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
                      <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <p className="text-green-800 font-medium">Draw Complete!</p>
                      <p className="text-sm text-green-700">Winning numbers have been generated</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Smart Contract Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8"
        >
          <Card className="bg-lottery-card border-lottery-border">
            <CardHeader>
              <CardTitle>Smart Contract Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Program ID:</span>
                  <span className="font-mono">Lottery111...1111</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ticket Price:</span>
                  <span>{raffleData.ticketPrice} SOL</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created:</span>
                  <span>{new Date(raffleData.createdAt * 1000).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Authority:</span>
                  <span className="font-mono">{raffleData.authority.toString().slice(0, 8)}...</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default LotteryManager;


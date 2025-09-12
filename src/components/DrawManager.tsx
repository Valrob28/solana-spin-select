import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Connection } from '@solana/web3.js';
import { Trophy, Users, Calendar, Hash, Gift, CheckCircle } from 'lucide-react';
import { conductDraw, saveDrawResult, getLastDraw, DrawResult, Winner } from '@/lib/drawSystem';

interface DrawManagerProps {
  isAdmin?: boolean;
}

const DrawManager = ({ isAdmin = false }: DrawManagerProps) => {
  const [isConductingDraw, setIsConductingDraw] = useState(false);
  const [lastDraw, setLastDraw] = useState<DrawResult | null>(getLastDraw());
  const { toast } = useToast();

  const handleConductDraw = async () => {
    if (!isAdmin) {
      toast({
        title: "Access denied",
        description: "Only administrators can conduct draws.",
        variant: "destructive",
      });
      return;
    }

    setIsConductingDraw(true);

    try {
      const connection = new Connection('https://api.mainnet-beta.solana.com');
      
      // Récupérer le hash du dernier block
      const latestBlockhash = await connection.getLatestBlockhash();
      const blockHash = latestBlockhash.blockhash;

      // Effectuer le tirage
      const drawResult = await conductDraw(connection, blockHash);
      
      // Sauvegarder le résultat
      saveDrawResult(drawResult);
      setLastDraw(drawResult);

      toast({
        title: "Draw completed!",
        description: `Winning numbers: ${drawResult.winningNumbers.join(', ')}`,
      });

    } catch (error) {
      console.error('Draw error:', error);
      toast({
        title: "Draw failed",
        description: "An error occurred while conducting the draw.",
        variant: "destructive",
      });
    } finally {
      setIsConductingDraw(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const getMatchesColor = (matches: number) => {
    switch (matches) {
      case 5: return 'bg-yellow-500 text-white';
      case 4: return 'bg-purple-500 text-white';
      case 3: return 'bg-blue-500 text-white';
      case 2: return 'bg-green-500 text-white';
      case 1: return 'bg-orange-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="space-y-6">
      {/* Draw Controls */}
      {isAdmin && (
        <Card className="bg-lottery-card border-lottery-border shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              Draw Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleConductDraw}
              disabled={isConductingDraw}
              size="lg"
              className="w-full bg-gradient-to-r from-primary to-lottery-orange-dark text-primary-foreground hover:from-primary/90 hover:to-lottery-orange-dark/90"
            >
              {isConductingDraw ? 'Conducting Draw...' : 'Conduct Draw'}
            </Button>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              This will generate winning numbers and determine all winners
            </p>
          </CardContent>
        </Card>
      )}

      {/* Last Draw Results */}
      {lastDraw && (
        <Card className="bg-lottery-card border-lottery-border shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Last Draw Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Draw Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Draw Date</p>
                <p className="font-semibold">{formatDate(lastDraw.drawDate)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Total Tickets</p>
                <p className="font-semibold">{lastDraw.totalTickets}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Prize Pool</p>
                <p className="font-semibold">{lastDraw.totalPrizePool.toFixed(2)} SOL</p>
              </div>
            </div>

            {/* Winning Numbers */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Winning Numbers</p>
              <div className="flex justify-center gap-2">
                {lastDraw.winningNumbers.map((number, index) => (
                  <motion.div
                    key={number}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-lg shadow-lg"
                  >
                    {number}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Draw Hash */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Draw Hash</p>
              <p className="font-mono text-xs bg-muted p-2 rounded">
                {lastDraw.drawHash}
              </p>
            </div>

            {/* Winners */}
            {lastDraw.winners.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-3">Winners ({lastDraw.winners.length})</p>
                <div className="space-y-2">
                  {lastDraw.winners.map((winner, index) => (
                    <motion.div
                      key={winner.ticketHash}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex gap-1">
                            {winner.numbers.map((num) => (
                              <div
                                key={num}
                                className="w-6 h-6 bg-primary text-primary-foreground rounded text-xs flex items-center justify-center font-bold"
                              >
                                {num}
                              </div>
                            ))}
                          </div>
                          <div>
                            <p className="font-semibold text-green-800">{winner.prize}</p>
                            <p className="text-sm text-green-600">{winner.prizeValue}</p>
                          </div>
                        </div>
                        <Badge className={getMatchesColor(winner.matches)}>
                          {winner.matches} matches
                        </Badge>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {lastDraw.winners.length === 0 && (
              <div className="text-center py-4">
                <p className="text-muted-foreground">No winners this draw</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!lastDraw && (
        <Card className="bg-lottery-card border-lottery-border shadow-lg">
          <CardContent className="p-8 text-center">
            <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Draw Yet</h3>
            <p className="text-muted-foreground">The first draw hasn't been conducted yet.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DrawManager;


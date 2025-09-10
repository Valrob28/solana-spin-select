import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, ExternalLink, Trophy, Users, DollarSign, Hash } from 'lucide-react';

interface Draw {
  id: string;
  drawDate: string;
  winningNumbers: number[];
  totalPrizePool: string;
  winnersCount: number;
  vrfProof: string;
  status: 'completed' | 'pending';
}

const mockDraws: Draw[] = [
  {
    id: 'draw-001',
    drawDate: '2024-01-16',
    winningNumbers: [7, 14, 21, 28, 35],
    totalPrizePool: '150.5 SOL',
    winnersCount: 3,
    vrfProof: 'https://explorer.solana.com/tx/abcd1234...',
    status: 'completed'
  },
  {
    id: 'draw-002',
    drawDate: '2024-01-15',
    winningNumbers: [2, 13, 19, 31, 44],
    totalPrizePool: '98.2 SOL',
    winnersCount: 1,
    vrfProof: 'https://explorer.solana.com/tx/efgh5678...',
    status: 'completed'
  },
  {
    id: 'draw-003',
    drawDate: '2024-01-14',
    winningNumbers: [5, 12, 18, 29, 42],
    totalPrizePool: '75.8 SOL',
    winnersCount: 2,
    vrfProof: 'https://explorer.solana.com/tx/ijkl9012...',
    status: 'completed'
  },
  {
    id: 'draw-004',
    drawDate: '2024-01-17',
    winningNumbers: [],
    totalPrizePool: '0 SOL',
    winnersCount: 0,
    vrfProof: '',
    status: 'pending'
  }
];

const DrawHistory = () => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-4">Draw History</h2>
        <p className="text-muted-foreground text-lg">
          Transparent and verifiable lottery draws powered by Solana VRF
        </p>
      </div>

      <div className="space-y-4">
        {mockDraws.map((draw, index) => (
          <motion.div
            key={draw.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="bg-lottery-card border-lottery-border shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Draw #{draw.id.split('-')[1]}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={draw.status === 'completed' ? 'default' : 'secondary'}>
                      {draw.status === 'completed' ? 'Completed' : 'Upcoming'}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {new Date(draw.drawDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                {draw.status === 'pending' ? (
                  <div className="text-center py-8">
                    <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">Next Draw</h3>
                    <p className="text-muted-foreground">
                      Scheduled for {new Date(draw.drawDate).toLocaleDateString()}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Winning Numbers */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Trophy className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold text-foreground">Winning Numbers</h3>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {draw.winningNumbers.map((number, idx) => (
                          <motion.div
                            key={number}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: idx * 0.1 }}
                            className="w-12 h-12 bg-gradient-to-br from-primary to-lottery-orange-dark text-primary-foreground rounded-xl flex items-center justify-center font-bold text-lg shadow-lg"
                          >
                            {number}
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Draw Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-muted/50 rounded-lg p-4 text-center">
                        <DollarSign className="h-8 w-8 text-primary mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Prize Pool</p>
                        <p className="font-bold text-lg text-foreground">{draw.totalPrizePool}</p>
                      </div>
                      
                      <div className="bg-muted/50 rounded-lg p-4 text-center">
                        <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Winners</p>
                        <p className="font-bold text-lg text-foreground">{draw.winnersCount}</p>
                      </div>
                      
                      <div className="bg-muted/50 rounded-lg p-4 text-center">
                        <Hash className="h-8 w-8 text-primary mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Draw Date</p>
                        <p className="font-bold text-sm text-foreground">
                          {new Date(draw.drawDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* VRF Proof */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-green-800 mb-1">Verifiable Random Function (VRF)</p>
                          <p className="text-sm text-green-700">
                            This draw was provably fair using Solana's VRF
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(draw.vrfProof, '_blank')}
                          className="border-green-300 text-green-700 hover:bg-green-100"
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          View Proof
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Fairness Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
      >
        <Card className="bg-gradient-to-r from-primary/5 to-lottery-orange-light/20 border-primary/20">
          <CardContent className="p-6 text-center">
            <Trophy className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-2">Provably Fair</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Every draw uses Solana's Verifiable Random Function (VRF) to ensure complete transparency 
              and fairness. All draw results are permanently recorded on the blockchain and can be verified by anyone.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default DrawHistory;
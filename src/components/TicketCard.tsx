import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Ticket, Trophy, Clock, CheckCircle, XCircle, Gift } from 'lucide-react';

interface Ticket {
  id?: string;
  numbers: number[];
  purchaseDate?: string;
  status?: 'pending' | 'won' | 'lost';
  prize?: string;
  drawDate?: string;
  quantity?: number;
  timestamp?: number;
  txHash?: string;
}

interface TicketCardProps {
  tickets: Ticket[];
  onClaimPrize?: (ticketId: string) => void;
}

const mockTickets: Ticket[] = [
  {
    id: '1',
    numbers: [7, 14, 21, 28, 35],
    purchaseDate: '2024-01-15',
    status: 'won',
    prize: 'High-End Tech Pack',
    drawDate: '2024-01-16'
  },
  {
    id: '2',
    numbers: [3, 9, 18, 27, 42],
    purchaseDate: '2024-01-14',
    status: 'lost',
    drawDate: '2024-01-16'
  },
  {
    id: '3',
    numbers: [5, 12, 19, 33, 47],
    purchaseDate: '2024-01-16',
    status: 'pending',
  }
];

const TicketCard = ({ tickets = mockTickets, onClaimPrize }: TicketCardProps) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'won':
        return <Trophy className="h-4 w-4" />;
      case 'lost':
        return <XCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      default:
        return <Ticket className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'won':
        return 'bg-green-500 text-white';
      case 'lost':
        return 'bg-red-500 text-white';
      case 'pending':
        return 'bg-yellow-500 text-white';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (tickets.length === 0) {
    return (
      <Card className="bg-lottery-card border-lottery-border shadow-lg">
        <CardContent className="p-8 text-center">
          <Ticket className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Tickets Yet</h3>
          <p className="text-muted-foreground">Purchase your first lottery ticket to see it here!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {tickets.map((ticket, index) => (
        <motion.div
          key={ticket.txHash || index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <Card className="bg-lottery-card border-lottery-border shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Ticket className="h-5 w-5 text-primary" />
                  Ticket #{index + 1}
                </CardTitle>
                <Badge className={getStatusColor(ticket.status || 'pending')}>
                  <span className="flex items-center gap-1">
                    {getStatusIcon(ticket.status || 'pending')}
                    {(ticket.status || 'pending').charAt(0).toUpperCase() + (ticket.status || 'pending').slice(1)}
                  </span>
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                {/* Numbers */}
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Your Numbers</p>
                  <div className="flex gap-2 flex-wrap">
                    {ticket.numbers.map((number) => (
                      <div
                        key={number}
                        className="w-10 h-10 bg-primary text-primary-foreground rounded-lg flex items-center justify-center font-bold text-sm shadow-sm"
                      >
                        {number}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Transaction Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Purchase Date</p>
                    <p className="font-medium text-foreground">
                      {ticket.timestamp ? new Date(ticket.timestamp).toLocaleDateString() : 'Unknown'}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Transaction Hash</p>
                    <p className="font-medium text-foreground font-mono text-xs">
                      {ticket.txHash ? `${ticket.txHash.slice(0, 8)}...${ticket.txHash.slice(-8)}` : 'Pending'}
                    </p>
                  </div>
                </div>

                {/* Quantity */}
                {ticket.quantity && (
                  <div className="text-sm">
                    <p className="text-muted-foreground">Quantity</p>
                    <p className="font-medium text-foreground">{ticket.quantity} ticket(s)</p>
                  </div>
                )}

                {/* Prize Info */}
                {ticket.status === 'won' && ticket.prize && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Gift className="h-5 w-5 text-green-600" />
                      <p className="font-semibold text-green-800">Congratulations! You Won!</p>
                    </div>
                    <p className="text-green-700 mb-3">{ticket.prize}</p>
                    {onClaimPrize && (
                      <Button
                        onClick={() => onClaimPrize(ticket.id)}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Claim Prize
                      </Button>
                    )}
                  </div>
                )}

                {ticket.status === 'pending' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-yellow-600" />
                      <p className="text-yellow-800">Waiting for next draw...</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default TicketCard;
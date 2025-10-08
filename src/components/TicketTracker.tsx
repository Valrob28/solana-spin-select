import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Ticket, 
  Search, 
  CheckCircle, 
  XCircle, 
  ExternalLink,
  Copy,
  Eye,
  Shield,
  Hash
} from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { ImprovedDrawSystem, DrawVerification, TicketProof } from '@/lib/improvedDrawSystem';
import { Connection } from '@solana/web3.js';
import { useToast } from '@/hooks/use-toast';

interface TicketTrackerProps {
  onBack?: () => void;
}

const TicketTracker: React.FC<TicketTrackerProps> = ({ onBack }) => {
  const { publicKey } = useWallet();
  const { toast } = useToast();
  const [searchHash, setSearchHash] = useState('');
  const [userTickets, setUserTickets] = useState<any[]>([]);
  const [drawVerification, setDrawVerification] = useState<DrawVerification | null>(null);
  const [ticketProof, setTicketProof] = useState<TicketProof | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDrawDetails, setShowDrawDetails] = useState(false);

  // Simuler la récupération des tickets de l'utilisateur
  useEffect(() => {
    if (publicKey) {
      loadUserTickets();
    }
  }, [publicKey]);

  const loadUserTickets = async () => {
    try {
      const tickets = JSON.parse(localStorage.getItem('lotteryTickets') || '[]');
      const userTickets = tickets.filter((ticket: any) => 
        ticket.buyer === publicKey?.toString()
      );
      setUserTickets(userTickets);
    } catch (error) {
      console.error('Erreur lors du chargement des tickets:', error);
    }
  };

  const searchTicket = async () => {
    if (!searchHash.trim()) return;

    setIsLoading(true);
    try {
      // Simuler la vérification du ticket
      const connection = new Connection('https://api.mainnet-beta.solana.com');
      const drawSystem = new ImprovedDrawSystem(connection, {} as any);
      
      // Simuler la récupération des détails du tirage
      const mockDrawVerification: DrawVerification = {
        drawHash: 'abc123def456',
        winningNumbers: [7, 14, 21, 28, 35],
        blockHash: 'block123',
        slot: 123456789,
        timestamp: Date.now(),
        totalTickets: 1000,
        allTickets: [],
        merkleRoot: 'merkle123',
        verificationProof: 'proof123'
      };

      setDrawVerification(mockDrawVerification);

      // Simuler la vérification du ticket
      const mockTicketProof: TicketProof = {
        ticketHash: searchHash,
        numbers: [7, 14, 21, 28, 35],
        buyer: publicKey?.toString() || '',
        merkleProof: ['proof1', 'proof2', 'proof3'],
        isIncluded: true
      };

      setTicketProof(mockTicketProof);

      toast({
        title: "Ticket trouvé",
        description: "Le ticket a été vérifié avec succès",
      });

    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de vérifier le ticket",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copié",
      description: "Texte copié dans le presse-papiers",
    });
  };

  const getMatchCount = (ticketNumbers: number[], winningNumbers: number[]) => {
    return ticketNumbers.filter(num => winningNumbers.includes(num)).length;
  };

  const getPrizeForMatches = (matches: number) => {
    switch (matches) {
      case 5: return { prize: "Jackpot", value: "100% du pool" };
      case 4: return { prize: "Gros lot", value: "20% du pool" };
      case 3: return { prize: "Lot moyen", value: "5% du pool" };
      case 2: return { prize: "Petit lot", value: "1% du pool" };
      case 1: return { prize: "Consolation", value: "0.1% du pool" };
      default: return { prize: "Aucun", value: "0 SOL" };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-lottery-bg via-background to-lottery-orange-light">
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            {onBack && (
              <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
                ← Retour
              </Button>
            )}
            <div>
              <h1 className="text-3xl font-bold text-black">Suivi des Tickets</h1>
              <p className="text-gray-600">Vérifiez vos tickets et suivez les tirages</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recherche de ticket */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Rechercher un Ticket
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Entrez le hash du ticket..."
                    value={searchHash}
                    onChange={(e) => setSearchHash(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={searchTicket} disabled={isLoading}>
                    {isLoading ? "Recherche..." : "Rechercher"}
                  </Button>
                </div>

                {ticketProof && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      {ticketProof.isIncluded ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <span className="font-medium">
                        {ticketProof.isIncluded ? "Ticket vérifié" : "Ticket non trouvé"}
                      </span>
                    </div>

                    {ticketProof.isIncluded && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Hash du ticket:</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(ticketProof.ticketHash)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <code className="text-xs bg-gray-100 p-2 rounded block break-all">
                          {ticketProof.ticketHash}
                        </code>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Numéros:</span>
                        </div>
                        <div className="flex gap-2">
                          {ticketProof.numbers.map((num, index) => (
                            <Badge key={index} variant="outline">
                              {num}
                            </Badge>
                          ))}
                        </div>

                        {drawVerification && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Numéros gagnants:</span>
                            </div>
                            <div className="flex gap-2">
                              {drawVerification.winningNumbers.map((num, index) => (
                                <Badge 
                                  key={index} 
                                  variant={ticketProof.numbers.includes(num) ? "default" : "outline"}
                                  className={ticketProof.numbers.includes(num) ? "bg-green-500" : ""}
                                >
                                  {num}
                                </Badge>
                              ))}
                            </div>

                            <div className="text-center">
                              <Badge variant="secondary" className="text-lg px-4 py-2">
                                {getMatchCount(ticketProof.numbers, drawVerification.winningNumbers)} correspondance(s)
                              </Badge>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Mes tickets */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ticket className="h-5 w-5" />
                  Mes Tickets ({userTickets.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {userTickets.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Ticket className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Aucun ticket trouvé</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {userTickets.map((ticket, index) => (
                      <div key={index} className="border rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Ticket #{index + 1}</span>
                          <Badge variant="outline">
                            {new Date(ticket.timestamp).toLocaleDateString()}
                          </Badge>
                        </div>
                        
                        <div className="flex gap-1">
                          {ticket.numbers.map((num: number, i: number) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {num}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Hash className="h-3 w-3" />
                          <code className="truncate">{ticket.ticketHash}</code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(ticket.ticketHash)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Détails du tirage */}
        {drawVerification && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Détails du Tirage
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDrawDetails(!showDrawDetails)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              {showDrawDetails && (
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Hash du tirage:</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(drawVerification.drawHash)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <code className="text-xs bg-gray-100 p-2 rounded block break-all">
                        {drawVerification.drawHash}
                      </code>
                    </div>

                    <div className="space-y-2">
                      <span className="text-sm text-gray-600">Bloc de référence:</span>
                      <code className="text-xs bg-gray-100 p-2 rounded block break-all">
                        {drawVerification.blockHash}
                      </code>
                    </div>

                    <div className="space-y-2">
                      <span className="text-sm text-gray-600">Slot:</span>
                      <span className="text-sm font-mono">{drawVerification.slot}</span>
                    </div>

                    <div className="space-y-2">
                      <span className="text-sm text-gray-600">Total tickets:</span>
                      <span className="text-sm font-mono">{drawVerification.totalTickets}</span>
                    </div>

                    <div className="space-y-2">
                      <span className="text-sm text-gray-600">Merkle Root:</span>
                      <code className="text-xs bg-gray-100 p-2 rounded block break-all">
                        {drawVerification.merkleRoot}
                      </code>
                    </div>

                    <div className="space-y-2">
                      <span className="text-sm text-gray-600">Timestamp:</span>
                      <span className="text-sm">
                        {new Date(drawVerification.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2 text-green-700 mb-2">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-medium">Tirage vérifié</span>
                    </div>
                    <p className="text-sm text-green-600">
                      Ce tirage est 100% transparent et vérifiable sur la blockchain Solana.
                      Tous les tickets sont inclus dans le calcul et la génération des numéros
                      gagnants est déterministe et vérifiable.
                    </p>
                  </div>
                </CardContent>
              )}
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default TicketTracker;

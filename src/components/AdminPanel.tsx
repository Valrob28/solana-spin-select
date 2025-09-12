import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Users, 
  DollarSign, 
  Clock, 
  Search, 
  Download,
  Eye,
  Filter,
  RefreshCw,
  Ticket,
  Hash,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { simulatedAdminService, TicketData, AdminStats } from '@/lib/simulatedAdminService';
import { toast } from 'sonner';

const AdminPanel = () => {
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [filteredTickets, setFilteredTickets] = useState<TicketData[]>([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [ticketsData, statsData] = await Promise.all([
        simulatedAdminService.getAllTickets(),
        simulatedAdminService.getAdminStats()
      ]);
      
      setTickets(ticketsData);
      setStats(statsData);
      setFilteredTickets(ticketsData);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      toast.error('Erreur lors du chargement des données admin');
    } finally {
      setLoading(false);
    }
  };

  const generateDemoData = () => {
    simulatedAdminService.generateDemoTickets();
    toast.success('Données de démonstration générées !');
    loadData();
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    let filtered = tickets;

    if (searchTerm) {
      filtered = filtered.filter(ticket => 
        ticket.transactionHash.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.buyer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.numbers.some(num => num.toString().includes(searchTerm))
      );
    }

    if (selectedPlayer) {
      filtered = filtered.filter(ticket => ticket.buyer === selectedPlayer);
    }

    setFilteredTickets(filtered);
  }, [tickets, searchTerm, selectedPlayer]);

  const exportTickets = () => {
    const csvContent = [
      ['Transaction Hash', 'Buyer', 'Numbers', 'Amount (SOL)', 'Timestamp', 'Ticket Hash'],
      ...filteredTickets.map(ticket => [
        ticket.transactionHash,
        ticket.buyer,
        ticket.numbers.join(','),
        ticket.amount.toString(),
        new Date(ticket.timestamp).toISOString(),
        ticket.ticketHash
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `luckysol-tickets-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Export CSV téléchargé');
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const formatNumbers = (numbers: number[]) => {
    return numbers.length > 0 ? numbers.join(', ') : 'Non spécifiés';
  };

  const getUniquePlayers = () => {
    return [...new Set(tickets.map(ticket => ticket.buyer))];
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-lottery-bg via-background to-lottery-orange-light p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-lottery-orange-dark rounded-xl flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Panneau d'Administration</h1>
              <p className="text-muted-foreground">LuckySol.xyz - Gestion des tickets</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              onClick={generateDemoData}
              variant="secondary"
              size="sm"
            >
              <Ticket className="h-4 w-4 mr-2" />
              Générer Demo
            </Button>
            <Button
              onClick={loadData}
              disabled={loading}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
            <Button
              onClick={exportTickets}
              disabled={filteredTickets.length === 0}
              size="sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Exporter CSV
            </Button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-4"
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
                <Ticket className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalTickets}</div>
                <p className="text-xs text-muted-foreground">
                  Tickets vendus
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenus</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalRevenue.toFixed(4)} SOL</div>
                <p className="text-xs text-muted-foreground">
                  Total collecté
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Joueurs Uniques</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.uniquePlayers}</div>
                <p className="text-xs text-muted-foreground">
                  Adresses uniques
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Dernier Ticket</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.lastTicketTime > 0 ? 
                    new Date(stats.lastTicketTime).toLocaleDateString() : 
                    'Aucun'
                  }
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.lastTicketTime > 0 ? 
                    new Date(stats.lastTicketTime).toLocaleTimeString() : 
                    'Pas de tickets'
                  }
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par hash, adresse ou numéros..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="sm:w-64">
            <select
              value={selectedPlayer}
              onChange={(e) => setSelectedPlayer(e.target.value)}
              className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              <option value="">Tous les joueurs</option>
              {getUniquePlayers().map(player => (
                <option key={player} value={player}>
                  {formatAddress(player)}
                </option>
              ))}
            </select>
          </div>
        </motion.div>

        {/* Tickets Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Tickets ({filteredTickets.length})
              </CardTitle>
              <CardDescription>
                Liste de tous les tickets achetés avec leurs numéros choisis
                <br />
                <span className="text-xs text-muted-foreground">
                  💡 Mode démonstration : Les numéros sont lus depuis le localStorage. 
                  Cliquez sur "Générer Demo" pour voir des exemples.
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                  <span>Chargement des tickets...</span>
                </div>
              ) : filteredTickets.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Aucun ticket trouvé
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredTickets.map((ticket, index) => (
                    <motion.div
                      key={ticket.transactionHash}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-4 border border-lottery-border rounded-lg bg-lottery-card hover:bg-lottery-card/80 transition-colors"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                        <div className="md:col-span-2">
                          <div className="flex items-center gap-2 mb-1">
                            <Hash className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-mono">
                              {formatAddress(ticket.transactionHash)}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatAddress(ticket.buyer)}
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-sm font-medium mb-1">Numéros</div>
                          <div className="flex flex-wrap gap-1">
                            {ticket.numbers.length > 0 ? (
                              ticket.numbers.map(num => (
                                <Badge key={num} variant="secondary" className="text-xs">
                                  {num}
                                </Badge>
                              ))
                            ) : (
                              <Badge variant="outline" className="text-xs">
                                Non spécifiés
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-sm font-medium mb-1">Montant</div>
                          <div className="text-sm text-lottery-orange">
                            {ticket.amount} SOL
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-sm font-medium mb-1">Date</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(ticket.timestamp).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(ticket.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                        
                        <div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              navigator.clipboard.writeText(ticket.transactionHash);
                              toast.success('Hash copié dans le presse-papiers');
                            }}
                          >
                            Copier Hash
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminPanel;

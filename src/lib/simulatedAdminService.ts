import { generateTicketHash } from './ticketValidation';

export interface TicketData {
  transactionHash: string;
  buyer: string;
  numbers: number[];
  timestamp: number;
  amount: number;
  ticketHash: string;
}

export interface AdminStats {
  totalTickets: number;
  totalRevenue: number;
  uniquePlayers: number;
  lastTicketTime: number;
}

class SimulatedAdminService {
  /**
   * Récupère tous les tickets depuis le localStorage (simulation)
   */
  async getAllTickets(): Promise<TicketData[]> {
    try {
      const tickets: TicketData[] = [];
      
      // Récupérer les tickets depuis le localStorage
      const localTickets = JSON.parse(localStorage.getItem('lotteryTickets') || '[]');
      
      for (const localTicket of localTickets) {
        if (localTicket.numbers && localTicket.numbers.length > 0) {
          const ticketData: TicketData = {
            transactionHash: localTicket.txHash || `sim_${localTicket.ticketHash}`,
            buyer: localTicket.buyer,
            numbers: localTicket.numbers,
            timestamp: localTicket.timestamp,
            amount: 0.01, // Prix par ticket
            ticketHash: localTicket.ticketHash
          };
          tickets.push(ticketData);
        }
      }

      // Trier par timestamp décroissant
      return tickets.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error('Erreur lors de la récupération des tickets:', error);
      throw new Error('Impossible de récupérer les tickets');
    }
  }

  /**
   * Récupère les statistiques d'administration
   */
  async getAdminStats(): Promise<AdminStats> {
    const tickets = await this.getAllTickets();
    
    const totalTickets = tickets.length;
    const totalRevenue = tickets.reduce((sum, ticket) => sum + ticket.amount, 0);
    const uniquePlayers = new Set(tickets.map(ticket => ticket.buyer)).size;
    const lastTicketTime = tickets.length > 0 ? Math.max(...tickets.map(ticket => ticket.timestamp)) : 0;

    return {
      totalTickets,
      totalRevenue,
      uniquePlayers,
      lastTicketTime
    };
  }

  /**
   * Récupère les tickets d'un joueur spécifique
   */
  async getPlayerTickets(playerAddress: string): Promise<TicketData[]> {
    const allTickets = await this.getAllTickets();
    return allTickets.filter(ticket => ticket.buyer === playerAddress);
  }

  /**
   * Recherche des tickets par numéros
   */
  async searchTicketsByNumbers(numbers: number[]): Promise<TicketData[]> {
    const allTickets = await this.getAllTickets();
    return allTickets.filter(ticket => 
      numbers.every(num => ticket.numbers.includes(num))
    );
  }

  /**
   * Génère des tickets de démonstration
   */
  generateDemoTickets(): void {
    const demoData = [
      {
        numbers: [7, 14, 21, 28, 35],
        buyer: 'DemoPlayer1...abc123',
        timestamp: Date.now() - 3600000, // 1 heure ago
        amount: 0.01
      },
      {
        numbers: [3, 12, 19, 26, 33],
        buyer: 'DemoPlayer2...def456',
        timestamp: Date.now() - 7200000, // 2 heures ago
        amount: 0.01
      },
      {
        numbers: [1, 8, 15, 22, 29],
        buyer: 'DemoPlayer1...abc123',
        timestamp: Date.now() - 10800000, // 3 heures ago
        amount: 0.01
      }
    ];

    const existingTickets = JSON.parse(localStorage.getItem('lotteryTickets') || '[]');
    
    for (const demo of demoData) {
      const ticketHash = generateTicketHash(demo.numbers, demo.buyer, demo.timestamp);
      const ticketData = {
        numbers: demo.numbers,
        quantity: 1,
        timestamp: demo.timestamp,
        txHash: `demo_${ticketHash}`,
        buyer: demo.buyer,
        ticketHash: ticketHash
      };
      existingTickets.push(ticketData);
    }

    localStorage.setItem('lotteryTickets', JSON.stringify(existingTickets));
  }
}

export const simulatedAdminService = new SimulatedAdminService();


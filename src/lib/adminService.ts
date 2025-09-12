import { Connection, PublicKey, ParsedTransactionWithMeta, ParsedInstruction } from '@solana/web3.js';
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

class AdminService {
  private connection: Connection;
  private poolWallet: PublicKey;

  constructor() {
    this.connection = new Connection(
      import.meta.env.VITE_SOLANA_RPC || 'https://api.mainnet-beta.solana.com',
      'confirmed'
    );
    this.poolWallet = new PublicKey(import.meta.env.VITE_POOL_WALLET || '4egAsAmuctNJVDTzYqXTh9yXcr8LjjnCBSV7hy46xbPf');
  }

  /**
   * Récupère tous les tickets depuis la blockchain
   */
  async getAllTickets(): Promise<TicketData[]> {
    try {
      const tickets: TicketData[] = [];
      
      // Récupérer les transactions du wallet de la pool
      const signatures = await this.connection.getSignaturesForAddress(this.poolWallet, {
        limit: 1000 // Limite pour éviter les timeouts
      });

      for (const sigInfo of signatures) {
        try {
          const transaction = await this.connection.getParsedTransaction(sigInfo.signature, {
            maxSupportedTransactionVersion: 0
          });

          if (transaction && this.isTicketTransaction(transaction)) {
            const ticketData = this.extractTicketData(transaction, sigInfo.signature);
            if (ticketData) {
              tickets.push(ticketData);
            }
          }
        } catch (error) {
          console.warn(`Erreur lors de l'analyse de la transaction ${sigInfo.signature}:`, error);
        }
      }

      // Trier par timestamp décroissant
      return tickets.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error('Erreur lors de la récupération des tickets:', error);
      throw new Error('Impossible de récupérer les tickets depuis la blockchain');
    }
  }

  /**
   * Vérifie si une transaction est un achat de ticket
   */
  private isTicketTransaction(transaction: ParsedTransactionWithMeta): boolean {
    if (!transaction.meta || transaction.meta.err) {
      return false;
    }

    // Vérifier si la transaction contient un transfert vers notre wallet
    const instructions = transaction.transaction.message.instructions as ParsedInstruction[];
    
    return instructions.some(instruction => {
      if (instruction.program === 'system' && instruction.parsed?.type === 'transfer') {
        const transfer = instruction.parsed.info;
        return transfer.destination === this.poolWallet.toString();
      }
      return false;
    });
  }

  /**
   * Extrait les données du ticket depuis une transaction
   */
  private extractTicketData(transaction: ParsedTransactionWithMeta, signature: string): TicketData | null {
    try {
      const instructions = transaction.transaction.message.instructions as ParsedInstruction[];
      const transferInstruction = instructions.find(instruction => 
        instruction.program === 'system' && 
        instruction.parsed?.type === 'transfer' &&
        instruction.parsed.info.destination === this.poolWallet.toString()
      );

      if (!transferInstruction) {
        return null;
      }

      const transfer = transferInstruction.parsed.info;
      const buyer = transfer.source;
      const amount = transferInstruction.parsed.info.lamports / 1e9; // Convertir en SOL

      // Extraire les numéros depuis les logs de la transaction
      const numbers = this.extractNumbersFromLogs(transaction);
      
      if (numbers.length === 0) {
        // Si pas de numéros dans les logs, essayer de les extraire du message
        const numbersFromMessage = this.extractNumbersFromMessage(transaction);
        if (numbersFromMessage.length > 0) {
          numbers.push(...numbersFromMessage);
        }
      }

      const timestamp = transaction.blockTime ? transaction.blockTime * 1000 : Date.now();
      const ticketHash = generateTicketHash(numbers, buyer, timestamp);

      return {
        transactionHash: signature,
        buyer,
        numbers,
        timestamp,
        amount,
        ticketHash
      };
    } catch (error) {
      console.error('Erreur lors de l\'extraction des données du ticket:', error);
      return null;
    }
  }

  /**
   * Extrait les numéros depuis les logs de la transaction
   */
  private extractNumbersFromLogs(transaction: ParsedTransactionWithMeta): number[] {
    const numbers: number[] = [];
    
    if (transaction.meta?.logMessages) {
      for (const log of transaction.meta.logMessages) {
        // Chercher des patterns comme "Numbers: [1,2,3,4,5]"
        const numberMatch = log.match(/Numbers:\s*\[([0-9,\s]+)\]/);
        if (numberMatch) {
          const numberString = numberMatch[1];
          const parsedNumbers = numberString.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
          numbers.push(...parsedNumbers);
        }
        
        // Chercher des patterns comme "Selected: 1,2,3,4,5"
        const selectedMatch = log.match(/Selected:\s*([0-9,\s]+)/);
        if (selectedMatch) {
          const numberString = selectedMatch[1];
          const parsedNumbers = numberString.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
          numbers.push(...parsedNumbers);
        }
      }
    }
    
    return numbers;
  }

  /**
   * Extrait les numéros depuis le message de la transaction
   */
  private extractNumbersFromMessage(transaction: ParsedTransactionWithMeta): number[] {
    const numbers: number[] = [];
    
    // Chercher dans les instructions personnalisées
    const instructions = transaction.transaction.message.instructions as ParsedInstruction[];
    
    for (const instruction of instructions) {
      if (instruction.program === 'system' && instruction.parsed?.type === 'transfer') {
        // Chercher dans les données de la transaction
        const data = instruction.data;
        if (data) {
          // Essayer de décoder les numéros depuis les données
          const decodedNumbers = this.decodeNumbersFromData(data);
          if (decodedNumbers.length > 0) {
            numbers.push(...decodedNumbers);
          }
        }
      }
    }
    
    return numbers;
  }

  /**
   * Décode les numéros depuis les données binaires
   */
  private decodeNumbersFromData(data: string): number[] {
    try {
      // Cette méthode dépend de la façon dont les numéros sont encodés
      // Pour l'instant, on retourne un tableau vide
      // Dans une vraie implémentation, il faudrait connaître le format exact
      return [];
    } catch (error) {
      return [];
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
}

export const adminService = new AdminService();


import { Program, AnchorProvider, web3, BN } from '@coral-xyz/anchor';
import { PublicKey, Connection, Keypair } from '@solana/web3.js';
import { IDL } from './lottery_program';

// ID du programme (à remplacer par l'ID réel après déploiement)
export const LOTTERY_PROGRAM_ID = new PublicKey("11111111111111111111111111111111");

// Interface pour les numéros de ticket
export interface TicketNumbers {
  numbers: number[];
  quantity: number;
}

// Interface pour les données de la loterie
export interface RaffleData {
  authority: PublicKey;
  targetSol: number;
  ticketPrice: number;
  totalTicketsSold: number;
  totalSolCollected: number;
  status: 'Active' | 'PoolComplete' | 'DrawComplete' | 'Cancelled';
  createdAt: number;
  winningNumbers: number[];
  winner: PublicKey;
  isDrawComplete: boolean;
}

// Interface pour les données d'entrée de ticket
export interface TicketEntryData {
  raffle: PublicKey;
  buyer: PublicKey;
  numbers: number[];
  quantity: number;
  timestamp: number;
  ticketHash: string;
}

export class LotteryProgram {
  private program: Program;
  private connection: Connection;
  private provider: AnchorProvider;

  constructor(connection: Connection, wallet: any) {
    this.connection = connection;
    this.provider = new AnchorProvider(connection, wallet, {});
    this.program = new Program(IDL, LOTTERY_PROGRAM_ID, this.provider);
  }

  // Obtenir la PDA de la loterie
  async getRafflePDA(): Promise<[PublicKey, number]> {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("raffle")],
      this.program.programId
    );
  }

  // Obtenir la PDA d'une entrée de ticket
  async getTicketEntryPDA(raffle: PublicKey, buyer: PublicKey): Promise<[PublicKey, number]> {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("entry"), raffle.toBuffer(), buyer.toBuffer()],
      this.program.programId
    );
  }

  // Initialiser une nouvelle loterie
  async initializeRaffle(
    targetSol: number,
    ticketPrice: number
  ): Promise<string> {
    const [rafflePDA] = await this.getRafflePDA();
    
    const tx = await this.program.methods
      .initializeRaffle(
        new BN(targetSol * web3.LAMPORTS_PER_SOL),
        new BN(ticketPrice * web3.LAMPORTS_PER_SOL)
      )
      .accounts({
        raffle: rafflePDA,
        authority: this.provider.wallet.publicKey,
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc();

    return tx;
  }

  // Acheter des tickets avec numéros spécifiques
  async buyTickets(
    numbers: number[],
    quantity: number
  ): Promise<string> {
    if (numbers.length !== 5) {
      throw new Error("Vous devez sélectionner exactement 5 numéros");
    }

    // Valider les numéros
    for (const num of numbers) {
      if (num < 1 || num > 49) {
        throw new Error(`Numéro invalide: ${num}. Doit être entre 1 et 49`);
      }
    }

    // Vérifier les doublons
    const uniqueNumbers = new Set(numbers);
    if (uniqueNumbers.size !== 5) {
      throw new Error("Les numéros ne peuvent pas être en double");
    }

    const [rafflePDA] = await this.getRafflePDA();
    const [entryPDA] = await this.getTicketEntryPDA(rafflePDA, this.provider.wallet.publicKey);

    // Convertir les numéros en array de 5 éléments
    const numbersArray = new Array(5).fill(0);
    numbers.forEach((num, index) => {
      numbersArray[index] = num;
    });

    const tx = await this.program.methods
      .buyTickets(numbersArray, quantity)
      .accounts({
        raffle: rafflePDA,
        entry: entryPDA,
        buyer: this.provider.wallet.publicKey,
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc();

    return tx;
  }

  // Effectuer le tirage (seulement l'autorité)
  async conductDraw(): Promise<string> {
    const [rafflePDA] = await this.getRafflePDA();

    const tx = await this.program.methods
      .conductDraw()
      .accounts({
        raffle: rafflePDA,
        authority: this.provider.wallet.publicKey,
      })
      .rpc();

    return tx;
  }

  // Déclarer un gagnant (seulement l'autorité)
  async setWinner(winner: PublicKey): Promise<string> {
    const [rafflePDA] = await this.getRafflePDA();

    const tx = await this.program.methods
      .setWinner(winner)
      .accounts({
        raffle: rafflePDA,
        authority: this.provider.wallet.publicKey,
      })
      .rpc();

    return tx;
  }

  // Obtenir les données de la loterie
  async getRaffleData(): Promise<RaffleData | null> {
    try {
      const [rafflePDA] = await this.getRafflePDA();
      const raffleAccount = await this.program.account.raffle.fetch(rafflePDA);
      
      return {
        authority: raffleAccount.authority,
        targetSol: raffleAccount.targetSol.toNumber() / web3.LAMPORTS_PER_SOL,
        ticketPrice: raffleAccount.ticketPrice.toNumber() / web3.LAMPORTS_PER_SOL,
        totalTicketsSold: raffleAccount.totalTicketsSold.toNumber(),
        totalSolCollected: raffleAccount.totalSolCollected.toNumber() / web3.LAMPORTS_PER_SOL,
        status: this.mapRaffleStatus(raffleAccount.status),
        createdAt: raffleAccount.createdAt.toNumber(),
        winningNumbers: Array.from(raffleAccount.winningNumbers),
        winner: raffleAccount.winner,
        isDrawComplete: raffleAccount.isDrawComplete,
      };
    } catch (error) {
      console.error("Erreur lors de la récupération des données de la loterie:", error);
      return null;
    }
  }

  // Obtenir les données d'une entrée de ticket
  async getTicketEntryData(buyer: PublicKey): Promise<TicketEntryData | null> {
    try {
      const [rafflePDA] = await this.getRafflePDA();
      const [entryPDA] = await this.getTicketEntryPDA(rafflePDA, buyer);
      
      const entryAccount = await this.program.account.ticketEntry.fetch(entryPDA);
      
      return {
        raffle: entryAccount.raffle,
        buyer: entryAccount.buyer,
        numbers: Array.from(entryAccount.numbers),
        quantity: entryAccount.quantity,
        timestamp: entryAccount.timestamp.toNumber(),
        ticketHash: Buffer.from(entryAccount.ticketHash).toString('hex'),
      };
    } catch (error) {
      console.error("Erreur lors de la récupération des données du ticket:", error);
      return null;
    }
  }

  // Obtenir tous les tickets d'un utilisateur
  async getUserTickets(userPublicKey: PublicKey): Promise<TicketEntryData[]> {
    try {
      const [rafflePDA] = await this.getRafflePDA();
      const [entryPDA] = await this.getTicketEntryPDA(rafflePDA, userPublicKey);
      
      const entryAccount = await this.program.account.ticketEntry.fetch(entryPDA);
      
      return [{
        raffle: entryAccount.raffle,
        buyer: entryAccount.buyer,
        numbers: Array.from(entryAccount.numbers),
        quantity: entryAccount.quantity,
        timestamp: entryAccount.timestamp.toNumber(),
        ticketHash: Buffer.from(entryAccount.ticketHash).toString('hex'),
      }];
    } catch (error) {
      console.error("Erreur lors de la récupération des tickets de l'utilisateur:", error);
      return [];
    }
  }

  // Mapper le statut de la loterie
  private mapRaffleStatus(status: any): 'Active' | 'PoolComplete' | 'DrawComplete' | 'Cancelled' {
    if (status && typeof status === 'object') {
      if ('active' in status) return 'Active';
      if ('poolComplete' in status) return 'PoolComplete';
      if ('drawComplete' in status) return 'DrawComplete';
      if ('cancelled' in status) return 'Cancelled';
    }
    return 'Active';
  }

  // Vérifier si un utilisateur a gagné
  async checkWinningTicket(userPublicKey: PublicKey): Promise<boolean> {
    try {
      const raffleData = await this.getRaffleData();
      const ticketData = await this.getTicketEntryData(userPublicKey);
      
      if (!raffleData || !ticketData || !raffleData.isDrawComplete) {
        return false;
      }

      // Comparer les numéros
      const userNumbers = ticketData.numbers.sort();
      const winningNumbers = raffleData.winningNumbers.sort();
      
      return JSON.stringify(userNumbers) === JSON.stringify(winningNumbers);
    } catch (error) {
      console.error("Erreur lors de la vérification du ticket gagnant:", error);
      return false;
    }
  }
}

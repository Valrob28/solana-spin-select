import { Connection, PublicKey } from '@solana/web3.js';

export interface DrawResult {
  winningNumbers: number[];
  drawDate: number;
  drawHash: string;
  winners: Winner[];
  totalTickets: number;
  totalPrizePool: number;
}

export interface Winner {
  ticketHash: string;
  buyer: string;
  numbers: number[];
  matches: number;
  prize: string;
  prizeValue: string;
}

export interface TicketData {
  numbers: number[];
  quantity: number;
  timestamp: number;
  txHash: string;
  buyer: string;
  ticketHash: string;
}

/**
 * Génère des numéros gagnants de manière déterministe
 * Utilise le hash du block Solana comme seed pour la transparence
 */
export const generateWinningNumbers = async (
  connection: Connection,
  blockHash: string
): Promise<number[]> => {
  // Utiliser le hash du block comme seed
  const seed = blockHash.slice(0, 16); // Prendre les 16 premiers caractères
  const seedNumber = parseInt(seed, 16);
  
  const numbers: number[] = [];
  let currentSeed = seedNumber;
  
  while (numbers.length < 5) {
    // Générer un nombre pseudo-aléatoire
    currentSeed = (currentSeed * 9301 + 49297) % 233280;
    const randomNumber = Math.floor((currentSeed / 233280) * 49) + 1;
    
    if (!numbers.includes(randomNumber)) {
      numbers.push(randomNumber);
    }
  }
  
  return numbers.sort((a, b) => a - b);
};

/**
 * Vérifie combien de numéros correspondent
 */
export const checkMatches = (ticketNumbers: number[], winningNumbers: number[]): number => {
  return ticketNumbers.filter(num => winningNumbers.includes(num)).length;
};

/**
 * Détermine le prix selon le nombre de correspondances
 */
export const getPrizeForMatches = (matches: number): { prize: string; value: string } => {
  switch (matches) {
    case 5:
      return { prize: "Jackpot - Ferrari 488", value: "$250,000" };
    case 4:
      return { prize: "Second Prize - Mercedes AMG", value: "$150,000" };
    case 3:
      return { prize: "Third Prize - Cash Prize", value: "$50,000" };
    case 2:
      return { prize: "Fourth Prize - Dream Vacation", value: "$25,000" };
    case 1:
      return { prize: "Fifth Prize - Rolex Submariner", value: "$15,000" };
    default:
      return { prize: "No Prize", value: "$0" };
  }
};

/**
 * Effectue le tirage au sort
 */
export const conductDraw = async (
  connection: Connection,
  blockHash: string
): Promise<DrawResult> => {
  // 1. Récupérer tous les tickets
  const allTickets = JSON.parse(localStorage.getItem('lotteryTickets') || '[]') as TicketData[];
  
  // 2. Générer les numéros gagnants
  const winningNumbers = await generateWinningNumbers(connection, blockHash);
  
  // 3. Vérifier les gagnants
  const winners: Winner[] = [];
  
  for (const ticket of allTickets) {
    const matches = checkMatches(ticket.numbers, winningNumbers);
    
    if (matches > 0) {
      const prizeInfo = getPrizeForMatches(matches);
      
      winners.push({
        ticketHash: ticket.ticketHash,
        buyer: ticket.buyer,
        numbers: ticket.numbers,
        matches,
        prize: prizeInfo.prize,
        prizeValue: prizeInfo.value
      });
    }
  }
  
  // 4. Calculer le pool de prix total
  const totalTickets = allTickets.reduce((sum, ticket) => sum + ticket.quantity, 0);
  const totalPrizePool = totalTickets * 0.01; // 0.01 SOL par ticket
  
  // 5. Créer le hash du tirage
  const drawHash = generateDrawHash(winningNumbers, blockHash, Date.now());
  
  return {
    winningNumbers,
    drawDate: Date.now(),
    drawHash,
    winners,
    totalTickets,
    totalPrizePool
  };
};

/**
 * Génère un hash unique pour le tirage
 */
export const generateDrawHash = (winningNumbers: number[], blockHash: string, timestamp: number): string => {
  const data = `${winningNumbers.join(',')}-${blockHash}-${timestamp}`;
  
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  return Math.abs(hash).toString(16);
};

/**
 * Vérifie si un ticket a gagné
 */
export const checkTicketWin = (ticket: TicketData, winningNumbers: number[]): Winner | null => {
  const matches = checkMatches(ticket.numbers, winningNumbers);
  
  if (matches > 0) {
    const prizeInfo = getPrizeForMatches(matches);
    
    return {
      ticketHash: ticket.ticketHash,
      buyer: ticket.buyer,
      numbers: ticket.numbers,
      matches,
      prize: prizeInfo.prize,
      prizeValue: prizeInfo.value
    };
  }
  
  return null;
};

/**
 * Récupère le dernier tirage
 */
export const getLastDraw = (): DrawResult | null => {
  const lastDraw = localStorage.getItem('lastDraw');
  return lastDraw ? JSON.parse(lastDraw) : null;
};

/**
 * Sauvegarde le résultat du tirage
 */
export const saveDrawResult = (drawResult: DrawResult): void => {
  localStorage.setItem('lastDraw', JSON.stringify(drawResult));
  
  // Ajouter à l'historique
  const history = JSON.parse(localStorage.getItem('drawHistory') || '[]');
  history.push(drawResult);
  localStorage.setItem('drawHistory', JSON.stringify(history));
};


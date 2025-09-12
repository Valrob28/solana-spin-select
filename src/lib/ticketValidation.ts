import { Connection, PublicKey } from '@solana/web3.js';

export interface TicketData {
  numbers: number[];
  quantity: number;
  timestamp: number;
  txHash: string;
  buyer: string;
}

export interface ValidationResult {
  isValid: boolean;
  reason?: string;
  duplicateNumbers?: number[];
}

/**
 * Vérifie si les numéros sélectionnés sont valides
 */
export const validateTicketNumbers = (numbers: number[]): ValidationResult => {
  // Vérifier la longueur
  if (numbers.length !== 5) {
    return { isValid: false, reason: 'Must select exactly 5 numbers' };
  }

  // Vérifier la plage (1-49)
  const invalidNumbers = numbers.filter(n => n < 1 || n > 49);
  if (invalidNumbers.length > 0) {
    return { isValid: false, reason: `Invalid numbers: ${invalidNumbers.join(', ')}` };
  }

  // Vérifier les doublons
  const uniqueNumbers = [...new Set(numbers)];
  if (uniqueNumbers.length !== numbers.length) {
    const duplicates = numbers.filter((n, i) => numbers.indexOf(n) !== i);
    return { 
      isValid: false, 
      reason: 'Duplicate numbers found',
      duplicateNumbers: [...new Set(duplicates)]
    };
  }

  return { isValid: true };
};

/**
 * Vérifie si une combinaison de numéros a déjà été utilisée
 * (à implémenter avec le smart contract)
 */
export const checkDuplicateNumbers = async (
  connection: Connection,
  numbers: number[],
  raffleId: number
): Promise<ValidationResult> => {
  try {
    // TODO: Implémenter avec le smart contract
    // Pour l'instant, on vérifie dans localStorage
    const existingTickets = JSON.parse(localStorage.getItem('lotteryTickets') || '[]');
    
    const sortedNumbers = [...numbers].sort((a, b) => a - b);
    
    for (const ticket of existingTickets) {
      const ticketNumbers = [...ticket.numbers].sort((a, b) => a - b);
      if (JSON.stringify(ticketNumbers) === JSON.stringify(sortedNumbers)) {
        return { 
          isValid: false, 
          reason: 'This combination has already been used',
          duplicateNumbers: numbers
        };
      }
    }

    return { isValid: true };
  } catch (error) {
    return { isValid: false, reason: 'Error checking duplicates' };
  }
};

/**
 * Génère un hash unique pour une combinaison de numéros
 */
export const generateTicketHash = (numbers: number[], buyer: string, timestamp: number): string => {
  const sortedNumbers = [...numbers].sort((a, b) => a - b);
  const data = `${sortedNumbers.join(',')}-${buyer}-${timestamp}`;
  
  // Simple hash (en production, utiliser crypto.subtle.digest)
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return Math.abs(hash).toString(16);
};

/**
 * Vérifie l'intégrité d'un ticket
 */
export const verifyTicketIntegrity = (ticket: TicketData): boolean => {
  const expectedHash = generateTicketHash(ticket.numbers, ticket.buyer, ticket.timestamp);
  const actualHash = ticket.txHash;
  
  // Pour l'instant, on vérifie juste que le hash existe
  return actualHash && actualHash !== 'pending';
};


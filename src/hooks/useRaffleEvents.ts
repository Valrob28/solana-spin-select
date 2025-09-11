import { useEffect, useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { RAFFLE_PROGRAM_ID } from '@/lib/anchor';

export interface RaffleEvent {
  signature: string;
  slot: number;
  timestamp: number;
  type: 'TicketsPurchased' | 'RaffleClosed' | 'WinnerSet';
  data: any;
}

export const useRaffleEvents = (raffleId?: number) => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [events, setEvents] = useState<RaffleEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!connection || !publicKey) return;

    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        // Écouter les logs du programme Anchor
        const programId = RAFFLE_PROGRAM_ID;
        
        // Récupérer les transactions récentes du programme
        const signatures = await connection.getSignaturesForAddress(programId, {
          limit: 50,
        });

        const eventPromises = signatures.map(async (sig) => {
          try {
            const tx = await connection.getTransaction(sig.signature, {
              commitment: 'confirmed',
              maxSupportedTransactionVersion: 0,
            });

            if (!tx) return null;

            // Parser les logs pour extraire les événements
            const logs = tx.meta?.logMessages || [];
            const raffleEvents: RaffleEvent[] = [];

            logs.forEach((log, index) => {
              if (log.includes('Program log: TicketsPurchased')) {
                raffleEvents.push({
                  signature: sig.signature,
                  slot: sig.slot,
                  timestamp: sig.blockTime ? sig.blockTime * 1000 : Date.now(),
                  type: 'TicketsPurchased',
                  data: { log, index },
                });
              } else if (log.includes('Program log: RaffleClosed')) {
                raffleEvents.push({
                  signature: sig.signature,
                  slot: sig.slot,
                  timestamp: sig.blockTime ? sig.blockTime * 1000 : Date.now(),
                  type: 'RaffleClosed',
                  data: { log, index },
                });
              } else if (log.includes('Program log: WinnerSet')) {
                raffleEvents.push({
                  signature: sig.signature,
                  slot: sig.slot,
                  timestamp: sig.blockTime ? sig.blockTime * 1000 : Date.now(),
                  type: 'WinnerSet',
                  data: { log, index },
                });
              }
            });

            return raffleEvents;
          } catch (error) {
            console.error('Error parsing transaction:', error);
            return null;
          }
        });

        const allEvents = (await Promise.all(eventPromises))
          .flat()
          .filter(Boolean) as RaffleEvent[];

        // Trier par timestamp décroissant
        allEvents.sort((a, b) => b.timestamp - a.timestamp);
        
        setEvents(allEvents);
      } catch (error) {
        console.error('Error fetching raffle events:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();

    // Polling toutes les 10 secondes
    const interval = setInterval(fetchEvents, 10000);

    return () => clearInterval(interval);
  }, [connection, publicKey, raffleId]);

  return { events, isLoading };
};

// Hook pour écouter les événements en temps réel
export const useRaffleEventSubscription = (raffleId?: number) => {
  const { connection } = useConnection();
  const [latestEvent, setLatestEvent] = useState<RaffleEvent | null>(null);

  useEffect(() => {
    if (!connection) return;

    const programId = RAFFLE_PROGRAM_ID;
    
    // S'abonner aux logs du programme
    const subscriptionId = connection.onLogs(
      programId,
      (logs, context) => {
        // Parser les logs pour détecter les nouveaux événements
        logs.logs.forEach((log, index) => {
          if (log.includes('Program log: TicketsPurchased')) {
            setLatestEvent({
              signature: logs.signature,
              slot: context.slot,
              timestamp: Date.now(),
              type: 'TicketsPurchased',
              data: { log, index },
            });
          } else if (log.includes('Program log: RaffleClosed')) {
            setLatestEvent({
              signature: logs.signature,
              slot: context.slot,
              timestamp: Date.now(),
              type: 'RaffleClosed',
              data: { log, index },
            });
          } else if (log.includes('Program log: WinnerSet')) {
            setLatestEvent({
              signature: logs.signature,
              slot: context.slot,
              timestamp: Date.now(),
              type: 'WinnerSet',
              data: { log, index },
            });
          }
        });
      },
      'confirmed'
    );

    return () => {
      connection.removeOnLogsListener(subscriptionId);
    };
  }, [connection, raffleId]);

  return { latestEvent };
};

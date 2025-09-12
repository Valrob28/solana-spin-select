import { AnchorProvider, Program, web3, BN } from '@coral-xyz/anchor';
import { Connection, PublicKey } from '@solana/web3.js';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';

// Types générés depuis le programme Anchor
export interface Raffle {
  creator: PublicKey;
  treasury: PublicKey;
  raffleId: number;
  ticketPrice: number;
  totalTickets: number;
  status: Status;
  winners: PublicKey[];
}

export enum Status {
  Open = 0,
  Closed = 1,
}

export interface Entry {
  raffle: PublicKey;
  wallet: PublicKey;
  count: number;
}

// Program ID - à remplacer par le vrai ID après déploiement
// Temporairement désactivé jusqu'au déploiement du smart contract
export const RAFFLE_PROGRAM_ID = new PublicKey("11111111111111111111111111111111");

// Seeds pour les PDAs
export const getRafflePDA = (admin: PublicKey, raffleId: number) => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("raffle"), admin.toBuffer(), Buffer.from(raffleId.toString())],
    RAFFLE_PROGRAM_ID
  );
};

export const getEntryPDA = (raffle: PublicKey, buyer: PublicKey) => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("entry"), raffle.toBuffer(), buyer.toBuffer()],
    RAFFLE_PROGRAM_ID
  );
};

// Hook pour utiliser le programme Anchor
export const useRaffleProgram = () => {
  const { connection } = useConnection();
  const wallet = useWallet();

  const getProgram = async () => {
    if (!wallet.publicKey) throw new Error("Wallet not connected");
    
    const provider = new AnchorProvider(
      connection,
      wallet as any,
      { commitment: 'confirmed' }
    );

    // IDL du programme - à remplacer par le vrai IDL
    const idl = {
      "version": "0.1.0",
      "name": "raffle_simple",
      "instructions": [
        {
          "name": "initializeRaffle",
          "accounts": [
            { "name": "admin", "isMut": true, "isSigner": true },
            { "name": "treasury", "isMut": false, "isSigner": false },
            { "name": "raffle", "isMut": true, "isSigner": false },
            { "name": "systemProgram", "isMut": false, "isSigner": false }
          ],
          "args": [
            { "name": "ticketPrice", "type": "u64" },
            { "name": "raffleId", "type": "u64" }
          ]
        },
        {
          "name": "buyTickets",
          "accounts": [
            { "name": "buyer", "isMut": true, "isSigner": true },
            { "name": "raffle", "isMut": true, "isSigner": false },
            { "name": "treasury", "isMut": false, "isSigner": false },
            { "name": "entry", "isMut": true, "isSigner": false },
            { "name": "systemProgram", "isMut": false, "isSigner": false }
          ],
          "args": [
            { "name": "amount", "type": "u64" }
          ]
        },
        {
          "name": "setWinner",
          "accounts": [
            { "name": "admin", "isMut": false, "isSigner": true },
            { "name": "raffle", "isMut": true, "isSigner": false }
          ],
          "args": [
            { "name": "winners", "type": { "vec": "publicKey" } }
          ]
        }
      ],
      "accounts": [
        {
          "name": "Raffle",
          "type": {
            "kind": "struct",
            "fields": [
              { "name": "creator", "type": "publicKey" },
              { "name": "treasury", "type": "publicKey" },
              { "name": "raffleId", "type": "u64" },
              { "name": "ticketPrice", "type": "u64" },
              { "name": "totalTickets", "type": "u64" },
              { "name": "status", "type": { "defined": "Status" } },
              { "name": "winners", "type": { "vec": "publicKey" } }
            ]
          }
        },
        {
          "name": "Entry",
          "type": {
            "kind": "struct",
            "fields": [
              { "name": "raffle", "type": "publicKey" },
              { "name": "wallet", "type": "publicKey" },
              { "name": "count", "type": "u64" }
            ]
          }
        }
      ],
      "types": [
        {
          "name": "Status",
          "type": {
            "kind": "enum",
            "variants": [
              { "name": "Open" },
              { "name": "Closed" }
            ]
          }
        }
      ],
      "errors": [
        { "code": 6000, "name": "NotOpen", "msg": "Raffle not open" },
        { "code": 6001, "name": "Overflow", "msg": "Overflow" },
        { "code": 6002, "name": "Unauthorized", "msg": "Unauthorized" },
        { "code": 6003, "name": "InvalidAmount", "msg": "Invalid amount" },
        { "code": 6004, "name": "BadState", "msg": "Bad state" }
      ]
    };

    return new Program(idl as any, RAFFLE_PROGRAM_ID, provider);
  };

  return { getProgram };
};

// Fonctions utilitaires
export const buyTickets = async (
  program: Program,
  raffle: PublicKey,
  treasury: PublicKey,
  amount: number
) => {
  const buyer = program.provider.publicKey!;
  const [entryPDA] = getEntryPDA(raffle, buyer);

  const tx = await program.methods
    .buyTickets(new BN(amount))
    .accounts({
      buyer,
      raffle,
      treasury,
      entry: entryPDA,
      systemProgram: web3.SystemProgram.programId,
    })
    .rpc();

  return tx;
};

export const setWinner = async (
  program: Program,
  raffle: PublicKey,
  winners: PublicKey[]
) => {
  const tx = await program.methods
    .setWinner(winners)
    .accounts({
      admin: program.provider.publicKey!,
      raffle,
    })
    .rpc();

  return tx;
};

export const getRaffleData = async (
  program: Program,
  raffle: PublicKey
): Promise<Raffle | null> => {
  try {
    const raffleAccount = await program.account.raffle.fetch(raffle);
    return raffleAccount as Raffle;
  } catch (error) {
    console.error("Error fetching raffle data:", error);
    return null;
  }
};

export const getEntryData = async (
  program: Program,
  entry: PublicKey
): Promise<Entry | null> => {
  try {
    const entryAccount = await program.account.entry.fetch(entry);
    return entryAccount as Entry;
  } catch (error) {
    console.error("Error fetching entry data:", error);
    return null;
  }
};

export const IDL = {
  "version": "0.1.0",
  "name": "lottery_program",
  "instructions": [
    {
      "name": "initializeRaffle",
      "accounts": [
        {
          "name": "raffle",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "targetSol",
          "type": "u64"
        },
        {
          "name": "ticketPrice",
          "type": "u64"
        }
      ]
    },
    {
      "name": "buyTickets",
      "accounts": [
        {
          "name": "raffle",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "entry",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "buyer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "numbers",
          "type": {
            "array": ["u8", 5]
          }
        },
        {
          "name": "quantity",
          "type": "u8"
        }
      ]
    },
    {
      "name": "conductDraw",
      "accounts": [
        {
          "name": "raffle",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": []
    },
    {
      "name": "setWinner",
      "accounts": [
        {
          "name": "raffle",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "winner",
          "type": "publicKey"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "Raffle",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "targetSol",
            "type": "u64"
          },
          {
            "name": "ticketPrice",
            "type": "u64"
          },
          {
            "name": "totalTicketsSold",
            "type": "u64"
          },
          {
            "name": "totalSolCollected",
            "type": "u64"
          },
          {
            "name": "status",
            "type": {
              "defined": "RaffleStatus"
            }
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "winningNumbers",
            "type": {
              "array": ["u8", 5]
            }
          },
          {
            "name": "winner",
            "type": "publicKey"
          },
          {
            "name": "isDrawComplete",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "TicketEntry",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "raffle",
            "type": "publicKey"
          },
          {
            "name": "buyer",
            "type": "publicKey"
          },
          {
            "name": "numbers",
            "type": {
              "array": ["u8", 5]
            }
          },
          {
            "name": "quantity",
            "type": "u8"
          },
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "ticketHash",
            "type": {
              "array": ["u8", 32]
            }
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "RaffleStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Active"
          },
          {
            "name": "PoolComplete"
          },
          {
            "name": "DrawComplete"
          },
          {
            "name": "Cancelled"
          }
        ]
      }
    }
  ],
  "events": [
    {
      "name": "RaffleInitialized",
      "fields": [
        {
          "name": "raffle",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "authority",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "targetSol",
          "type": "u64",
          "index": false
        },
        {
          "name": "ticketPrice",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "TicketsPurchased",
      "fields": [
        {
          "name": "raffle",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "buyer",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "numbers",
          "type": {
            "array": ["u8", 5]
          },
          "index": false
        },
        {
          "name": "quantity",
          "type": "u8",
          "index": false
        },
        {
          "name": "totalCost",
          "type": "u64",
          "index": false
        },
        {
          "name": "ticketHash",
          "type": {
            "array": ["u8", 32]
          },
          "index": false
        }
      ]
    },
    {
      "name": "DrawConducted",
      "fields": [
        {
          "name": "raffle",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "winningNumbers",
          "type": {
            "array": ["u8", 5]
          },
          "index": false
        },
        {
          "name": "totalTickets",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "WinnerSet",
      "fields": [
        {
          "name": "raffle",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "winner",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "winningNumbers",
          "type": {
            "array": ["u8", 5]
          },
          "index": false
        }
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "RaffleNotActive",
      "msg": "La loterie n'est pas active"
    },
    {
      "code": 6001,
      "name": "PoolComplete",
      "msg": "Le pool est complet"
    },
    {
      "code": 6002,
      "name": "InsufficientFunds",
      "msg": "Fonds insuffisants"
    },
    {
      "code": 6003,
      "name": "InvalidNumber",
      "msg": "Numéro invalide (doit être entre 1 et 49)"
    },
    {
      "code": 6004,
      "name": "DuplicateNumbers",
      "msg": "Numéros en double détectés"
    },
    {
      "code": 6005,
      "name": "Unauthorized",
      "msg": "Non autorisé"
    },
    {
      "code": 6006,
      "name": "PoolNotComplete",
      "msg": "Le pool n'est pas complet"
    },
    {
      "code": 6007,
      "name": "DrawAlreadyComplete",
      "msg": "Le tirage a déjà été effectué"
    },
    {
      "code": 6008,
      "name": "DrawNotComplete",
      "msg": "Le tirage n'est pas terminé"
    },
    {
      "code": 6009,
      "name": "RandomGenerationFailed",
      "msg": "Échec de la génération aléatoire"
    }
  ]
};


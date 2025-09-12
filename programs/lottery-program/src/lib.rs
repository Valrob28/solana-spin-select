use anchor_lang::prelude::*;

declare_id!("Lottery1111111111111111111111111111111111111");

#[program]
pub mod lottery_program {
    use super::*;

    // Initialiser une nouvelle loterie
    pub fn initialize_raffle(
        ctx: Context<InitializeRaffle>,
        target_sol: u64,
        ticket_price: u64,
    ) -> Result<()> {
        let raffle = &mut ctx.accounts.raffle;
        raffle.authority = ctx.accounts.authority.key();
        raffle.target_sol = target_sol;
        raffle.ticket_price = ticket_price;
        raffle.total_tickets_sold = 0;
        raffle.total_sol_collected = 0;
        raffle.status = RaffleStatus::Active;
        raffle.created_at = Clock::get()?.unix_timestamp;
        raffle.winning_numbers = [0; 5];
        raffle.winner = Pubkey::default();
        raffle.is_draw_complete = false;
        
        emit!(RaffleInitialized {
            raffle: raffle.key(),
            authority: raffle.authority,
            target_sol,
            ticket_price,
        });

        Ok(())
    }

    // Acheter des tickets avec numéros spécifiques
    pub fn buy_tickets(
        ctx: Context<BuyTickets>,
        numbers: [u8; 5], // Les 5 numéros choisis
        quantity: u8, // Nombre de tickets (1 ou 5)
    ) -> Result<()> {
        let raffle = &mut ctx.accounts.raffle;
        let entry = &mut ctx.accounts.entry;
        
        // Vérifier que la loterie est active
        require!(raffle.status == RaffleStatus::Active, LotteryError::RaffleNotActive);
        
        // Vérifier que le pool n'est pas complet
        require!(
            raffle.total_sol_collected < raffle.target_sol,
            LotteryError::PoolComplete
        );

        // Calculer le coût total
        let total_cost = raffle.ticket_price * quantity as u64;
        
        // Vérifier que l'utilisateur a assez de SOL
        require!(
            ctx.accounts.buyer.lamports() >= total_cost,
            LotteryError::InsufficientFunds
        );

        // Valider les numéros (1-49, pas de doublons)
        for i in 0..5 {
            require!(numbers[i] >= 1 && numbers[i] <= 49, LotteryError::InvalidNumber);
            for j in (i + 1)..5 {
                require!(numbers[i] != numbers[j], LotteryError::DuplicateNumbers);
            }
        }

        // Enregistrer l'entrée
        entry.raffle = raffle.key();
        entry.buyer = ctx.accounts.buyer.key();
        entry.numbers = numbers;
        entry.quantity = quantity;
        entry.timestamp = Clock::get()?.unix_timestamp;
        entry.ticket_hash = generate_ticket_hash(&numbers, &ctx.accounts.buyer.key(), entry.timestamp);

        // Mettre à jour les statistiques de la loterie
        raffle.total_tickets_sold += quantity as u64;
        raffle.total_sol_collected += total_cost;

        // Vérifier si le pool est maintenant complet
        if raffle.total_sol_collected >= raffle.target_sol {
            raffle.status = RaffleStatus::PoolComplete;
        }

        // Transfert des fonds
        let transfer_instruction = anchor_lang::system_program::Transfer {
            from: ctx.accounts.buyer.to_account_info(),
            to: ctx.accounts.raffle.to_account_info(),
        };
        anchor_lang::system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                transfer_instruction,
            ),
            total_cost,
        )?;

        emit!(TicketsPurchased {
            raffle: raffle.key(),
            buyer: ctx.accounts.buyer.key(),
            numbers,
            quantity,
            total_cost,
            ticket_hash: entry.ticket_hash,
        });

        Ok(())
    }

    // Effectuer le tirage (seulement l'autorité)
    pub fn conduct_draw(ctx: Context<ConductDraw>) -> Result<()> {
        let raffle = &mut ctx.accounts.raffle;
        
        // Vérifier que l'autorité appelle cette fonction
        require_keys_eq!(ctx.accounts.authority.key(), raffle.authority, LotteryError::Unauthorized);
        
        // Vérifier que le pool est complet
        require!(
            raffle.status == RaffleStatus::PoolComplete,
            LotteryError::PoolNotComplete
        );

        // Vérifier que le tirage n'a pas déjà été effectué
        require!(!raffle.is_draw_complete, LotteryError::DrawAlreadyComplete);

        // Générer les numéros gagnants (aléatoires basés sur le slot)
        let clock = Clock::get()?;
        let mut winning_numbers = [0u8; 5];
        let mut used_numbers = [false; 50]; // 1-49
        
        for i in 0..5 {
            let mut attempts = 0;
            loop {
                let random_value = (clock.slot + i as u64 + attempts) % 49 + 1;
                let number = random_value as u8;
                
                if !used_numbers[number as usize] {
                    winning_numbers[i] = number;
                    used_numbers[number as usize] = true;
                    break;
                }
                attempts += 1;
                require!(attempts < 100, LotteryError::RandomGenerationFailed);
            }
        }

        // Trier les numéros gagnants
        winning_numbers.sort();

        raffle.winning_numbers = winning_numbers;
        raffle.is_draw_complete = true;
        raffle.status = RaffleStatus::DrawComplete;

        emit!(DrawConducted {
            raffle: raffle.key(),
            winning_numbers,
            total_tickets: raffle.total_tickets_sold,
        });

        Ok(())
    }

    // Déclarer un gagnant (seulement l'autorité)
    pub fn set_winner(ctx: Context<SetWinner>, winner: Pubkey) -> Result<()> {
        let raffle = &mut ctx.accounts.raffle;
        
        // Vérifier que l'autorité appelle cette fonction
        require_keys_eq!(ctx.accounts.authority.key(), raffle.authority, LotteryError::Unauthorized);
        
        // Vérifier que le tirage est terminé
        require!(raffle.is_draw_complete, LotteryError::DrawNotComplete);

        raffle.winner = winner;

        emit!(WinnerSet {
            raffle: raffle.key(),
            winner,
            winning_numbers: raffle.winning_numbers,
        });

        Ok(())
    }
}

// Générer un hash unique pour le ticket
fn generate_ticket_hash(numbers: &[u8; 5], buyer: &Pubkey, timestamp: i64) -> [u8; 32] {
    use anchor_lang::solana_program::keccak;
    
    let mut data = Vec::new();
    data.extend_from_slice(numbers);
    data.extend_from_slice(buyer.as_ref());
    data.extend_from_slice(&timestamp.to_le_bytes());
    
    keccak::hash(&data).to_bytes()
}

// Comptes pour initialiser la loterie
#[derive(Accounts)]
pub struct InitializeRaffle<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 8 + 8 + 8 + 8 + 1 + 8 + 5 + 32 + 1,
        seeds = [b"raffle"],
        bump
    )]
    pub raffle: Account<'info, Raffle>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

// Comptes pour acheter des tickets
#[derive(Accounts)]
pub struct BuyTickets<'info> {
    #[account(mut)]
    pub raffle: Account<'info, Raffle>,
    
    #[account(
        init,
        payer = buyer,
        space = 8 + 32 + 32 + 5 + 1 + 8 + 32,
        seeds = [b"entry", raffle.key().as_ref(), buyer.key().as_ref()],
        bump
    )]
    pub entry: Account<'info, TicketEntry>,
    
    #[account(mut)]
    pub buyer: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

// Comptes pour effectuer le tirage
#[derive(Accounts)]
pub struct ConductDraw<'info> {
    #[account(mut)]
    pub raffle: Account<'info, Raffle>,
    
    pub authority: Signer<'info>,
}

// Comptes pour déclarer un gagnant
#[derive(Accounts)]
pub struct SetWinner<'info> {
    #[account(mut)]
    pub raffle: Account<'info, Raffle>,
    
    pub authority: Signer<'info>,
}

// Structure de la loterie
#[account]
pub struct Raffle {
    pub authority: Pubkey,        // 32 bytes
    pub target_sol: u64,          // 8 bytes
    pub ticket_price: u64,        // 8 bytes
    pub total_tickets_sold: u64,  // 8 bytes
    pub total_sol_collected: u64, // 8 bytes
    pub status: RaffleStatus,     // 1 byte
    pub created_at: i64,          // 8 bytes
    pub winning_numbers: [u8; 5], // 5 bytes
    pub winner: Pubkey,           // 32 bytes
    pub is_draw_complete: bool,   // 1 byte
}

// Structure d'une entrée de ticket
#[account]
pub struct TicketEntry {
    pub raffle: Pubkey,    // 32 bytes
    pub buyer: Pubkey,     // 32 bytes
    pub numbers: [u8; 5],  // 5 bytes
    pub quantity: u8,      // 1 byte
    pub timestamp: i64,    // 8 bytes
    pub ticket_hash: [u8; 32], // 32 bytes
}

// Statut de la loterie
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum RaffleStatus {
    Active,
    PoolComplete,
    DrawComplete,
    Cancelled,
}

// Événements
#[event]
pub struct RaffleInitialized {
    pub raffle: Pubkey,
    pub authority: Pubkey,
    pub target_sol: u64,
    pub ticket_price: u64,
}

#[event]
pub struct TicketsPurchased {
    pub raffle: Pubkey,
    pub buyer: Pubkey,
    pub numbers: [u8; 5],
    pub quantity: u8,
    pub total_cost: u64,
    pub ticket_hash: [u8; 32],
}

#[event]
pub struct DrawConducted {
    pub raffle: Pubkey,
    pub winning_numbers: [u8; 5],
    pub total_tickets: u64,
}

#[event]
pub struct WinnerSet {
    pub raffle: Pubkey,
    pub winner: Pubkey,
    pub winning_numbers: [u8; 5],
}

// Codes d'erreur
#[error_code]
pub enum LotteryError {
    #[msg("La loterie n'est pas active")]
    RaffleNotActive,
    
    #[msg("Le pool est complet")]
    PoolComplete,
    
    #[msg("Fonds insuffisants")]
    InsufficientFunds,
    
    #[msg("Numéro invalide (doit être entre 1 et 49)")]
    InvalidNumber,
    
    #[msg("Numéros en double détectés")]
    DuplicateNumbers,
    
    #[msg("Non autorisé")]
    Unauthorized,
    
    #[msg("Le pool n'est pas complet")]
    PoolNotComplete,
    
    #[msg("Le tirage a déjà été effectué")]
    DrawAlreadyComplete,
    
    #[msg("Le tirage n'est pas terminé")]
    DrawNotComplete,
    
    #[msg("Échec de la génération aléatoire")]
    RandomGenerationFailed,
}


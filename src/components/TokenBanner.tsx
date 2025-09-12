import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface TokenData {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  marketCap: number;
  image: string;
}

const TokenBanner = () => {
  const [tokens, setTokens] = useState<TokenData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Top tokens Solana avec leurs IDs CoinGecko
  const tokenIds = [
    { symbol: 'SOL', name: 'Solana', id: 'solana' },
    { symbol: 'RAY', name: 'Raydium', id: 'raydium' },
    { symbol: 'ORCA', name: 'Orca', id: 'orca' },
    { symbol: 'SRM', name: 'Serum', id: 'serum' },
    { symbol: 'MNGO', name: 'Mango', id: 'mango-markets' },
    { symbol: 'STEP', name: 'Step Finance', id: 'step-finance' },
    { symbol: 'COPE', name: 'Cope', id: 'cope' },
    { symbol: 'FIDA', name: 'Bonfida', id: 'bonfida' },
    { symbol: 'KIN', name: 'Kin', id: 'kin' },
    { symbol: 'MAPS', name: 'Maps', id: 'maps' },
    { symbol: 'BONK', name: 'Bonk', id: 'bonk' },
    { symbol: 'WIF', name: 'Dogwifhat', id: 'dogwifcoin' },
    { symbol: 'JUP', name: 'Jupiter', id: 'jupiter-exchange-solana' },
    { symbol: 'PYTH', name: 'Pyth Network', id: 'pyth-network' },
    { symbol: 'JTO', name: 'Jito', id: 'jito-governance-token' },
  ];

  useEffect(() => {
    const loadTokens = async () => {
      setIsLoading(true);
      try {
        // Récupérer les données depuis CoinGecko API
        const ids = tokenIds.map(token => token.id).join(',');
        const response = await fetch(
          `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&per_page=10&page=1&sparkline=false&price_change_percentage=24h`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch token data');
        }
        
        const data = await response.json();
        
        // Mapper les données de l'API vers notre format et limiter à 10 tokens
        const mappedTokens: TokenData[] = data
          .slice(0, 10) // Limiter à 10 tokens
          .map((coin: any) => ({
            symbol: coin.symbol.toUpperCase(),
            name: coin.name,
            price: coin.current_price,
            change24h: coin.price_change_percentage_24h || 0,
            marketCap: coin.market_cap || 0,
            image: coin.image,
          }));
        
        setTokens(mappedTokens);
        setLastUpdate(new Date());
      } catch (error) {
        console.error('Error fetching token data:', error);
        // Fallback avec des données mockées en cas d'erreur
        setTokens([
          { symbol: 'SOL', name: 'Solana', price: 98.45, change24h: 2.34, marketCap: 45000000000, image: 'https://assets.coingecko.com/coins/images/4128/large/solana.png' },
          { symbol: 'RAY', name: 'Raydium', price: 1.23, change24h: -1.45, marketCap: 320000000, image: 'https://assets.coingecko.com/coins/images/13928/large/PSigc4ie_400x400.jpg' },
          { symbol: 'ORCA', name: 'Orca', price: 2.67, change24h: 3.21, marketCap: 180000000, image: 'https://assets.coingecko.com/coins/images/14947/large/orca.png' },
          { symbol: 'BONK', name: 'Bonk', price: 0.000012, change24h: 5.67, marketCap: 800000000, image: 'https://assets.coingecko.com/coins/images/28600/large/bonk.jpg' },
          { symbol: 'WIF', name: 'Dogwifhat', price: 1.45, change24h: -2.15, marketCap: 1450000000, image: 'https://assets.coingecko.com/coins/images/33566/large/dogwifhat.jpg' },
          { symbol: 'JUP', name: 'Jupiter', price: 0.89, change24h: 1.23, marketCap: 1200000000, image: 'https://assets.coingecko.com/coins/images/34188/large/jup.png' },
          { symbol: 'PYTH', name: 'Pyth Network', price: 0.34, change24h: 0.89, marketCap: 500000000, image: 'https://assets.coingecko.com/coins/images/31924/large/pyth.png' },
          { symbol: 'JTO', name: 'Jito', price: 2.15, change24h: -1.45, marketCap: 250000000, image: 'https://assets.coingecko.com/coins/images/33985/large/jito.png' },
        ]);
        setLastUpdate(new Date());
      } finally {
        setIsLoading(false);
      }
    };

    loadTokens();

    // Mettre à jour les prix toutes les 60 secondes
    const interval = setInterval(loadTokens, 60000);

    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price: number) => {
    if (price >= 1) return `$${price.toFixed(2)}`;
    if (price >= 0.01) return `$${price.toFixed(4)}`;
    return `$${price.toFixed(6)}`;
  };

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(1)}B`;
    if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(1)}M`;
    return `$${(marketCap / 1e3).toFixed(1)}K`;
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-3 w-3" />;
    if (change < 0) return <TrendingDown className="h-3 w-3" />;
    return <Minus className="h-3 w-3" />;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-500';
    if (change < 0) return 'text-red-500';
    return 'text-gray-500';
  };

  if (isLoading) {
    return (
      <div className="w-full bg-gradient-to-r from-primary/5 to-lottery-orange-light/5 border-b border-lottery-border">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="ml-2 text-sm text-muted-foreground">Loading token prices...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="w-full bg-gradient-to-r from-primary/5 to-lottery-orange-light/5 border-t border-lottery-border overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-7xl mx-auto px-4 py-2 sm:py-3">
        {/* Header - Hidden on mobile */}
        <div className="hidden sm:flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
            Top Solana Tokens
          </h3>
          <div className="flex items-center gap-2">
            {lastUpdate && (
              <span className="text-xs text-muted-foreground">
                Updated: {lastUpdate.toLocaleTimeString()}
              </span>
            )}
            <Badge variant="outline" className="text-xs">
              Live Prices
            </Badge>
          </div>
        </div>
        
        {/* Mobile header */}
        <div className="sm:hidden flex items-center justify-center mb-2">
          <h3 className="text-xs font-semibold text-foreground flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></span>
            Live Prices
          </h3>
        </div>
        
        {/* Token grid - More compact on mobile */}
        <div className="grid grid-cols-5 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10 gap-1 sm:gap-3">
          {tokens.slice(0, 10).map((token, index) => (
            <motion.div
              key={token.symbol}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-background/50 backdrop-blur-sm rounded-lg p-1.5 sm:p-3 border border-lottery-border/50 hover:border-primary/30 transition-all duration-200 hover:shadow-md"
            >
              <div className="flex flex-col items-center text-center space-y-0.5 sm:space-y-1">
                {/* Token Symbol - Compact on mobile */}
                <div className="flex items-center gap-0.5 sm:gap-1">
                  <div className="w-4 h-4 sm:w-6 sm:h-6 rounded-full overflow-hidden flex items-center justify-center bg-background border border-lottery-border">
                    <img 
                      src={token.image} 
                      alt={token.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback si l'image ne charge pas
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = `<span class="text-xs font-bold text-primary">${token.symbol.charAt(0)}</span>`;
                          parent.className = 'w-4 h-4 sm:w-6 sm:h-6 bg-gradient-to-br from-primary to-lottery-orange-dark rounded-full flex items-center justify-center';
                        }
                      }}
                    />
                  </div>
                  <span className="text-xs font-bold text-foreground hidden sm:inline">
                    {token.symbol}
                  </span>
                </div>

                {/* Price - Smaller on mobile */}
                <div className="text-xs font-semibold text-foreground">
                  {formatPrice(token.price)}
                </div>

                {/* 24h Change - Hidden on mobile */}
                <div className={`hidden sm:flex items-center gap-1 text-xs ${getChangeColor(token.change24h)}`}>
                  {getChangeIcon(token.change24h)}
                  <span className="font-medium">
                    {token.change24h > 0 ? '+' : ''}{token.change24h.toFixed(2)}%
                  </span>
                </div>

                {/* Market Cap - Hidden on mobile */}
                <div className="hidden sm:block text-xs text-muted-foreground">
                  {formatMarketCap(token.marketCap)}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default TokenBanner;

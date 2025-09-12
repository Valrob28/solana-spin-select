import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Trophy, Menu, X, HelpCircle, FileText, Shield, Home } from 'lucide-react';
import WalletConnectButton from './WalletConnectButton';

interface MobileHeaderProps {
  onHowToPlay?: () => void;
  onTerms?: () => void;
  onFAQ?: () => void;
  onAdmin?: () => void;
  onHome?: () => void;
}

const MobileHeader = ({ onHowToPlay, onTerms, onFAQ, onAdmin, onHome }: MobileHeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    { label: 'Home', icon: Home, onClick: onHome },
    { label: 'How to Play', icon: HelpCircle, onClick: onHowToPlay },
    { label: 'Terms', icon: FileText, onClick: onTerms },
    { label: 'FAQ', icon: HelpCircle, onClick: onFAQ },
    { label: 'Admin', icon: Shield, onClick: onAdmin },
  ];

  const handleMenuClick = (onClick?: () => void) => {
    onClick?.();
    setIsMenuOpen(false);
  };

  return (
    <motion.header 
      className="flex justify-between items-center p-4 max-w-7xl mx-auto lg:hidden"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Logo */}
      <div className="flex items-center space-x-2">
        <div className="w-10 h-10 bg-gradient-to-br from-primary to-lottery-orange-dark rounded-xl flex items-center justify-center shadow-lg">
          <Trophy className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-foreground">LuckySol.xyz</h1>
          <p className="text-xs text-muted-foreground">Solana blockchain</p>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className="flex items-center gap-2">
        <WalletConnectButton />
        
        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="h-10 w-10 p-0">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80 bg-gradient-to-b from-lottery-bg to-lottery-orange-light border-lottery-border">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-lottery-orange-dark rounded-xl flex items-center justify-center shadow-lg">
                    <Trophy className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-foreground">LuckySol.xyz</h2>
                    <p className="text-sm text-muted-foreground">Solana Lottery</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsMenuOpen(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Navigation */}
              <nav className="flex-1">
                <ul className="space-y-2">
                  {menuItems.map((item, index) => (
                    <motion.li
                      key={item.label}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Button
                        variant="ghost"
                        className="w-full justify-start h-12 text-left hover:bg-primary/10 hover:text-primary"
                        onClick={() => handleMenuClick(item.onClick)}
                      >
                        <item.icon className="mr-3 h-5 w-5" />
                        {item.label}
                      </Button>
                    </motion.li>
                  ))}
                </ul>
              </nav>

              {/* Footer */}
              <div className="mt-auto pt-6 border-t border-lottery-border/50">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-2">
                    Built on Solana blockchain
                  </p>
                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Network: Solana</span>
                  </div>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </motion.header>
  );
};

export default MobileHeader;

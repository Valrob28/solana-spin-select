import { motion } from 'framer-motion';
import { Trophy, Github, Twitter, Mail, Shield, FileText, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FooterProps {
  onHowToPlay?: () => void;
  onTerms?: () => void;
  onFAQ?: () => void;
  onAdmin?: () => void;
}

const Footer = ({ onHowToPlay, onTerms, onFAQ, onAdmin }: FooterProps) => {
  const currentYear = new Date().getFullYear();

  return (
    <motion.footer 
      className="bg-gradient-to-r from-primary/10 via-lottery-orange-light/20 to-primary/10 border-t border-lottery-border"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-lottery-orange-dark rounded-xl flex items-center justify-center shadow-lg">
                <Trophy className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">LuckySol.xyz</h3>
                <p className="text-sm text-muted-foreground">Solana Lottery</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              The premier decentralized lottery platform on Solana blockchain. 
              Fair, transparent, and secure gaming experience.
            </p>
            <div className="flex space-x-3">
              <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                <Github className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                <Mail className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={onHowToPlay}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                >
                  <HelpCircle className="h-3 w-3" />
                  How to Play
                </button>
              </li>
              <li>
                <button 
                  onClick={onTerms}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                >
                  <FileText className="h-3 w-3" />
                  Terms & Conditions
                </button>
              </li>
              <li>
                <button 
                  onClick={onFAQ}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                >
                  <HelpCircle className="h-3 w-3" />
                  FAQ
                </button>
              </li>
              <li>
                <button 
                  onClick={onAdmin}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                >
                  <Shield className="h-3 w-3" />
                  Admin Panel
                </button>
              </li>
            </ul>
          </div>

          {/* Game Info */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">Game Information</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• 5 numbers from 1-49</li>
              <li>• Minimum bet: 0.01 SOL</li>
              <li>• Multiple winners</li>
              <li>• Transparent draws</li>
              <li>• Instant payouts</li>
            </ul>
          </div>

          {/* Security & Trust */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">Security & Trust</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Smart contract verified</li>
              <li>• Decentralized on Solana</li>
              <li>• No central authority</li>
              <li>• Open source code</li>
              <li>• Community audited</li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-6 border-t border-lottery-border/50">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-muted-foreground text-center sm:text-left">
              © {currentYear} LuckySol.xyz. All rights reserved. Built on Solana blockchain.
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Network: Solana
              </span>
              <span>Version 1.0.0</span>
            </div>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;

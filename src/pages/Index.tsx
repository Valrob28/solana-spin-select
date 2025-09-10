import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '@solana/wallet-adapter-react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Ticket, History, HelpCircle, FileText, Info } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import HomePage from '@/components/HomePage';
import NumberGrid from '@/components/NumberGrid';
import TicketCard from '@/components/TicketCard';
import DrawHistory from '@/components/DrawHistory';
import HowToPlay from '@/components/HowToPlay';
import TermsAndDisclaimer from '@/components/TermsAndDisclaimer';
import FAQ from '@/components/FAQ';

type ViewMode = 'home' | 'play' | 'dashboard' | 'how-to-play' | 'terms' | 'faq';

const Index = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('home');
  const [activeTab, setActiveTab] = useState('tickets');
  const { connected } = useWallet();
  const { toast } = useToast();

  const handleConnectAndPlay = () => {
    if (!connected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet first to play the lottery.",
        variant: "destructive",
      });
      return;
    }
    setViewMode('play');
  };

  const handleBuyTicket = async (quantity: number) => {
    try {
      // Simulate ticket purchase
      toast({
        title: "Tickets purchased successfully!",
        description: `You bought ${quantity} ticket${quantity > 1 ? 's' : ''}. Good luck!`,
      });
      
      // Switch to dashboard to show the new ticket
      setViewMode('dashboard');
      setActiveTab('tickets');
    } catch (error) {
      toast({
        title: "Purchase failed",
        description: "There was an error purchasing your tickets. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleClaimPrize = (ticketId: string) => {
    toast({
      title: "Prize claimed!",
      description: `Congratulations! Your prize for ticket #${ticketId} has been claimed.`,
    });
  };

  const renderContent = () => {
    switch (viewMode) {
      case 'home':
        return <HomePage onConnectAndPlay={handleConnectAndPlay} />;
      
      case 'play':
        return (
          <NumberGrid
            onBack={() => setViewMode('home')}
            onBuyTicket={handleBuyTicket}
          />
        );

      case 'how-to-play':
        return (
          <div className="min-h-screen bg-gradient-to-b from-lottery-bg to-lottery-orange-light">
            <div className="max-w-6xl mx-auto p-6">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between mb-8"
              >
                <Button
                  variant="outline"
                  onClick={() => setViewMode('home')}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Home
                </Button>
              </motion.div>
              <HowToPlay />
            </div>
          </div>
        );

      case 'terms':
        return (
          <div className="min-h-screen bg-gradient-to-b from-lottery-bg to-lottery-orange-light">
            <div className="max-w-6xl mx-auto p-6">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between mb-8"
              >
                <Button
                  variant="outline"
                  onClick={() => setViewMode('home')}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Home
                </Button>
              </motion.div>
              <TermsAndDisclaimer />
            </div>
          </div>
        );

      case 'faq':
        return (
          <div className="min-h-screen bg-gradient-to-b from-lottery-bg to-lottery-orange-light">
            <div className="max-w-6xl mx-auto p-6">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between mb-8"
              >
                <Button
                  variant="outline"
                  onClick={() => setViewMode('home')}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Home
                </Button>
              </motion.div>
              <FAQ />
            </div>
          </div>
        );
      
      case 'dashboard':
        return (
          <div className="min-h-screen bg-gradient-to-b from-lottery-bg to-lottery-orange-light">
            <div className="max-w-6xl mx-auto p-6">
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex items-center justify-between mb-8"
              >
                <Button
                  variant="outline"
                  onClick={() => setViewMode('home')}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Home
                </Button>
                
                <div className="text-right">
                  <h1 className="text-3xl font-bold text-foreground">My Dashboard</h1>
                  <p className="text-muted-foreground">Manage your tickets and view draw history</p>
                </div>
              </motion.div>

              {/* Tabs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-5 mb-8">
                    <TabsTrigger value="tickets" className="flex items-center gap-2">
                      <Ticket className="h-4 w-4" />
                      My Tickets
                    </TabsTrigger>
                    <TabsTrigger value="history" className="flex items-center gap-2">
                      <History className="h-4 w-4" />
                      Draw History
                    </TabsTrigger>
                    <TabsTrigger value="how-to-play" className="flex items-center gap-2">
                      <Info className="h-4 w-4" />
                      How to Play
                    </TabsTrigger>
                    <TabsTrigger value="terms" className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Terms
                    </TabsTrigger>
                    <TabsTrigger value="faq" className="flex items-center gap-2">
                      <HelpCircle className="h-4 w-4" />
                      FAQ
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="tickets">
                    <TicketCard tickets={[]} onClaimPrize={handleClaimPrize} />
                  </TabsContent>
                  
                  <TabsContent value="history">
                    <DrawHistory />
                  </TabsContent>

                  <TabsContent value="how-to-play">
                    <HowToPlay />
                  </TabsContent>

                  <TabsContent value="terms">
                    <TermsAndDisclaimer />
                  </TabsContent>

                  <TabsContent value="faq">
                    <FAQ />
                  </TabsContent>
                </Tabs>
              </motion.div>
            </div>
          </div>
        );
      
      default:
        return <HomePage onConnectAndPlay={handleConnectAndPlay} />;
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={viewMode}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {renderContent()}
      </motion.div>
    </AnimatePresence>
  );
};

export default Index;

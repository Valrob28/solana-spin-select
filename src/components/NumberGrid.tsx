import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shuffle, ArrowLeft, ShoppingCart } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface NumberGridProps {
  onBack: () => void;
  onBuyTicket: (numbers: number[]) => void;
}

const NumberGrid = ({ onBack, onBuyTicket }: NumberGridProps) => {
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const { toast } = useToast();
  const maxNumbers = 5;
  const maxNumber = 49;

  const toggleNumber = (number: number) => {
    if (selectedNumbers.includes(number)) {
      setSelectedNumbers(prev => prev.filter(n => n !== number));
    } else if (selectedNumbers.length < maxNumbers) {
      setSelectedNumbers(prev => [...prev, number].sort((a, b) => a - b));
    } else {
      toast({
        title: "Maximum numbers selected",
        description: `You can only select ${maxNumbers} numbers.`,
        variant: "destructive",
      });
    }
  };

  const quickPick = () => {
    const numbers: number[] = [];
    while (numbers.length < maxNumbers) {
      const randomNumber = Math.floor(Math.random() * maxNumber) + 1;
      if (!numbers.includes(randomNumber)) {
        numbers.push(randomNumber);
      }
    }
    setSelectedNumbers(numbers.sort((a, b) => a - b));
    toast({
      title: "Numbers selected!",
      description: "Your lucky numbers have been randomly chosen.",
    });
  };

  const clearSelection = () => {
    setSelectedNumbers([]);
  };

  const handleBuyTicket = () => {
    if (selectedNumbers.length !== maxNumbers) {
      toast({
        title: "Incomplete selection",
        description: `Please select exactly ${maxNumbers} numbers.`,
        variant: "destructive",
      });
      return;
    }
    onBuyTicket(selectedNumbers);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-lottery-bg to-lottery-orange-light p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-8"
        >
          <Button
            variant="outline"
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
          
          <div className="text-right">
            <h1 className="text-2xl font-bold text-foreground">Pick Your Numbers</h1>
            <p className="text-muted-foreground">Select {maxNumbers} numbers from 1 to {maxNumber}</p>
          </div>
        </motion.div>

        {/* Selection Status */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <Card className="bg-lottery-card border-lottery-border shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center justify-between">
                <span>Your Selection</span>
                <Badge variant={selectedNumbers.length === maxNumbers ? "default" : "secondary"}>
                  {selectedNumbers.length}/{maxNumbers}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3 mb-4">
                {selectedNumbers.length > 0 ? (
                  selectedNumbers.map((number) => (
                    <motion.div
                      key={number}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-12 h-12 bg-primary text-primary-foreground rounded-xl flex items-center justify-center font-bold text-lg shadow-md"
                    >
                      {number}
                    </motion.div>
                  ))
                ) : (
                  <p className="text-muted-foreground">No numbers selected</p>
                )}
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={quickPick}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Shuffle className="h-4 w-4" />
                  Quick Pick
                </Button>
                
                {selectedNumbers.length > 0 && (
                  <Button
                    onClick={clearSelection}
                    variant="outline"
                  >
                    Clear All
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Number Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <Card className="bg-lottery-card border-lottery-border shadow-lg">
            <CardHeader>
              <CardTitle>Choose Numbers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 sm:grid-cols-10 gap-2">
                {Array.from({ length: maxNumber }, (_, i) => i + 1).map((number) => {
                  const isSelected = selectedNumbers.includes(number);
                  return (
                    <motion.button
                      key={number}
                      onClick={() => toggleNumber(number)}
                      disabled={!isSelected && selectedNumbers.length >= maxNumbers}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`
                        aspect-square rounded-xl font-bold text-lg transition-all duration-200 shadow-sm
                        ${isSelected
                          ? 'bg-primary text-primary-foreground shadow-md scale-105'
                          : 'bg-muted hover:bg-accent text-foreground hover:scale-105'
                        }
                        ${!isSelected && selectedNumbers.length >= maxNumbers
                          ? 'opacity-50 cursor-not-allowed'
                          : 'cursor-pointer'
                        }
                      `}
                    >
                      {number}
                    </motion.button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Purchase Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card className="bg-lottery-card border-lottery-border shadow-lg">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-lg text-foreground mb-1">Ticket Summary</h3>
                  <p className="text-muted-foreground">
                    {selectedNumbers.length === maxNumbers
                      ? `Numbers: ${selectedNumbers.join(', ')}`
                      : `Select ${maxNumbers - selectedNumbers.length} more number${maxNumbers - selectedNumbers.length !== 1 ? 's' : ''}`
                    }
                  </p>
                  <p className="text-primary font-bold text-xl mt-2">Cost: 0.02 SOL</p>
                </div>
                
                <Button
                  onClick={handleBuyTicket}
                  disabled={selectedNumbers.length !== maxNumbers}
                  size="lg"
                  className="bg-gradient-to-r from-primary to-lottery-orange-dark text-primary-foreground hover:from-primary/90 hover:to-lottery-orange-dark/90 px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Buy Ticket
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default NumberGrid;
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shuffle, Target } from 'lucide-react';

interface NumberSelectorProps {
  onNumbersSelected: (numbers: number[]) => void;
  onQuickPick: () => void;
  maxNumbers?: number;
  maxNumber?: number;
  allowMultipleCombinations?: boolean;
  ticketQuantity?: number;
  onCombinationsChanged?: (combinations: number[][]) => void;
}

const NumberSelector = ({ 
  onNumbersSelected, 
  onQuickPick, 
  maxNumbers = 5, 
  maxNumber = 49,
  allowMultipleCombinations = false,
  ticketQuantity = 1,
  onCombinationsChanged
}: NumberSelectorProps) => {
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [combinations, setCombinations] = useState<number[][]>([]);

  const toggleNumber = (number: number) => {
    if (selectedNumbers.includes(number)) {
      const newNumbers = selectedNumbers.filter(n => n !== number);
      setSelectedNumbers(newNumbers);
      onNumbersSelected(newNumbers);
    } else if (selectedNumbers.length < maxNumbers) {
      const newNumbers = [...selectedNumbers, number];
      setSelectedNumbers(newNumbers);
      onNumbersSelected(newNumbers);
    }
  };

  const quickPick = () => {
    const numbers: number[] = [];
    const used = new Set<number>();
    
    while (numbers.length < maxNumbers) {
      const randomNum = Math.floor(Math.random() * maxNumber) + 1;
      if (!used.has(randomNum)) {
        numbers.push(randomNum);
        used.add(randomNum);
      }
    }
    
    numbers.sort((a, b) => a - b);
    setSelectedNumbers(numbers);
    onNumbersSelected(numbers);
    onQuickPick();
  };

  const clearSelection = () => {
    setSelectedNumbers([]);
    onNumbersSelected([]);
  };

  const addCombination = () => {
    if (selectedNumbers.length === maxNumbers) {
      const newCombinations = [...combinations, [...selectedNumbers]];
      setCombinations(newCombinations);
      setSelectedNumbers([]);
      onNumbersSelected([]);
      onCombinationsChanged?.(newCombinations);
    }
  };

  const removeCombination = (index: number) => {
    const newCombinations = combinations.filter((_, i) => i !== index);
    setCombinations(newCombinations);
    onCombinationsChanged?.(newCombinations);
  };

  const clearAllCombinations = () => {
    setCombinations([]);
    setSelectedNumbers([]);
    onNumbersSelected([]);
    onCombinationsChanged?.([]);
  };

  const quickPickMultiple = () => {
    if (allowMultipleCombinations && ticketQuantity > 1) {
      const newCombinations: number[][] = [];
      for (let i = 0; i < ticketQuantity; i++) {
        const numbers: number[] = [];
        const used = new Set<number>();
        
        while (numbers.length < maxNumbers) {
          const randomNum = Math.floor(Math.random() * maxNumber) + 1;
          if (!used.has(randomNum)) {
            numbers.push(randomNum);
            used.add(randomNum);
          }
        }
        
        newCombinations.push(numbers.sort((a, b) => a - b));
      }
      
      setCombinations(newCombinations);
      setSelectedNumbers([]);
      onNumbersSelected([]);
      onCombinationsChanged?.(newCombinations);
      onQuickPick();
    } else {
      quickPick();
    }
  };

  return (
    <Card className="bg-lottery-card border-lottery-border shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Choose Your Lucky Numbers
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Selected Numbers Display */}
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-muted-foreground">
              Selected ({selectedNumbers.length}/{maxNumbers})
            </p>
            {selectedNumbers.length > 0 && (
              <Button
                onClick={clearSelection}
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700"
              >
                Clear
              </Button>
            )}
          </div>
          
          <div className="flex gap-2 flex-wrap min-h-[3rem] items-center">
            {selectedNumbers.length > 0 ? (
              selectedNumbers.map((number) => (
                <motion.div
                  key={number}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-8 h-8 sm:w-10 sm:h-10 bg-primary text-primary-foreground rounded-lg flex items-center justify-center font-bold text-xs sm:text-sm shadow-md"
                >
                  {number}
                </motion.div>
              ))
            ) : (
              <p className="text-muted-foreground text-sm">No numbers selected</p>
            )}
          </div>
        </div>

        {/* Number Grid */}
        <div className="grid grid-cols-7 sm:grid-cols-10 gap-1 sm:gap-2">
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
                  aspect-square rounded-lg font-bold text-xs sm:text-sm transition-all duration-200 shadow-sm
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

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={allowMultipleCombinations ? quickPickMultiple : quickPick}
            variant="outline"
            className="flex items-center gap-2 flex-1"
          >
            <Shuffle className="h-4 w-4" />
            {allowMultipleCombinations && ticketQuantity > 1 ? `Quick Pick ${ticketQuantity}` : 'Quick Pick'}
          </Button>
          
          {allowMultipleCombinations && selectedNumbers.length === maxNumbers && (
            <Button
              onClick={addCombination}
              variant="default"
              size="sm"
              className="bg-green-600 hover:bg-green-700"
            >
              Add Combination
            </Button>
          )}
          
          {selectedNumbers.length === maxNumbers && !allowMultipleCombinations && (
            <Badge className="bg-green-500 text-white px-3 py-1">
              Ready to play!
            </Badge>
          )}
        </div>

        {/* Multiple Combinations Display */}
        {allowMultipleCombinations && combinations.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-foreground">Your Combinations ({combinations.length}/{ticketQuantity})</h4>
              <Button
                onClick={clearAllCombinations}
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700"
              >
                Clear All
              </Button>
            </div>
            
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {combinations.map((combination, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
                    <div className="flex gap-1">
                      {combination.map((number) => (
                        <div
                          key={number}
                          className="w-6 h-6 bg-primary text-primary-foreground rounded text-xs flex items-center justify-center font-bold"
                        >
                          {number}
                        </div>
                      ))}
                    </div>
                  </div>
                  <Button
                    onClick={() => removeCombination(index)}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
            
            {combinations.length === ticketQuantity && (
              <Badge className="bg-green-500 text-white px-3 py-1 w-full text-center">
                Ready to play with {ticketQuantity} different combinations!
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NumberSelector;

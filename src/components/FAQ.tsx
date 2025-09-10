import { motion } from 'framer-motion';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle, Shield, DollarSign, Trophy, Clock, Users } from 'lucide-react';

const faqData = [
  {
    category: "Getting Started",
    icon: Users,
    questions: [
      {
        question: "How do I start playing the Crypto Lottery?",
        answer: "Simply connect your Solana wallet (Phantom or Solflare), select 5 numbers from 1-49, and purchase your tickets for 0.02 SOL each. It's that easy!"
      },
      {
        question: "What wallets are supported?",
        answer: "We support all major Solana wallets including Phantom, Solflare, and any wallet compatible with the Solana wallet adapter."
      },
      {
        question: "Do I need SOL to play?",
        answer: "Yes, you need SOL (Solana's native token) to purchase lottery tickets. Each ticket costs 0.02 SOL plus minimal network fees."
      }
    ]
  },
  {
    category: "Tickets & Pricing",
    icon: DollarSign,
    questions: [
      {
        question: "How much do tickets cost?",
        answer: "Individual tickets cost 0.02 SOL each. We offer bulk discounts up to 40% off for larger purchases (5, 10, 25, 50, or 100 tickets)."
      },
      {
        question: "Are there any additional fees?",
        answer: "No hidden fees! You only pay the ticket price plus standard Solana network transaction fees (typically less than $0.01)."
      },
      {
        question: "Can I buy multiple tickets with different numbers?",
        answer: "Currently, bulk purchases use the same set of numbers. To play different number combinations, you'll need to make separate ticket purchases."
      }
    ]
  },
  {
    category: "Draws & Fairness",
    icon: Shield,
    questions: [
      {
        question: "How are the draws conducted?",
        answer: "All draws use Solana's Verifiable Random Function (VRF) technology, ensuring complete transparency and fairness. Results are permanently recorded on the blockchain."
      },
      {
        question: "When do draws happen?",
        answer: "Draws are scheduled regularly. Check the Draw History section for upcoming draw dates and past results."
      },
      {
        question: "How can I verify the fairness of draws?",
        answer: "Every draw includes a VRF proof link that allows you to verify the randomness on the Solana blockchain. This ensures no one can manipulate the results."
      }
    ]
  },
  {
    category: "Prizes & Payouts",
    icon: Trophy,
    questions: [
      {
        question: "What prizes can I win?",
        answer: "We offer 10 incredible prizes including Ferrari 488 Italia, Mercedes-AMG GT, $50,000 cash, luxury vacation, Rolex Submariner, tech packages, and more!"
      },
      {
        question: "How are prizes distributed?",
        answer: "Digital prizes and cash are automatically sent to your wallet via smart contract. Physical prizes require identity verification and shipping arrangements."
      },
      {
        question: "How long do I have to claim my prize?",
        answer: "You have 30 days from the draw date to claim your prize. Digital prizes are automatically distributed, but physical prizes require active claiming."
      },
      {
        question: "Are there taxes on winnings?",
        answer: "Tax obligations vary by jurisdiction. You are responsible for reporting and paying any applicable taxes on your winnings according to your local laws."
      }
    ]
  },
  {
    category: "Technical & Security",
    icon: Clock,
    questions: [
      {
        question: "Is my wallet safe?",
        answer: "Yes! We only request permission for ticket purchases. Your private keys remain in your wallet and are never shared with our platform."
      },
      {
        question: "What if my transaction fails?",
        answer: "If a transaction fails, your SOL will remain in your wallet. Common causes include insufficient funds or network congestion. Simply try again."
      },
      {
        question: "Can I play from any country?",
        answer: "Crypto Lottery is available globally except in restricted jurisdictions. You must be 18+ or the legal gambling age in your location."
      }
    ]
  }
];

const FAQ = () => {
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h2 className="text-4xl font-bold text-foreground mb-4">Frequently Asked Questions</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Find answers to common questions about playing the Crypto Lottery, prizes, and how our platform works.
        </p>
      </motion.div>

      <div className="space-y-6">
        {faqData.map((category, categoryIndex) => (
          <motion.div
            key={category.category}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
          >
            <Card className="bg-lottery-card border-lottery-border shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-lottery-orange-dark rounded-lg flex items-center justify-center">
                    <category.icon className="h-5 w-5 text-primary-foreground" />
                  </div>
                  {category.category}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {category.questions.map((faq, index) => (
                    <AccordionItem 
                      key={index} 
                      value={`${categoryIndex}-${index}`}
                      className="border-lottery-border"
                    >
                      <AccordionTrigger className="text-left hover:text-primary transition-colors">
                        <div className="flex items-start gap-3">
                          <HelpCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <span className="font-medium">{faq.question}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="ml-8 text-muted-foreground leading-relaxed">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Contact Support */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <Card className="bg-gradient-to-r from-primary/5 to-lottery-orange-light/20 border-primary/20">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-lottery-orange-dark rounded-2xl flex items-center justify-center mx-auto mb-4">
              <HelpCircle className="h-8 w-8 text-primary-foreground" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-4">Still Need Help?</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Can't find the answer you're looking for? Our support team is here to help! 
              Reach out through any of our channels and we'll get back to you quickly.
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="text-primary">📧</span>
                </div>
                <span>support@cryptolottery.sol</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="text-primary">💬</span>
                </div>
                <span>Discord Community</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="text-primary">🐦</span>
                </div>
                <span>@CryptoLottery</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default FAQ;
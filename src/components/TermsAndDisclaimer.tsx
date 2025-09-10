import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle, DollarSign, Globe, Clock, Lock, Scale, FileText } from 'lucide-react';

const TermsAndDisclaimer = () => {
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h2 className="text-4xl font-bold text-foreground mb-4">Terms & Legal Information</h2>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Please read and understand all terms, conditions, and disclaimers before participating in the Crypto Lottery.
        </p>
      </motion.div>

      {/* Important Disclaimer */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <AlertTitle className="text-red-800 font-bold">Important Disclaimer</AlertTitle>
          <AlertDescription className="text-red-700">
            This is a crypto lottery involving financial risk. Only participate with funds you can afford to lose. 
            Gambling can be addictive. Must be 18+ or legal age in your jurisdiction. 
            Not available in restricted territories.
          </AlertDescription>
        </Alert>
      </motion.div>

      <div className="grid gap-6">
        {/* Payment Terms */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card className="bg-lottery-card border-lottery-border shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                Payment Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-muted/50 rounded-lg p-4">
                  <h4 className="font-semibold text-foreground mb-2">Ticket Pricing</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Individual tickets: 0.02 SOL each</li>
                    <li>• Bulk discounts: Up to 40% off</li>
                    <li>• Prices displayed in SOL only</li>
                    <li>• No hidden fees or charges</li>
                  </ul>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <h4 className="font-semibold text-foreground mb-2">Payment Processing</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Payments processed on Solana blockchain</li>
                    <li>• Transactions are irreversible</li>
                    <li>• Network fees may apply</li>
                    <li>• Instant confirmation required</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Terms of Service */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="bg-lottery-card border-lottery-border shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Terms of Service
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">1</Badge>
                    Eligibility
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Must be 18+ years old or legal gambling age in your jurisdiction. Residents of restricted territories cannot participate. 
                    By using this service, you confirm you meet all eligibility requirements.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">2</Badge>
                    Fair Play
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    All draws use Solana's Verifiable Random Function (VRF) for provable fairness. 
                    Results cannot be manipulated and are permanently recorded on the blockchain.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">3</Badge>
                    Prize Distribution
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Prizes are distributed automatically via smart contract. Physical prizes require additional verification and shipping. 
                    Winners have 30 days to claim prizes.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Risk Warnings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Card className="bg-lottery-card border-lottery-border shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Risk Warnings & Responsible Gaming
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground">Financial Risks</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Cryptocurrency values are volatile</li>
                    <li>• You may lose all invested funds</li>
                    <li>• No guaranteed returns or winnings</li>
                    <li>• Blockchain transactions are irreversible</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground">Responsible Gaming</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Set spending limits before playing</li>
                    <li>• Never chase losses</li>
                    <li>• Take regular breaks</li>
                    <li>• Seek help if gambling becomes a problem</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Legal & Compliance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Card className="bg-lottery-card border-lottery-border shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-primary" />
                Legal & Compliance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <Globe className="h-8 w-8 text-primary mx-auto mb-2" />
                  <h4 className="font-semibold text-foreground mb-1">Jurisdiction</h4>
                  <p className="text-xs text-muted-foreground">
                    Operated under international blockchain regulations
                  </p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <Lock className="h-8 w-8 text-primary mx-auto mb-2" />
                  <h4 className="font-semibold text-foreground mb-1">Data Protection</h4>
                  <p className="text-xs text-muted-foreground">
                    Full compliance with privacy laws and GDPR
                  </p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <Clock className="h-8 w-8 text-primary mx-auto mb-2" />
                  <h4 className="font-semibold text-foreground mb-1">Updates</h4>
                  <p className="text-xs text-muted-foreground">
                    Terms may be updated with 30-day notice
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Contact Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.7 }}
      >
        <Card className="bg-gradient-to-r from-primary/5 to-lottery-orange-light/20 border-primary/20">
          <CardContent className="p-6 text-center">
            <h3 className="text-xl font-bold text-foreground mb-4">Questions or Concerns?</h3>
            <p className="text-muted-foreground mb-4">
              If you have any questions about these terms or need support, please contact us.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
              <span>📧 support@cryptolottery.sol</span>
              <span>💬 Discord Community</span>
              <span>🐦 @CryptoLottery</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default TermsAndDisclaimer;
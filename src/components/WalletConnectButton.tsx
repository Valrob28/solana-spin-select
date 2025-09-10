import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Button } from "@/components/ui/button";
import { Wallet } from 'lucide-react';

const WalletConnectButton = () => {
  const { connected, publicKey } = useWallet();

  if (connected && publicKey) {
    return (
      <Button variant="outline" className="font-medium">
        <Wallet className="mr-2 h-4 w-4" />
        {publicKey.toString().slice(0, 4)}...{publicKey.toString().slice(-4)}
      </Button>
    );
  }

  return (
    <div className="wallet-adapter-button-trigger">
      <WalletMultiButton className="!bg-primary !text-primary-foreground hover:!bg-primary/90 !border-0 !rounded-xl !font-medium !px-8 !py-3 !text-base !shadow-lg hover:!shadow-xl !transition-all !duration-200" />
    </div>
  );
};

export default WalletConnectButton;
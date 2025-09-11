import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';

const WalletConnectButton = () => {
  const { connected, publicKey } = useWallet();
  const [open, setOpen] = useState(false);

  const hasBrowserWallet = useMemo(() => {
    if (typeof window === 'undefined') return false;
    const w: any = window as any;
    return Boolean(w.solana?.isPhantom || w.solflare || w.backpack || w.solana?.isBraveWallet);
  }, []);

  if (connected && publicKey) {
    return (
      <Button variant="outline" className="font-medium">
        {publicKey.toString().slice(0, 4)}...{publicKey.toString().slice(-4)}
      </Button>
    );
  }

  if (!hasBrowserWallet) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="bg-primary text-primary-foreground rounded-xl font-medium px-8 py-3 text-base shadow-lg hover:shadow-xl">
            Connect Wallet
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>No wallet detected</DialogTitle>
            <DialogDescription>
              Install a Solana wallet extension to continue:
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <a className="underline text-primary" href="https://phantom.app/download" target="_blank" rel="noreferrer">Install Phantom</a>
            <a className="underline text-primary" href="https://solflare.com/download" target="_blank" rel="noreferrer">Install Solflare</a>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <WalletMultiButton className="!bg-primary !text-primary-foreground hover:!bg-primary/90 !border-0 !rounded-xl !font-medium !px-8 !py-3 !text-base !shadow-lg hover:!shadow-xl !transition-all !duration-200" />
  );
};

export default WalletConnectButton;
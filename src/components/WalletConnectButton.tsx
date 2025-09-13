import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { LogOut, Copy, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const WalletConnectButton = () => {
  const { connected, publicKey, disconnect } = useWallet();
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const hasBrowserWallet = useMemo(() => {
    if (typeof window === 'undefined') return false;
    const w: any = window as any;
    return Boolean(w.solana?.isPhantom || w.solflare || w.backpack || w.solana?.isBraveWallet);
  }, []);

  const handleDisconnect = async () => {
    try {
      await disconnect();
      toast({
        title: "Wallet disconnected",
        description: "You have been successfully disconnected from your wallet.",
      });
    } catch (error) {
      toast({
        title: "Disconnect failed",
        description: "Failed to disconnect from wallet. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCopyAddress = () => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey.toString());
      toast({
        title: "Address copied",
        description: "Wallet address copied to clipboard.",
      });
    }
  };

  const handleViewOnExplorer = () => {
    if (publicKey) {
      window.open(`https://explorer.solana.com/address/${publicKey.toString()}`, '_blank');
    }
  };

  if (connected && publicKey) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="font-medium">
            {publicKey.toString().slice(0, 4)}...{publicKey.toString().slice(-4)}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onClick={handleCopyAddress} className="cursor-pointer">
            <Copy className="mr-2 h-4 w-4" />
            Copy address
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleViewOnExplorer} className="cursor-pointer">
            <ExternalLink className="mr-2 h-4 w-4" />
            View on Explorer
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDisconnect} className="cursor-pointer text-red-600 focus:text-red-600">
            <LogOut className="mr-2 h-4 w-4" />
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
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
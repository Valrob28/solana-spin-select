import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

const WalletConnectButton = () => {
  return (
    <WalletMultiButton className="!bg-primary !text-primary-foreground hover:!bg-primary/90 !border-0 !rounded-xl !font-medium !px-8 !py-3 !text-base !shadow-lg hover:!shadow-xl !transition-all !duration-200" />
  );
};

export default WalletConnectButton;
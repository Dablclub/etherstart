import { useEffect, useState } from 'react';
import { useSwitchChain } from 'wagmi';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '../ui/button';
import { toast } from 'sonner';

export default function SwitchNetworkModal() {
  const [isMounted, setIsMounted] = useState(false);
  const { chains, switchChain } = useSwitchChain();
  console.log(chains);
  const [polygonChain] = chains.filter((chain) => chain.id === 137);
  console.log(polygonChain);

  useEffect(() => {
    if (!isMounted) {
      setIsMounted(true);
    }
  }, [isMounted]);

  function handleSwitchChain() {
    switchChain({ chainId: polygonChain.id });
    toast.success('Changed to Polygon PoS (chain id: 137)');
  }

  return (
    <Dialog>
      <DialogTrigger asChild className="w-full">
        <Button>Swap ERC20</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center">Switch Chain</DialogTitle>
          <DialogDescription>
            Swapping is only enabled for Polygon PoS. You need to switch chain.
          </DialogDescription>
        </DialogHeader>
        <Button onClick={handleSwitchChain}>
          Switch to Polygon PoS
          {/* {polygonChain?.name} */}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

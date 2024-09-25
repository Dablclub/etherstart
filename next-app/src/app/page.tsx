'use client';

import PageWithNavbar from '@/components/layout/page';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function Home() {
  function connectWallet() {
    toast.warning('Setup ConnectKit to enable wallet connection');
  }

  return (
    <PageWithNavbar>
      <div className="page">
        <div className="container md:pt-4 lg:pt-12 xl:pt-20">
          <h1 className="mb-4 text-6xl">EtherStart</h1>
          <div className="py-8 w-full flex flex-col items-center gap-y-4">
            <Button onClick={connectWallet}>Connect Wallet</Button>
          </div>
        </div>
      </div>
    </PageWithNavbar>
  );
}

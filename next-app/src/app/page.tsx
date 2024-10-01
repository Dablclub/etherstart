'use client';

import PageWithNavbar from '@/components/layout/page';
import { ConnectKitButton } from 'connectkit';

export default function Home() {
  return (
    <PageWithNavbar>
      <div className="page">
        <div className="container md:pt-4 lg:pt-12 xl:pt-20">
          <h1 className="mb-4 text-6xl">EtherStart</h1>
          <div className="py-8">
            <ConnectKitButton />
          </div>
        </div>
      </div>
    </PageWithNavbar>
  );
}

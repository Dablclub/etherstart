'use client';

import { useAccount, useBalance, useEnsAvatar, useEnsName } from 'wagmi';
import { useEffect, useState } from 'react';
import { mainnet } from 'viem/chains';
import Image from 'next/image';
import SendEthModal from './sendEthModal';
import SendErc20Modal from './sendErc20Modal';
import SwapErc20Modal from './swapErc20Modal';
import SwitchNetworkModal from './switchNetworkModal';

export function Account() {
  const [isMounted, setIsMounted] = useState(false);

  const { address, chain, chainId, isConnected } = useAccount();

  const accountBalance = useBalance({
    address,
  });

  const { data: ensName } = useEnsName({
    address,
    chainId: mainnet.id,
  });
  const { data: ensAvatar } = useEnsAvatar({
    name: ensName!,
    chainId: mainnet.id,
  });

  useEffect(() => {
    if (!isMounted) {
      setIsMounted(true);
    }
  }, [isMounted]);

  if (!isMounted) {
    return (
      <div>
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div>
        <p className="text-lg">Not connected</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center text-center gap-y-4">
      {ensAvatar && ensName && isMounted && (
        <div className="flex items-center gap-x-2">
          <Image
            alt="ENS Avatar"
            src={ensAvatar}
            className="h-16 w-16 rounded-full"
            height={64}
            width={64}
          />
          {ensName && <p className="text-2xl">{ensName}</p>}
        </div>
      )}
      {address && isMounted && (
        <div className="flex flex-col items-center gap-y-2">
          <p className="text-lg">Connected wallet address:</p>
          <p className="text-lg">{address}</p>
        </div>
      )}
      <div className="flex flex-col gap-y-2">
        {accountBalance.data?.value && isMounted && (
          <p className="text-xl">Balance: {accountBalance.data?.value} ETH</p>
        )}
        {chain && chainId && isMounted && (
          <>
            <p className="text-lg">Chain: {chain.name}</p>
            <p className="text-lg">Chain Id: {chainId}</p>
          </>
        )}
      </div>
      <div className="flex justify-center gap-x-3 px-4">
        <div className="w-1/3">
          <SendEthModal />
        </div>
        <div className="w-1/3">
          <SendErc20Modal userAddress={address} />
        </div>
        <div className="w-1/3">
          {chainId === 137 ? (
            <SwapErc20Modal userAddress={address} />
          ) : (
            <SwitchNetworkModal />
          )}
        </div>
      </div>
    </div>
  );
}

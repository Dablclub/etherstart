import { SIWEConfig } from 'connectkit';
import { SiweMessage } from 'siwe';

const siweConfig = {
  getNonce: async () => {
    const res = await fetch(`/api/siwe`, { method: 'PUT' });
    if (!res.ok) throw new Error('Failed to fetch SIWE nonce');

    return res.text();
  },
  createMessage: ({
    nonce,
    address,
    chainId,
  }: {
    nonce: string;
    address: string;
    chainId: number;
  }) => {
    return new SiweMessage({
      nonce,
      chainId,
      address,
      version: '1',
      uri: window.location.origin,
      domain: window.location.host,
      statement: 'Hey dabler, sign-in to our cool app!!!',
    }).prepareMessage();
  },
  verifyMessage: ({
    message,
    signature,
  }: {
    message: string;
    signature: string;
  }) => {
    return fetch(`/api/siwe`, {
      method: 'POST',
      body: JSON.stringify({ message, signature }),
      headers: { 'Content-Type': 'application/json' },
    }).then((res) => res.ok);
  },
  getSession: async () => {
    const res = await fetch(`/api/siwe`);
    if (!res.ok) throw new Error('Failed to fetch SIWE session');

    const { address, chainId } = await res.json();
    return address && chainId ? { address, chainId } : null;
  },
  signOut: () => fetch(`/api/siwe`, { method: 'DELETE' }).then((res) => res.ok),
} satisfies SIWEConfig;

export default siweConfig;

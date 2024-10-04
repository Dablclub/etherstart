# Lesson: Sign-In with Ethereum using ConnectKit (Custom Implementation)

## Introduction

In this lesson, we’ll walk through a custom **Sign-In with Ethereum (SIWE)** implementation using **ConnectKit**. This guide is based on our code and follows the structure outlined in ConnectKit's documentation for integrating custom authentication backends.

**ConnectKit** makes it easy to integrate wallet authentication with Ethereum dApps, and in this lesson, we'll show how to handle **nonce generation**, **message creation**, **signature verification**, **session management**, and **sign out** operations.

---

### Context

A **Sign-In with Ethereum (SIWE)** flow generally consists of two parts: the **client-side** and the **server-side**.

- The **client-side** is responsible for authenticating the user with a signed message.
- The **server-side** is responsible for verifying the signed message and storing the user's authentication state.

Here’s what a typical **SIWE flow** looks like:

1. **User connects their wallet** to a client-side app.
2. The **client-side app prompts the user to sign a SIWE message** generated using a nonce retrieved from the backend.
3. The **user signs the message** and sends both the signed message and the signature back to the backend for verification. This proves that the user controls the connected wallet address.
4. Upon successful verification, the backend **establishes a session** via our choice of session storage (cookie, JWT, or similar).

---

## Step 1: SIWE Configuration Overview

The first step is setting up a custom configuration for **SIWE** using ConnectKit’s `SIWEConfig`. Here’s how our `siweConfig` is structured to handle various aspects of SIWE authentication, including nonce generation, message preparation, verification, session handling, and sign-out functionality.

```
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
  verifyMessage: async ({
    message,
    signature,
  }: {
    message: string;
    signature: string;
  }) => {
    return fetch(`/api/siwe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, signature }),
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
```

### Explanation of `siweConfig`:

1. **getNonce**: This function fetches a nonce from our backend. The nonce is required to generate a unique SIWE message that the user will sign.
2. **createMessage**: This function generates the SIWE message, which includes fields like `nonce`, `address`, `chainId`, `uri`, `domain`, and a `statement` for the user to sign.
3. **verifyMessage**: This function verifies the signed message by sending it to our backend for validation. The backend compares the message and signature to ensure the user’s authenticity.
4. **getSession**: This function fetches the current SIWE session from our backend to retrieve the user’s authenticated session data (i.e., address and chain ID).
5. **signOut**: This function invalidates the session by sending a request to sign out.

---

## Step 2: Understanding the Key Components

### 2.1 Nonce Generation (`getNonce`)

The `getNonce` function sends a `PUT` request to our `/api/siwe` endpoint, which generates a unique nonce for each user’s login attempt. This nonce is critical to prevent replay attacks and ensures that each login attempt is unique.

```
getNonce: async () => {
  const res = await fetch(`/api/siwe`, { method: 'PUT' });
  if (!res.ok) throw new Error('Failed to fetch SIWE nonce');

  return res.text();  // Returns the nonce as plain text
}
```

This nonce is then passed to the **createMessage** function to be included in the SIWE message.

---

### 2.2 Creating the SIWE Message (`createMessage`)

Once you have the nonce, the `createMessage` function constructs the **SIWE message** that the user will sign. This message contains the essential data required for authentication, including the user's Ethereum address, chain ID, and nonce.

```
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
    statement: 'Hey dabler, sign-in to our cool app!!!',  // Customize the message to suit your dApp
  }).prepareMessage();
}
```

Key points:

- **nonce**: Unique string to prevent replay attacks.
- **address**: The user’s Ethereum address, obtained from their wallet.
- **chainId**: The chain ID to verify which blockchain network is being used.
- **statement**: A customizable message to personalize the user experience.

---

### 2.3 Verifying the Message (`verifyMessage`)

After the user signs the message, it’s sent to the backend to verify the authenticity of the signature. This is handled by the `verifyMessage` function.

```
verifyMessage: async ({
  message,
  signature,
}: {
  message: string;
  signature: string;
}) => {
  return fetch(`/api/siwe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, signature }),
  }).then((res) => res.ok);
}
```

The signed message and signature are sent as a `POST` request to the backend, where the backend will validate the signature against the message. If the signature is valid, the user is successfully authenticated.

---

### 2.4 Managing the Session (`getSession`)

To maintain user authentication, the `getSession` function checks whether there’s an active session by fetching session data from the backend.

```
getSession: async () => {
  const res = await fetch(`/api/siwe`);
  if (!res.ok) throw new Error('Failed to fetch SIWE session');

  const { address, chainId } = await res.json();
  return address && chainId ? { address, chainId } : null;
}
```

If the session is valid, it returns the user’s Ethereum address and chain ID. Otherwise, it returns `null`, indicating that the user is not authenticated.

---

### 2.5 Signing Out (`signOut`)

To sign the user out, the `signOut` function sends a `DELETE` request to invalidate the session.

```
signOut: () => fetch(`/api/siwe`, { method: 'DELETE' }).then((res) => res.ok)
```

This logs the user out by clearing their session from the backend.

---

## 3. Updating the Web3Provider component

Finally, we need to add the SIWEProvider component, passing along with it our siweConfig.

In our `/src/providers/web3Provider.tsx` file, update the component. Make sure to add the imports `SIWEProvider` from `connectkit` and our created `siweConfig`.

```
// previous imports
import { ConnectKitProvider, getDefaultConfig, SIWEProvider } from 'connectkit';
import siweConfig from '@/config/siweConfig';

// other code...

export function Web3Provider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <SIWEProvider {...siweConfig}>
          <ConnectKitProvider>{children}</ConnectKitProvider>
        </SIWEProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
```

## Next: Backend Requirements

The custom SIWE implementation assumes that you have set up API routes on our backend to handle the following:

1. **Nonce Generation** (`/api/siwe` with `PUT` method): Generates a nonce.
2. **Signature Verification** (`/api/siwe` with `POST` method): Validates the signature and message.
3. **Session Management** (`/api/siwe` with `GET` method): Checks the session and retrieves user information.
4. **Sign Out** (`/api/siwe` with `DELETE` method): Terminates the session.

Our backend will need to implement these routes to fully support the SIWE authentication flow.

---

## Conclusion

This lesson walked through the core components of **Sign-In with Ethereum** (SIWE) using **ConnectKit**. By using `siweConfig`, we can easily manage:

- Nonce generation
- Message creation and signing
- Signature verification
- Session management
- User sign-out

By leveraging the **ERC-4361** standard and **ConnectKit**, we provide our users with a secure, decentralized authentication experience in our dApp.

### Next Steps:

We need to ensure that our backend is set up to handle the API routes for nonce generation, signature verification, and session management.

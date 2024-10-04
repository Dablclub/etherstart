# Lesson: Message Signing and Verification with Wagmi (Frontend Only)

### Recap

- Onchain authentication leverages blockchain technology to authenticate users using their Ethereum wallets.
- Cryptographic signatures and signed messages allow users to prove ownership of their Ethereum address without revealing private keys.
- "Sign in with Ethereum" provides a secure, decentralized, and privacy-friendly method for user authentication in decentralized applications.

---

## Introduction

In this lesson, we'll explore how to implement **Sign-In with Ethereum** (SIWE) using the **ERC-4361** standard, as well as how to handle **message signing** and **signature verification** entirely on the frontend using **wagmi** with **viem**.

We'll also cover why **Sign-In with Ethereum** is considered a game-changer for decentralized authentication, based on key points from SpruceID's articles and insights into the impact of SIWE on the Web3 ecosystem.

---

## What is Sign-In with Ethereum (SIWE)?

**Sign-In with Ethereum (SIWE)** allows users to authenticate themselves to decentralized applications (dApps) by signing a message using their Ethereum wallet. This eliminates the need for traditional usernames and passwords, providing a secure, decentralized way to prove ownership of an Ethereum account.

## Technical Overview of ERC-4361: Sign-In with Ethereum

**ERC-4361** defines the standard for signing a message to authenticate an Ethereum wallet. The goal of this standard is to ensure a unified structure for the message being signed. This structure prevents issues such as replay attacks and enables a clear, transparent process for users.

The key elements of an ERC-4361 message include:

- **Domain**: The domain of the dApp requesting authentication (e.g., `app.example.com`).
- **Ethereum Address**: The wallet address of the user signing the message.
- **URI**: The URI of the dApp requesting the sign-in.
- **Nonce**: A random string to prevent replay attacks.
- **Issued At**: The timestamp when the message was created.
- **Statement**: A human-readable message indicating what the user is agreeing to.

### Example of a Sign-In with Ethereum Message:

```text
app.example.com wants you to sign in with your Ethereum account:
0x1234...abcd

Sign in to access your account.

URI: https://app.example.com
Version: 1
Nonce: abc123
Issued At: 2024-10-01T12:00:00Z
```

This message structure ensures that both the user and the dApp are protected from various security risks, such as replay attacks or fraudulent activities.

---

## Implementing Sign-In with Ethereum Using Wagmi

**Wagmi** is a React library that provides hooks to make working with Ethereum easier. We’ll use it to sign and verify messages on the frontend.

### Step 1: Setting Up Wagmi Hooks for Message Signing

To sign a message, we use the `useSignMessage` hook from **wagmi**. This hook allows users to sign a message using their Ethereum wallet (e.g., MetaMask).

#### 1.1 Signing a Message with `useSignMessage`

```
import { useSignMessage } from 'wagmi';

function SignMessageComponent() {
  const { signMessageAsync } = useSignMessage();

  const handleSignMessage = async () => {
    try {
      const message = "Sign in to confirm your identity";
      const signature = await signMessageAsync({ message });
      console.log("Signature:", signature);
      // You can now verify the signature
    } catch (error) {
      console.error("Message signing failed:", error);
    }
  };

  return (
    <button onClick={handleSignMessage}>
      Sign Message
    </button>
  );
}
```

Explanation:

- **message**: This is the message the user will sign. For authentication purposes, ensure the message is unique (e.g., includes a nonce).
- **signMessageAsync()**: This function prompts the user to sign the message and returns the cryptographic signature.

---

### Step 2: Verifying the Signature with `useVerifyMessage`

Once the message is signed, we can use the `useVerifyMessage` hook from **wagmi** to verify the signature and ensure it matches the expected Ethereum address.

#### 2.1 Verifying the Signature

```
import { useVerifyMessage } from 'wagmi';

function VerifySignatureComponent({ message, signature, expectedAddress }) {
  const { verifyMessageAsync } = useVerifyMessage();

  const handleVerifySignature = async () => {
    try {
      const isValid = await verifyMessageAsync({
        address: expectedAddress,
        message,
        signature,
      });

      if (isValid) {
        console.log("Signature is valid and matches the expected address.");
      } else {
        console.log("Signature verification failed.");
      }
    } catch (error) {
      console.error("Signature verification failed:", error);
    }
  };

  return (
    <button onClick={handleVerifySignature}>
      Verify Signature
    </button>
  );
}
```

Explanation:

- **address**: The Ethereum address that is expected to have signed the message.
- **message**: The original message that was signed.
- **signature**: The cryptographic signature returned by `signMessageAsync()`.
- **verifyMessageAsync()**: This function verifies the message and checks if the provided signature matches the expected address.

---

## Connecting Signing and Verification

Here’s how to connect the message signing and verification processes in a single component, using both `useSignMessage` and `useVerifyMessage` hooks.

#### Sign and Verify Flow

```
import { useSignMessage, useVerifyMessage } from 'wagmi';
import { useState } from 'react';

function SignAndVerifyComponent({ expectedAddress }) {
  const [message] = useState("Sign in to confirm your identity");
  const [signature, setSignature] = useState(null);

  const { signMessageAsync } = useSignMessage();
  const { verifyMessageAsync } = useVerifyMessage();

  const handleSignMessage = async () => {
    try {
      const signedMessage = await signMessageAsync({ message });
      setSignature(signedMessage);
      console.log("Message signed:", signedMessage);
    } catch (error) {
      console.error("Message signing failed:", error);
    }
  };

  const handleVerifySignature = async () => {
    try {
      if (signature) {
        const isValid = await verifyMessageAsync({
          address: expectedAddress,
          message,
          signature,
        });

        if (isValid) {
          console.log("Signature verified successfully!");
        } else {
          console.log("Signature verification failed.");
        }
      }
    } catch (error) {
      console.error("Signature verification failed:", error);
    }
  };

  return (
    <>
      <button onClick={handleSignMessage}>
        Sign Message
      </button>
      <button onClick={handleVerifySignature} disabled={!signature}>
        Verify Signature
      </button>
    </>
  );
}
```

---

## Conclusion

**Sign-In with Ethereum (SIWE)**, based on **ERC-4361**, allows users to authenticate to dApps using their Ethereum wallets, providing a decentralized, secure, and privacy-preserving alternative to traditional login methods.

By using **wagmi** for message signing and verification:

- **Signing Messages**: The `useSignMessage` hook enables users to sign a message with their Ethereum wallet.
- **Verifying Signatures**: The `useVerifyMessage` hook ensures the signature matches the original message and the expected Ethereum address.

This setup enables users to securely sign messages and authenticate themselves within dApps without relying on centralized services. SIWE enhances user experience in Web3 while maintaining the core principles of decentralization and privacy.

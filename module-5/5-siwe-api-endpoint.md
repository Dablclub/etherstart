# Lesson: Creating Sign-In with Ethereum API Backend Routes

## Introduction

In this lesson, we'll walk through how to implement the backend for **Sign-In with Ethereum (SIWE)** using **Next.js** API routes. We'll build on the previous ConnectKit lesson and use sessions to maintain user authentication.

This backend will handle four key actions:

- **GET**: Retrieve the current session.
- **PUT**: Generate a nonce for the SIWE message.
- **POST**: Verify the signed SIWE message and establish a session.
- **DELETE**: Clear the session and sign the user out.

We’ll also cover the session system that ensures the user's authentication status is maintained securely over time.

---

## Key Components of the API

### 1. Handling Sessions with `iron-session`

As explained in the previous session primer, **sessions** allow your web app to keep track of a user’s information across different requests without asking for details repeatedly. In this implementation, we use **iron-session** to securely seal and unseal session data.

The session stores:

- **nonce**: A random value used to secure the SIWE flow.
- **address**: The user's Ethereum wallet address.
- **chainId**: The blockchain network the user is connected to (e.g., Ethereum mainnet).

---

## Step 1: Backend Route for Session Management and SIWE Authentication

Here is the backend code for handling SIWE authentication with **Next.js** API routes:

```
import Session from '@/lib/session';
import { NextRequest, NextResponse } from 'next/server';
import { SiweErrorType, SiweMessage, generateNonce } from 'siwe';

export const tap = async <T>(
  value: T,
  cb: (value: T) => Promise<unknown>
): Promise<T> => {
  await cb(value);
  return value;
};
```

### Helper Function: `tap`

The `tap` function is a utility that runs a callback on a value and returns the original value. This is useful for side-effects, like persisting session data.

```
export const GET = async (req: NextRequest): Promise<NextResponse> => {
  const session = await Session.fromRequest(req);

  return NextResponse.json(session.toJSON());
};
```

### 1. **GET** Request: Retrieving the Session

This route handles the **GET** request to retrieve the current session. If the user has a valid session, it returns their session data (including wallet address and chainId). If no session is found, it returns an empty session.

```
export const PUT = async (req: NextRequest): Promise<NextResponse> => {
  const session = await Session.fromRequest(req);
  if (!session?.nonce) session.nonce = generateNonce();

  return tap(new NextResponse(session.nonce), (res) => session.persist(res));
};
```

### 2. **PUT** Request: Generating a Nonce

The **PUT** request generates a unique **nonce** (random number) used to secure the SIWE flow. The nonce is then persisted in the session to prevent replay attacks. This nonce is sent to the frontend, where it will be included in the SIWE message to be signed by the user.

```
export const POST = async (req: NextRequest) => {
  const { message, signature } = await req.json();
  const session = await Session.fromRequest(req);

  try {
    const siweMessage = new SiweMessage(message);
    const { data: fields } = await siweMessage.verify({
      signature,
      nonce: session.nonce,
    });

    if (fields.nonce !== session.nonce) {
      return tap(
        new NextResponse('Invalid nonce.', { status: 422 }),
        (res: NextResponse) => session.clear(res)
      );
    }

    session.address = fields.address;
    session.chainId = fields.chainId;
  } catch (error) {
    switch (error) {
      case SiweErrorType.INVALID_NONCE:
      case SiweErrorType.INVALID_SIGNATURE:
        return tap(
          new NextResponse(String(error), { status: 422 }),
          (res: NextResponse) => session.clear(res)
        );

      default:
        return tap(
          new NextResponse(String(error), { status: 400 }),
          (res: NextResponse) => session.clear(res)
        );
    }
  }

  return tap(new NextResponse(''), (res: NextResponse) => session.persist(res));
};
```

### 3. **POST** Request: Verifying the Signed Message

This route handles the **POST** request, where the signed SIWE message and its signature are sent for verification:

1. The server receives the SIWE message and signature from the user.
2. It creates a new **SiweMessage** object to verify the message and signature against the stored nonce.
3. If the message and signature are valid, the server sets the user's wallet address and chain ID in the session.
4. If verification fails, the session is cleared, and the appropriate error is returned (invalid nonce, signature, etc.).

```
export const DELETE = async (req: NextRequest) => {
  const session = await Session.fromRequest(req);

  return tap(new NextResponse(''), (res: NextResponse) => session.clear(res));
};
```

### 4. **DELETE** Request: Clearing the Session

The **DELETE** request is responsible for clearing the session and signing the user out. When this endpoint is called, it removes the user’s session data, effectively logging them out.

---

## Step 2: Session Management Recap

### Session Overview

The session system is managed using the `Session` class, which we created in the previous lesson. It stores and retrieves data from the session cookie. Here’s how it works:

```
import { sealData, unsealData } from 'iron-session';
import { NextRequest, NextResponse } from 'next/server';

const SESSION_OPTIONS = {
  ttl: 60 * 60 * 24 * 30, // 30 days
  password: process.env.SESSION_SECRET!,
};

const COOKIE_NAME = 'dabl-dev-camp-cookie';

export type ISession = {
  nonce?: string;
  chainId?: number;
  address?: string;
};

class Session {
  nonce?: string;
  chainId?: number;
  address?: string;

  constructor(session?: ISession) {
    this.nonce = session?.nonce;
    this.chainId = session?.chainId;
    this.address = session?.address;
  }

  static async fromRequest(req: NextRequest): Promise<Session> {
    const sessionCookie = req.cookies.get(COOKIE_NAME)?.value;

    if (!sessionCookie) return new Session();
    return new Session(
      await unsealData<ISession>(sessionCookie, SESSION_OPTIONS)
    );
  }

  clear(res: NextResponse): Promise<void> {
    this.nonce = undefined;
    this.chainId = undefined;
    this.address = undefined;

    return this.persist(res);
  }

  toJSON(): ISession {
    return { nonce: this.nonce, address: this.address, chainId: this.chainId };
  }

  async persist(res: NextResponse): Promise<void> {
    res.cookies.set(
      COOKIE_NAME,
      await sealData(this.toJSON(), SESSION_OPTIONS),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
      }
    );
  }
}

export default Session;
```

### Session Flow

1. **Creating a New Session**: When a user connects for the first time, a new session is created and the nonce is stored.
2. **Retrieving a Session**: Each request checks the cookie for an existing session using the `Session.fromRequest()` method.
3. **Clearing a Session**: When the user signs out, the session is cleared using the `clear()` method.
4. **Persisting the Session**: Session data (nonce, wallet address, chainId) is sealed (encrypted) and stored as a cookie. The `persist()` method saves the session with an expiration of 30 days.

---

## Conclusion

In this lesson, we built a backend route for **Sign-In with Ethereum** (SIWE) using **Next.js** and **iron-session**. We covered:

- **GET**: Retrieving the session data.
- **PUT**: Generating and returning a nonce for signing.
- **POST**: Verifying the SIWE message and updating the session with wallet data.
- **DELETE**: Clearing the session to log the user out.

By using **sessions** to manage authentication, we ensure that users remain securely logged in without needing to sign in repeatedly.

### Next Steps:

- Integrate these API routes with the frontend to complete the SIWE flow.
- Test the session persistence and ensure the sign-in and sign-out mechanisms work as expected.

# Introduction to Sessions for SIWE

Imagine you walk into a store, and the salesperson remembers who you are every time you visit. They know what you like and what you've already purchased, so you don't have to explain yourself over and over. **Sessions** in web apps work similarly.

When users interact with a website, sessions allow the website to "remember" important things about them, like their login status or preferences, while they move between different pages. Instead of asking the user for their information every time, the session stores that data temporarily. Sessions are particularly helpful for things like authentication, keeping users logged in, and tracking user activity while they're on the website.

## Why Are Sessions Important?

Sessions make your web app **smarter**. By keeping important info (like who you are) stored for a while, the app doesn't need to ask you to log in or provide details every time you visit a new page. Using **cookies** to store session data ensures that the data is securely passed back and forth between your computer and the website.

For example:

- **Authentication**: Sessions help the app remember that you're logged in.
- **Preferences**: They store settings, like whether you prefer dark mode.
- **Shopping Carts**: Sessions keep your items in the cart while you browse the store.

In this code, the session stores information about the user's Ethereum wallet, helping the app know who the user is and what network they're on, even if they refresh the page or visit later.

---

## Defining our Session class

```
import { sealData, unsealData } from 'iron-session';
import { NextRequest, NextResponse } from 'next/server';

if (!process.env.SESSION_SECRET) {
  throw new Error('SESSION_SECRET cannot be empty.');
}

if (!process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID) {
  throw new Error('NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID cannot be empty.');
}

const SESSION_OPTIONS = {
  ttl: 60 * 60 * 24 * 30, // 30 days
  password: process.env.SESSION_SECRET!,
};

const COOKIE_NAME = 'ethereum-quickstart-camp-cookie';

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

Now, let's break down the code!

### Key Pieces of the Code

Cookies and Secrets

- The code first checks if there is a secret password for the session (`SESSION_SECRET`) and a project ID for WalletConnect. If these aren't available, it throws an error because the website needs these to securely store and retrieve your session info.

Session Options

- The `SESSION_OPTIONS` define how the session works. It uses a secret password to lock (seal) the session information so no one can change it. It also decides how long the session lasts: 30 days.

```
const SESSION_OPTIONS = { ttl: 60 * 60 * 24 * 30, // 30 days password: process.env.SESSION_SECRET!, };
```

Cookie Name

- The website uses a cookie with the name 'ethereum-quickstart-camp-cookie'. This is like naming a special box where the user’s information is kept.

```
const COOKIE_NAME = 'dabl-dev-camp-cookie';
```

Session Data

- The session is where we store important information about you, like:
  - nonce: a random number to help secure the session.
  - chainId: the network you're using (like Ethereum).
  - address: your Ethereum wallet address.
- The session is saved as a class called Session, which means it can store this info and perform actions like saving it or clearing it when needed.

---

## How Sessions Work in This Code

Here’s how the session system works in the code example using **iron-session** and **Next.js**:

### 1. **Storing Session Data**

The session stores three key pieces of information:

- **nonce**: A random number that helps secure the session.
- **chainId**: The network the user is connected to (like Ethereum).
- **address**: The user’s Ethereum wallet address.

The session data is saved in a **cookie** and is secured with a **secret password**.

### 2. **Getting and Storing the Session**

When a user connects to the website:

- The app looks for the session cookie.
- If the cookie exists, it uses the **iron-session** library to unlock the session (using the secret password) and retrieve the data.
- If the cookie doesn’t exist, the app creates a new session with empty data.

### 3. **Keeping the Session Safe**

The session information is "sealed" (locked) with the **SESSION_SECRET** password so that no one can change it. The cookie is also set to be:

- **httpOnly**: JavaScript in the browser can’t access it, keeping it safe.
- **secure**: The cookie is only sent over secure (HTTPS) connections.

### 4. **Clearing the Session**

If the user signs out, the session is cleared by removing the stored wallet address and chain information, and the cookie is updated to reflect this.

---

With sessions, the web app can keep track of who the user is across multiple pages, even after they close and reopen the browser, thanks to the stored cookie that lasts for up to **30 days**.

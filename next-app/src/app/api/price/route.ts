import Session from '@/lib/session';
import { type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const session = await Session.fromRequest(request);
  console.log(session);
  if (session.address) {
    try {
      const res = await fetch(
        `https://api.0x.org/swap/permit2/price?${searchParams}`,
        {
          headers: {
            '0x-api-key': process.env.NEXT_PUBLIC_ZEROEX_API_KEY as string,
            '0x-version': 'v2',
          },
        }
      );
      const data = await res.json();

      console.log(
        'price api',
        `https://api.0x.org/swap/permit2/price?${searchParams}`
      );

      console.log('price data', data);

      return Response.json(data);
    } catch (error) {
      console.log(error);
      return Response.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  } else {
    return Response.json({ error: 'Not authenticated' }, { status: 401 });
  }
}

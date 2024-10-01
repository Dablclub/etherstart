import { useEffect, useState } from 'react';
import Image from 'next/image';

import { PriceResponse } from '../../types/index';
import {
  useBalance,
  useChainId,
  useReadContract,
  useSimulateContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi';
import { Address, erc20Abi, formatUnits, parseUnits } from 'viem';
import qs from 'qs';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  AFFILIATE_FEE,
  FEE_RECIPIENT,
  MAX_ALLOWANCE,
  POLYGON_TOKENS,
  POLYGON_TOKENS_BY_SYMBOL,
  Token,
} from '@/lib/constants';
import { toast } from 'sonner';

type SendErc20ModalProps = {
  userAddress: `0x${string}` | undefined;
};

export default function SwapErc20Modal({ userAddress }: SendErc20ModalProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [sellToken, setSellToken] = useState('wmatic');
  const [sellAmount, setSellAmount] = useState('');
  const [buyToken, setBuyToken] = useState('usdc');
  const [buyAmount, setBuyAmount] = useState('');
  const [price, setPrice] = useState<PriceResponse | undefined>();
  const [finalize, setFinalize] = useState(false);
  const [tradeDirection, setSwapDirection] = useState('sell');
  const [error, setError] = useState([]);
  const [buyTokenTax, setBuyTokenTax] = useState({
    buyTaxBps: '0',
    sellTaxBps: '0',
  });
  const [sellTokenTax, setSellTokenTax] = useState({
    buyTaxBps: '0',
    sellTaxBps: '0',
  });

  const chainId = useChainId() || 137;

  const tokensByChain = (chainId: number) => {
    if (chainId === 137) {
      return POLYGON_TOKENS_BY_SYMBOL;
    }
    return POLYGON_TOKENS_BY_SYMBOL;
  };

  const sellTokenObject = tokensByChain(chainId)[sellToken];
  const buyTokenObject = tokensByChain(chainId)[buyToken];

  const sellTokenDecimals = sellTokenObject.decimals;
  const buyTokenDecimals = buyTokenObject.decimals;

  const parsedSellAmount =
    sellAmount && tradeDirection === 'sell'
      ? parseUnits(sellAmount, sellTokenDecimals).toString()
      : undefined;

  const parsedBuyAmount =
    buyAmount && tradeDirection === 'buy'
      ? parseUnits(buyAmount, buyTokenDecimals).toString()
      : undefined;

  const handleSellTokenChange = (value: string) => {
    setSellToken(value);
  };

  function handleBuyTokenChange(value: string) {
    setBuyToken(value);
  }

  function handleSwap() {
    event?.preventDefault();
    toast.warning('connect swap functionality');
  }

  useEffect(() => {
    if (!isMounted) {
      setIsMounted(true);
    }
  }, [isMounted]);

  useEffect(() => {
    const params = {
      chainId: '137',
      sellToken: sellTokenObject.address,
      buyToken: buyTokenObject.address,
      sellAmount: parsedSellAmount,
      buyAmount: parsedBuyAmount,
      taker: userAddress,
      swapFeeRecipient: FEE_RECIPIENT,
      swapFeeBps: AFFILIATE_FEE,
      swapFeeToken: buyTokenObject.address,
      tradeSurplusRecipient: FEE_RECIPIENT,
    };

    async function main() {
      const response = await fetch(`/api/price?${qs.stringify(params)}`);
      const data = await response.json();
      console.log(data);

      if (data?.validationErrors?.length > 0) {
        // error for sellAmount too low
        setError(data.validationErrors);
      } else {
        setError([]);
      }
      if (data.buyAmount) {
        setBuyAmount(formatUnits(data.buyAmount, buyTokenObject.decimals));
        setPrice(data);
      }
      // Set token tax information
      if (data?.tokenMetadata) {
        setBuyTokenTax(data.tokenMetadata.buyToken);
        setSellTokenTax(data.tokenMetadata.sellToken);
      }
    }

    if (sellAmount !== '') {
      main();
    }
  }, [
    sellTokenObject.address,
    buyTokenObject.address,
    parsedSellAmount,
    parsedBuyAmount,
    chainId,
    sellToken,
    sellAmount,
    setPrice,
    userAddress,
    FEE_RECIPIENT,
    AFFILIATE_FEE,
  ]);

  // Hook for fetching balance information for specified token for a specific taker address
  const { data, isError, isLoading } = useBalance({
    address: userAddress,
    token: sellTokenObject.address,
  });

  const inSufficientBalance =
    data && sellAmount
      ? parseUnits(sellAmount, sellTokenDecimals) > data.value
      : true;

  // Helper function to format tax basis points to percentage
  const formatTax = (taxBps: string) => (parseFloat(taxBps) / 100).toFixed(2);

  return (
    <Dialog>
      <DialogTrigger asChild className="w-full">
        <Button>Swap ERC20</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center">Swap ERC20</DialogTitle>
          <DialogDescription>
            The amount entered will be swapped for the amount of tokens
            displayed in the second row
          </DialogDescription>
        </DialogHeader>
        {isMounted ? (
          <div className="w-full">
            <form
              className="flex flex-col w-full gap-y-8"
              onSubmit={handleSwap}
            >
              <div className="w-full flex flex-col gap-y-4">
                <div className="w-full flex items-center gap-1.5">
                  <Image
                    alt={buyToken}
                    className="h-9 w-9 mr-2 rounded-md"
                    src={POLYGON_TOKENS_BY_SYMBOL[sellToken].logoURI}
                    width={6}
                    height={6}
                  />
                  <Select
                    onValueChange={handleSellTokenChange}
                    defaultValue="wmatic"
                  >
                    <SelectTrigger className="w-1/4">
                      <SelectValue placeholder="Theme" />
                    </SelectTrigger>
                    <SelectContent>
                      {POLYGON_TOKENS.map((token: Token) => {
                        return (
                          <SelectItem
                            key={token.address}
                            value={token.symbol.toLowerCase()}
                          >
                            {token.symbol}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <Input
                    className="w-3/4"
                    type="number"
                    name="sell-amount"
                    id="sell-amount"
                    placeholder="Enter amount..."
                    required
                    onChange={(event) => {
                      setSwapDirection('sell');
                      setSellAmount(event.target.value);
                    }}
                  />
                </div>
                <div className="w-full flex items-center gap-1.5">
                  <Image
                    alt={buyToken}
                    className="h-9 w-9 mr-2 rounded-md"
                    src={POLYGON_TOKENS_BY_SYMBOL[buyToken].logoURI}
                    width={6}
                    height={6}
                  />
                  <Select
                    onValueChange={handleBuyTokenChange}
                    defaultValue="usdc"
                  >
                    <SelectTrigger className="w-1/4">
                      <SelectValue placeholder="Buy..." />
                    </SelectTrigger>
                    <SelectContent>
                      {POLYGON_TOKENS.map((token: Token) => {
                        return (
                          <SelectItem
                            key={token.address}
                            value={token.symbol.toLowerCase()}
                          >
                            {token.symbol}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <Input
                    className="w-3/4"
                    type="number"
                    id="buy-amount"
                    name="buy-amount"
                    value={buyAmount}
                    placeholder="Enter amount..."
                    disabled
                    onChange={(event) => {
                      setSwapDirection('buy');
                      setSellAmount(event.target.value);
                    }}
                  />
                </div>
              </div>
              <ApproveOrReviewButton
                sellTokenAddress={POLYGON_TOKENS_BY_SYMBOL[sellToken].address}
                userAddress={userAddress as `0x${string}`}
                onClick={() => setFinalize(true)}
                disabled={inSufficientBalance}
                price={price}
              />
            </form>
          </div>
        ) : (
          <p>Loading...</p>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ApproveOrReviewButton({
  userAddress,
  onClick,
  sellTokenAddress,
  disabled,
  price,
}: {
  userAddress: Address;
  onClick: () => void;
  sellTokenAddress: Address;
  disabled?: boolean;
  price: any;
}) {
  // If price.issues.allowance is null, show the Review Trade button
  if (price?.issues.allowance === null) {
    return (
      <Button
        disabled={disabled}
        onClick={() => {
          // fetch data, when finished, show quote view
          onClick();
        }}
      >
        {disabled ? 'Insufficient Balance' : 'Review Trade'}
      </Button>
    );
  }

  // Determine the spender from price.issues.allowance
  const spender = price?.issues.allowance.spender;

  // 1. Read from erc20, check approval for the determined spender to spend sellToken
  const { data: allowance, refetch } = useReadContract({
    address: sellTokenAddress,
    abi: erc20Abi,
    functionName: 'allowance',
    args: [userAddress, spender],
  });
  console.log('checked spender approval');

  // 2. (only if no allowance): write to erc20, approve token allowance for the determined spender
  const { data } = useSimulateContract({
    address: sellTokenAddress,
    abi: erc20Abi,
    functionName: 'approve',
    args: [spender, MAX_ALLOWANCE],
  });

  // Define useWriteContract for the 'approve' operation
  const {
    data: writeContractResult,
    writeContractAsync: writeContract,
    error,
  } = useWriteContract();

  // useWaitForTransactionReceipt to wait for the approval transaction to complete
  const { data: approvalReceiptData, isLoading: isApproving } =
    useWaitForTransactionReceipt({
      hash: writeContractResult,
    });

  async function onClickHandler(event: React.MouseEvent<HTMLElement>) {
    event.preventDefault();

    try {
      await writeContract({
        abi: erc20Abi,
        address: sellTokenAddress,
        functionName: 'approve',
        args: [spender, MAX_ALLOWANCE],
      });
      refetch();
    } catch (error) {
      console.error(error);
    }
  }

  // Call `refetch` when the transaction succeeds
  useEffect(() => {
    if (data) {
      refetch();
    }
  }, [data, refetch]);

  if (error) {
    return <div>Something went wrong: {error.message}</div>;
  }

  if (allowance === 0n) {
    return (
      <>
        <Button onClick={onClickHandler}>
          {isApproving ? 'Approving…' : 'Approve'}
        </Button>
      </>
    );
  }

  return (
    <Button
      disabled={disabled}
      onClick={() => {
        // fetch data, when finished, show quote view
        onClick();
      }}
    >
      {disabled ? 'Insufficient Balance' : 'Review Trade'}
    </Button>
  );
}

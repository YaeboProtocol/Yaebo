"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { purchaseFormSchema } from "../../lib/form-schemas";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  AlertTriangle,
  Check,
  CreditCard,
  Loader2,
  MinusCircle,
  PlusCircle,
} from "lucide-react";
import { formatCurrency, processMockInvestment } from "../../lib/utils";
import { Alert, AlertDescription } from "../ui/alert";
import { useRouter } from "next/navigation";
import ConnectWallet from "../connect-wallet";
import * as StellarSdk from "@stellar/stellar-sdk";
import { rpc as StellarRpc } from "@stellar/stellar-sdk";
import {
  isConnected,
  setAllowed,
  getPublicKey,
  signTransaction,
} from "@stellar/freighter-api";
import { useSorobanReact } from "@soroban-react/core";

type FormData = z.infer<typeof purchaseFormSchema>;

interface InvestmentFormProps {
  proposal: {
    id: string;
    title: string;
    lotSize: number;
    lotPrice: number;
    totalLots: number;
    soldLots: number;
    maxPerInvestor: number;
    profitShare: number;
  };
  onInvestmentComplete: (lots: number) => void;
}

export default function InvestmentForm({
  proposal,
  onInvestmentComplete,
}: InvestmentFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const {
    id,
    title,
    lotSize,
    lotPrice,
    totalLots,
    soldLots,
    maxPerInvestor,
    profitShare,
  } = proposal;

  const lotsRemaining = totalLots - soldLots;
  const maxAllowedLots = Math.min(maxPerInvestor, lotsRemaining);

  const form = useForm<FormData>({
    resolver: zodResolver(purchaseFormSchema),
    defaultValues: {
      lots: 1,
    },
  });

  const { address, server } = useSorobanReact();

  const lots = form.watch("lots");
  const totalAmount = lots * lotPrice;
  const estimatedReturn = (totalAmount * profitShare) / 100;

  const increment = () => {
    const current = form.getValues("lots");
    if (current < maxAllowedLots) {
      form.setValue("lots", current + 1);
    }
  };

  const decrement = () => {
    const current = form.getValues("lots");
    if (current > 1) {
      form.setValue("lots", current - 1);
    }
  };

  const onSubmit = async (data: FormData) => {
    if (data.lots > maxAllowedLots) {
      setError(`You can purchase a maximum of ${maxAllowedLots} lots`);
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      // Process mock transaction
      await handleSendPayment(
        "GATIOBGJFQQO33JWUCJCY3TT4UBXPXUQL6Q4GGS6OFYBEPLANS5VDIIS",
        "10"
      );
      const result = await processMockInvestment(id, data.lots, lotPrice);

      if (result.success) {
        setSuccess(true);
        onInvestmentComplete(data.lots);
        // Redirect to portfolio after 2 seconds
        setTimeout(() => {
          router.push("/investor/portfolio");
        }, 2000);
      } else {
        setError("Transaction failed. Please try again.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendPayment = async (destination: string, amount: string) => {
    if (!address || !server) {
      console.error("Wallet not connected");
      return;
    }

    try {
      const sourceAccount = await server.getAccount(address);
      const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: StellarSdk.Networks.TESTNET,
      })
        .addOperation(
          StellarSdk.Operation.payment({
            destination: destination,
            asset: StellarSdk.Asset.native(),
            amount: amount,
          })
        )
        .setTimeout(30)
        .build();

      const signedTransaction = await signTransaction(transaction.toXDR(), {
        networkPassphrase: StellarSdk.Networks.TESTNET,
      });

      //@ts-ignore
      const transactionResult = await server.sendTransaction(
        //@ts-ignore
        StellarSdk.TransactionBuilder.fromXDR(
          signedTransaction,
          StellarSdk.Networks.TESTNET
        )
      );

      console.log("Transaction successful:", transactionResult);
      alert("Payment sent successfully!");
    } catch (error) {
      console.error("Error sending payment:", error);
      alert("Error sending payment. Please check the console for details.");
    }
  };

  if (success) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-green-600 flex items-center gap-2">
            <Check className="h-5 w-5" />
            Investment Successful
          </CardTitle>
          <CardDescription>
            Your investment has been processed successfully
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border rounded-lg p-4 bg-green-50">
              <p className="font-medium">Transaction Details:</p>
              <ul className="mt-2 space-y-2">
                <li className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Project:
                  </span>
                  <span className="font-medium">{title}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Lots Purchased:
                  </span>
                  <span className="font-medium">{lots}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Amount Invested:
                  </span>
                  <span className="font-medium">
                    {formatCurrency(totalAmount)}
                  </span>
                </li>
                <li className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Expected Return:
                  </span>
                  <span className="font-medium text-green-600">
                    +{formatCurrency(estimatedReturn)}
                  </span>
                </li>
              </ul>
            </div>
            <p className="text-center text-sm text-muted-foreground">
              Redirecting to your portfolio...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (lotsRemaining === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Investment Closed</CardTitle>
          <CardDescription>
            This investment opportunity is fully funded
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              All lots have been sold. Please check other investment
              opportunities.
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter>
          <Button
            onClick={() => router.push("/investor/marketplace")}
            className="w-full"
          >
            Browse Marketplace
          </Button>
        </CardFooter>

      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invest in This Opportunity</CardTitle>
        <CardDescription>
          Select the number of lots you want to purchase
        </CardDescription>
      </CardHeader>

      <ConnectWallet />

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {error && (
            <Alert className="bg-red-50 border-red-200 text-red-800">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="lots">Number of Lots</Label>
            <div className="flex items-center space-x-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={decrement}
                disabled={form.watch("lots") <= 1}
              >
                <MinusCircle className="h-4 w-4" />
              </Button>
              <Input
                id="lots"
                type="number"
                className="text-center"
                {...form.register("lots", {
                  valueAsNumber: true,
                  min: 1,
                  max: maxAllowedLots,
                })}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (!isNaN(value) && value >= 1 && value <= maxAllowedLots) {
                    form.setValue("lots", value);
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={increment}
                disabled={form.watch("lots") >= maxAllowedLots}
              >
                <PlusCircle className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Maximum {maxAllowedLots} lots per investor
            </p>
          </div>

          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Lot Price:</span>
              <span>{formatCurrency(lotPrice)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Number of Lots:
              </span>
              <span>{lots}</span>
            </div>
            <div className="flex justify-between font-medium pt-2 border-t">
              <span>Total Investment:</span>
              <span>{formatCurrency(totalAmount)}</span>
            </div>
            <div className="flex justify-between text-green-600">
              <span className="text-sm">Estimated Return:</span>
              <span>+{formatCurrency(estimatedReturn)}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4" />
                Complete Investment
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

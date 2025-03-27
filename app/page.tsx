"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

export default function Home() {
  const [amount, setAmount] = useState("")
  const [recipientAddress, setRecipientAddress] = useState("")
  const [paymentReference, setPaymentReference] = useState("")
  const [loading, setLoading] = useState(false)
  const [txHash, setTxHash] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!amount || !recipientAddress || !paymentReference) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/mint-tokens", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: Number.parseFloat(amount),
          recipientAddress,
          paymentReference,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to mint tokens")
      }

      setTxHash(data.txHash)
      toast({
        title: "Success",
        description: "Tokens minted successfully!",
      })
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to mint tokens",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Token Minting</CardTitle>
          <CardDescription>Mint tokens after fiat payment confirmation</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (IDR)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="100000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Tokens will be minted 1:1 with IDR</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="recipient">Recipient Wallet Address</Label>
              <Input
                id="recipient"
                placeholder="0x..."
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reference">Payment Reference</Label>
              <Input
                id="reference"
                placeholder="Bank transfer reference"
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Reference ID from your bank payment</p>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-stretch gap-4">
          <Button onClick={handleSubmit} disabled={loading} className="w-full">
            {loading ? "Processing..." : "Mint Tokens"}
          </Button>

          {txHash && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm font-medium text-green-800">Transaction Successful!</p>
              <p className="text-xs text-green-700 mt-1 break-all">Transaction Hash: {txHash}</p>
              <a
                href={`https://blockchain-explorer.glideprotocol.xyz/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline mt-2 inline-block"
              >
                View on Explorer
              </a>
            </div>
          )}
        </CardFooter>
      </Card>
      <Toaster />
    </main>
  )
}


"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

// Mock transaction data - in a real app, this would come from your API
interface Transaction {
  id: string
  reference: string
  amount: number
  recipient: string
  timestamp: string
  status: "pending" | "completed" | "failed"
  txHash?: string
}

export default function AdminPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock API call - in a real app, you would fetch from your API
    setTimeout(() => {
      setTransactions([
        {
          id: "tx1",
          reference: "BNK123456",
          amount: 100000,
          recipient: "0x1234...5678",
          timestamp: new Date().toISOString(),
          status: "completed",
          txHash: "0xabcd1234...",
        },
        {
          id: "tx2",
          reference: "BNK789012",
          amount: 250000,
          recipient: "0x8765...4321",
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          status: "pending",
        },
        {
          id: "tx3",
          reference: "BNK345678",
          amount: 50000,
          recipient: "0x2468...1357",
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          status: "failed",
        },
      ])
      setLoading(false)
    }, 1000)
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500">Completed</Badge>
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>
      case "failed":
        return <Badge className="bg-red-500">Failed</Badge>
      default:
        return <Badge>Unknown</Badge>
    }
  }

  const handleProcessTransaction = async (id: string) => {
    // In a real app, this would call your API to process the transaction
    setTransactions(
      transactions.map((tx) =>
        tx.id === id
          ? { ...tx, status: "completed", txHash: "0x" + Math.random().toString(16).substring(2, 10) + "..." }
          : tx,
      ),
    )
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Admin Dashboard</CardTitle>
          <CardDescription>Manage token minting transactions</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Amount (IDR)</TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell>{tx.reference}</TableCell>
                    <TableCell>{tx.amount.toLocaleString()}</TableCell>
                    <TableCell className="font-mono">{tx.recipient}</TableCell>
                    <TableCell>{new Date(tx.timestamp).toLocaleTimeString()}</TableCell>
                    <TableCell>{getStatusBadge(tx.status)}</TableCell>
                    <TableCell>
                      {tx.status === "pending" ? (
                        <Button size="sm" onClick={() => handleProcessTransaction(tx.id)}>
                          Process
                        </Button>
                      ) : tx.txHash ? (
                        <a
                          href={`https://blockchain-explorer.glideprotocol.xyz/tx/${tx.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline"
                        >
                          View Transaction
                        </a>
                      ) : null}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
        <CardFooter>
          <p className="text-sm text-muted-foreground">Showing {transactions.length} transactions</p>
        </CardFooter>
      </Card>
    </div>
  )
}


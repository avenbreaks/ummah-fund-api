import { ethers } from "ethers"
import { NextResponse } from "next/server"
import tokenAbi from "@/lib/token-abi"

// Contract address from the user's input
const CONTRACT_ADDRESS = "0xf4201cF507b4806d2a1527053cC78097f3873982"
const RPC_URL = "https://rpc-api.glideprotocol.xyz/l1-rpc"

// This would be securely stored in environment variables in production
// For demo purposes, we're hardcoding it here
const ADMIN_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY || ""

export async function POST(request: Request) {
  try {
    // Validate that we have the private key
    if (!ADMIN_PRIVATE_KEY) {
      return NextResponse.json({ error: "Server configuration error: Missing private key" }, { status: 500 })
    }

    // Parse the request body
    const { amount, recipientAddress, paymentReference } = await request.json()

    // Validate inputs
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    if (!ethers.isAddress(recipientAddress)) {
      return NextResponse.json({ error: "Invalid recipient address" }, { status: 400 })
    }

    if (!paymentReference) {
      return NextResponse.json({ error: "Payment reference is required" }, { status: 400 })
    }

    // In a real application, you would verify the payment here
    // For example, query your database to confirm the payment was received
    // const paymentVerified = await verifyPayment(paymentReference, amount)
    // if (!paymentVerified) {
    //   return NextResponse.json(
    //     { error: 'Payment not verified' },
    //     { status: 400 }
    //   )
    // }

    // Connect to the blockchain
    const provider = new ethers.JsonRpcProvider(RPC_URL)
    const wallet = new ethers.Wallet(ADMIN_PRIVATE_KEY, provider)
    const tokenContract = new ethers.Contract(CONTRACT_ADDRESS, tokenAbi, wallet)

    // Convert amount to token amount (assuming 1:1 ratio)
    // If the token has decimals, we need to adjust the amount
    const decimals = await tokenContract.decimals()
    const tokenAmount = ethers.parseUnits(amount.toString(), decimals)

    // Mint tokens to escrow
    const mintTx = await tokenContract.mintToEscrow(recipientAddress, tokenAmount)
    await mintTx.wait()

    // Release tokens from escrow to the recipient
    const releaseTx = await tokenContract.releaseTokens(recipientAddress)
    const receipt = await releaseTx.wait()

    // Log the transaction for record-keeping
    console.log(`
      Payment Reference: ${paymentReference}
      Amount: ${amount} IDR
      Recipient: ${recipientAddress}
      Transaction Hash: ${receipt.hash}
    `)

    // Return the transaction hash as proof
    return NextResponse.json({
      success: true,
      txHash: receipt.hash,
      amount: amount,
      recipient: recipientAddress,
    })
  } catch (error) {
    console.error("Error minting tokens:", error)

    // Handle specific errors
    if (error instanceof Error) {
      if (error.message.includes("insufficient funds")) {
        return NextResponse.json({ error: "Insufficient funds to execute transaction" }, { status: 400 })
      }

      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ error: "An unknown error occurred" }, { status: 500 })
  }
}


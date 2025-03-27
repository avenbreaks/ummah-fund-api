import { NextResponse } from "next/server"
import { ethers } from "ethers"
import tokenAbi from "@/lib/token-abi"
import { recordTokenMinting } from "@/lib/payment-service"

// Contract address from the user's input
const CONTRACT_ADDRESS = "0xf4201cF507b4806d2a1527053cC78097f3873982"
const RPC_URL = "https://rpc-api.glideprotocol.xyz/l1-rpc"

// This would be securely stored in environment variables in production
const ADMIN_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY || ""

// This webhook would be called by your payment processor when a payment is confirmed
export async function POST(request: Request) {
  try {
    // Verify webhook signature (in a real app)
    // const signature = request.headers.get('x-signature')
    // if (!verifySignature(signature, await request.text())) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    // }

    // Parse the request body
    const { paymentReference, amount, recipientAddress, status } = await request.json()

    // Validate the payment status
    if (status !== "completed") {
      return NextResponse.json({
        message: "Payment not completed, no tokens minted",
      })
    }

    // Validate inputs
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    if (!ethers.isAddress(recipientAddress)) {
      return NextResponse.json({ error: "Invalid recipient address" }, { status: 400 })
    }

    // Connect to the blockchain
    const provider = new ethers.JsonRpcProvider(RPC_URL)
    const wallet = new ethers.Wallet(ADMIN_PRIVATE_KEY, provider)
    const tokenContract = new ethers.Contract(CONTRACT_ADDRESS, tokenAbi, wallet)

    // Convert amount to token amount (assuming 1:1 ratio)
    const decimals = await tokenContract.decimals()
    const tokenAmount = ethers.parseUnits(amount.toString(), decimals)

    // Mint tokens to escrow
    const mintTx = await tokenContract.mintToEscrow(recipientAddress, tokenAmount)
    await mintTx.wait()

    // Release tokens from escrow to the recipient
    const releaseTx = await tokenContract.releaseTokens(recipientAddress)
    const receipt = await releaseTx.wait()

    // Record the token minting in your database
    await recordTokenMinting(paymentReference, amount, recipientAddress, receipt.hash)

    // Return the transaction hash as proof
    return NextResponse.json({
      success: true,
      txHash: receipt.hash,
      amount: amount,
      recipient: recipientAddress,
    })
  } catch (error) {
    console.error("Error processing webhook:", error)

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unknown error occurred" },
      { status: 500 },
    )
  }
}


## Token Minting API

### 1. Manual Testing via the UI

You can test the token minting process manually using the UI I've created:

1. Navigate to the main page of your application
2. Enter an amount in IDR (e.g., 100000)
3. Enter a recipient wallet address (must be a valid Ethereum address)
4. Enter a payment reference (this would typically come from your payment system)
5. Click "Mint Tokens"


If everything is set up correctly, you should see a success message with the transaction hash, which you can click to view on the blockchain explorer.

### 2. Testing the Webhook

In a production environment, your payment processor would call the webhook endpoint when a payment is confirmed. You can simulate this using a tool like Postman or curl:

```shellscript
curl -X POST https://your-domain.com/api/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "paymentReference": "BNK123456",
    "amount": 100000,
    "recipientAddress": "0xYourValidEthereumAddress",
    "status": "completed"
  }'
```

## Integrating with Your Payment System

To fully integrate this with your payment system:

1. **Payment Confirmation**: Modify the `verifyPayment` function in `lib/payment-service.ts` to connect to your actual payment database or API.
2. **Webhook Configuration**: Configure your payment processor to call the `/api/webhook` endpoint when a payment is confirmed. Make sure to add proper authentication to this endpoint in production.
3. **Database Integration**: Update the `recordTokenMinting` function to store transaction records in your database.
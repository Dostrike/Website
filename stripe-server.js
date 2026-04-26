import express from 'express';
import Stripe from 'stripe';
import cors from 'cors';

const app = express();
const stripe = Stripe('sk_test_51RhTG0RvoLaReZ2IwFFNK3UpSVpZub7GEJinWOQTia1B3YfS8SeRYveLIM7y7dN9MqMgCTFBIrfYIzojhYnDQLbe00AIP1zgmG');

app.use(cors());
app.use(express.json());

app.post('/create-checkout-session', async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Unlock All Themes',
            },
            unit_amount: 299, // $2.99
          },
          quantity: 1,
        },
      ],
      success_url: 'http://localhost:5173/success',
      cancel_url: 'http://localhost:5173/cancel',
    });
    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = 4242;
app.listen(PORT, () => console.log(`Stripe server running on port ${PORT}`)); 
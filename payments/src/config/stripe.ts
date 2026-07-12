import dotenv from 'dotenv';
import Stripe from 'stripe';

dotenv.config();

const stripe = new Stripe(
    process.env.STRIPE_SECRET_KEY as string,
);

export default stripe;
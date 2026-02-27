import { getUncachableStripeClient } from './stripeClient';

async function createProducts() {
  const stripe = await getUncachableStripeClient();

  const plans = [
    {
      name: 'Starter Package',
      description: 'Up to 5 properties. Includes QR tenant submission and basic request tracking.',
      metadata: { tier: 'starter', maxProperties: '5' },
      priceAmount: 1900,
    },
    {
      name: 'Growth Package',
      description: 'Unlimited properties. Includes priority notifications, exportable repair logs, status updates for tenants, and photo uploads.',
      metadata: { tier: 'growth', maxProperties: 'unlimited' },
      priceAmount: 3900,
    },
    {
      name: 'Pro Package',
      description: 'Unlimited properties. Includes analytics dashboard, maintenance cost tracking, and custom branding.',
      metadata: { tier: 'pro', maxProperties: 'unlimited' },
      priceAmount: 5900,
    },
  ];

  for (const plan of plans) {
    const existing = await stripe.products.search({ query: `name:'${plan.name}'` });
    if (existing.data.length > 0) {
      console.log(`${plan.name} already exists (${existing.data[0].id}), skipping.`);
      continue;
    }

    const product = await stripe.products.create({
      name: plan.name,
      description: plan.description,
      metadata: plan.metadata,
    });

    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: plan.priceAmount,
      currency: 'usd',
      recurring: { interval: 'month', trial_period_days: 14 },
    });

    console.log(`Created ${plan.name}: product=${product.id}, price=${price.id}`);
  }

  console.log('Done seeding products.');
}

createProducts().catch(console.error);

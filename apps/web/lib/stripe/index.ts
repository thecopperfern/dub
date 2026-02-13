import Stripe from "stripe";
import { StripeMode } from "../types";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

const stripeConfig: Stripe.StripeConfig = {
  apiVersion: "2025-05-28.basil",
  appInfo: {
    name: "Dub.co",
    version: "0.1.0",
  },
};

const stripeEnabled = Boolean(stripeSecretKey);

const createDisabledStripeProxy = (message: string) =>
  new Proxy(
    {},
    {
      get() {
        throw new Error(message);
      },
    },
  ) as Stripe;

export const stripe: Stripe = stripeEnabled
  ? new Stripe(stripeSecretKey!, stripeConfig)
  : createDisabledStripeProxy(
      "STRIPE_SECRET_KEY is not configured. Stripe integration is disabled.",
    );

const secretMap: Record<StripeMode, string | undefined> = {
  live: process.env.STRIPE_APP_SECRET_KEY,
  test: process.env.STRIPE_APP_SECRET_KEY_TEST,
  sandbox: process.env.STRIPE_APP_SECRET_KEY_SANDBOX,
};

// Stripe Integration App client
export const stripeAppClient = ({ mode }: { mode?: StripeMode }) => {
  const appSecretKey = secretMap[mode ?? "test"];

  if (!appSecretKey) {
    return createDisabledStripeProxy(
      `Stripe app secret is not configured for mode \"${mode ?? "test"}\".`,
    );
  }

  return new Stripe(appSecretKey, stripeConfig);
};

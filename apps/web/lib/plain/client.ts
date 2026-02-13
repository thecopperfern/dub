import { PlainClient } from "@team-plain/typescript-sdk";

const plainApiKey = process.env.PLAIN_API_KEY;
const plainEnabled = Boolean(plainApiKey && plainApiKey !== "disabled");

export const plain: PlainClient = plainEnabled
  ? new PlainClient({
      apiKey: plainApiKey!,
    })
  : (new Proxy(
      {},
      {
        get() {
          throw new Error(
            "PLAIN_API_KEY is not configured. Plain integration is disabled.",
          );
        },
      },
    ) as PlainClient);

export type PlainUser = {
  id: string;
  name: string | null;
  email: string | null;
};

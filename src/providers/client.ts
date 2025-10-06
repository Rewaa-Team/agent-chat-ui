import { Client } from "@langchain/langgraph-sdk";

export function createClient(
  apiUrl: string,
  apiKey: string | undefined,
  jwt?: string,
) {
  if (!jwt)
    return new Client({
      apiKey,
      apiUrl,
    });

  return new Client({
    apiKey,
    apiUrl,
    defaultHeaders: {
      Authorization: `Bearer ${jwt}`,
      "Content-Type": "application/json",
    },
  });
}

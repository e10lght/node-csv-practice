import { Client } from "https://deno.land/x/postgres/mod.ts";

const connectionString = Deno.env.get("DB_URI") ||
  "postgresql://postgres:passw0rd@localhost:5440/postgres";
export const client = new Client(connectionString);

await client.connect();
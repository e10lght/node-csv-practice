import { client } from "./db/connect.ts";

// const createTableQuery = `
//   CREATE TABLE IF NOT EXISTS users (
//     id SERIAL PRIMARY KEY,
//     name VARCHAR(255) NOT NULL,
//     email VARCHAR(255) UNIQUE NOT NULL,
//     age INTEGER
//   )
// `;

// await client.queryObject(createTableQuery);

const insertQuery = `
  INSERT INTO users (name, email, age)
  VALUES
    ('John Doe', 'john@example.com', 25),
    ('Jane Smith', 'jane@example.com', 30),
    ('Michael Johnson', 'michael@example.com', 35),
    ('Emily Davis', 'emily@example.com', 28),
    ('David Wilson', 'david@example.com', 32),
    ('Sarah Taylor', 'sarah@example.com', 27),
    ('Robert Anderson', 'robert@example.com', 40),
    ('Jennifer Martinez', 'jennifer@example.com', 29),
    ('Christopher Harris', 'christopher@example.com', 33),
    ('Jessica Thompson', 'jessica@example.com', 31)
`;

await client.queryObject(insertQuery);

await client.end();

import { parse } from "https://deno.land/std@0.170.0/encoding/csv.ts";
import { client } from "./db/connect.ts";

const path = "./csv/dummy2.csv";
const text = await Deno.readTextFile(path);
const csvData = parse(text);

/** メールアドレスに重複がないかバリデーション */
try {
  // CSVが10000件を超えていないか
  if (csvData.length > 10001) throw new Error("データの上限を超えています");

  // CSVファイル内に重複がないかバリデーションしておく
  const duplicatedEmailList = csvData.filter((targetUser) =>
    csvData.find((user) =>
      targetUser[0] !== user[0] && targetUser[2] === user[2]
    )
  );
  // 一応重複の組み合わせも出しておく
  const combinedDuplicatedEmail = duplicatedEmailList.map((list) => {
    const duplicatedUser = duplicatedEmailList.find((user) =>
      list[0] !== user[0] && list[2] === user[2]
    );
    return [list, duplicatedUser];
  });

  if (combinedDuplicatedEmail.length > 0) {
    throw new Error("CSVデータ内に重複が存在します");
  }
} catch (error) {
  console.error(error);
  throw new Error(error);
}

// // トランザクションを張っておく
const transaction = client.createTransaction("create_chatgroup", {
  isolation_level: "repeatable_read",
});
try {
  let firstLine = true;
  await transaction.begin();

  // バリデーション対象のメールアドレスを抽出
  const userEmailList = await transaction.queryObject<{ email: string }>(
    `select email from users;`,
  );

  for await (const user of csvData) {
    if (firstLine) {
      firstLine = false;
      continue;
    }
    const id = user[0];
    const name = user[1];
    const email = user[2];
    const age = Number(user[3]);

    const duplicatedEmail = userEmailList.rows.find((row) =>
      row.email === email
    );
    if (duplicatedEmail) {
      throw new Error("メールアドレスが重複しています");
    }

    await transaction.queryObject(
      `INSERT INTO users (name, email, age)
     VALUES($1, $2, $3);`,
      [name, email, age],
    );
  }

  console.info("commit");
  await transaction.commit();
} catch (error) {
  console.error(error);
  await transaction.rollback();
} finally {
  await client.end();
}

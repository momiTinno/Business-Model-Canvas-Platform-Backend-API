import assert from "node:assert/strict";
import test from "node:test";

import { createTransactionHandler } from "../src/db/mysql/mysql.transaction.js";

test("rolls back and releases a transaction when its callback fails", async () => {
  const rows = [];
  const connection = {
    async beginTransaction() {},
    async commit() {},
    async rollback() {
      rows.length = 0;
    },
    release() {},
  };
  const pool = {
    async getConnection() {
      return connection;
    },
  };
  const runInTransaction = createTransactionHandler(pool);

  await assert.rejects(
    runInTransaction(async () => {
      rows.push({ id: "written-row" });
      throw new Error("transaction failed");
    }),
    /transaction failed/,
  );

  assert.deepEqual(rows, []);
});

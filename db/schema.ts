import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const runtimeStatus = sqliteTable("runtime_status", {
  id: integer("id").primaryKey(),
  payload: text("payload").notNull(),
  receivedAt: text("received_at").notNull(),
});

import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const runtimeStatus = sqliteTable("runtime_status", {
  id: integer("id").primaryKey(),
  payload: text("payload").notNull(),
  receivedAt: text("received_at").notNull(),
});

export const approvalRequests = sqliteTable("approval_requests", {
  id: text("id").primaryKey(),
  action: text("action").notNull(),
  requestId: text("request_id").notNull(),
  authorityId: text("authority_id").notNull(),
  requestedAt: text("requested_at").notNull(),
  expiresAt: text("expires_at").notNull(),
  approvedBy: text("approved_by").notNull(),
  status: text("status").notNull(),
});

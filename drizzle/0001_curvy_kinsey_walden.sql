CREATE TABLE `approval_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`action` text NOT NULL,
	`request_id` text NOT NULL,
	`authority_id` text NOT NULL,
	`requested_at` text NOT NULL,
	`expires_at` text NOT NULL,
	`approved_by` text NOT NULL,
	`status` text NOT NULL
);

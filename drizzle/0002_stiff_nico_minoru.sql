CREATE TABLE `approval_attempts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`attempt_key` text NOT NULL,
	`attempted_at` text NOT NULL,
	`success` integer NOT NULL
);

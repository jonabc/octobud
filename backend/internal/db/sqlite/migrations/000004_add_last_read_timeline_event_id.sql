-- +goose Up
-- Add last_read_timeline_event_id field to notifications table for tracking read status
ALTER TABLE notifications ADD COLUMN last_read_timeline_event_id TEXT;

-- +goose Down
-- Remove last_read_timeline_event_id field
ALTER TABLE notifications DROP COLUMN last_read_timeline_event_id;

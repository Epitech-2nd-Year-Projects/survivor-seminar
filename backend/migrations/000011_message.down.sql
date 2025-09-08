ALTER TABLE conversation_participants DROP CONSTRAINT IF EXISTS fk_participants_last_read_message;
ALTER TABLE conversations DROP CONSTRAINT IF EXISTS fk_conversations_last_message;

DROP INDEX IF EXISTS idx_message_reads_user_id;
DROP INDEX IF EXISTS idx_message_reads_message_id;
DROP INDEX IF EXISTS idx_messages_created_at;
DROP INDEX IF EXISTS idx_messages_sender_id;
DROP INDEX IF EXISTS idx_messages_conversation_id;
DROP INDEX IF EXISTS idx_conversation_participants_user_id;
DROP INDEX IF EXISTS idx_conversation_participants_conversation_id;

DROP TABLE IF EXISTS message_reads;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS conversation_participants;
DROP TABLE IF EXISTS conversations;
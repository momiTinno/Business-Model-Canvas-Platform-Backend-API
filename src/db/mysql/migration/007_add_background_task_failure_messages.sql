SET @database_name = DATABASE();

SET @business_idea_failure_message_exists = (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = @database_name
    AND table_name = 'business_ideas'
    AND column_name = 'failure_message'
);
SET @business_idea_failure_message_sql = IF(
  @business_idea_failure_message_exists = 0,
  'ALTER TABLE business_ideas ADD COLUMN failure_message VARCHAR(255) NULL AFTER generation_status',
  'SELECT 1'
);
PREPARE business_idea_failure_message_statement
  FROM @business_idea_failure_message_sql;
EXECUTE business_idea_failure_message_statement;
DEALLOCATE PREPARE business_idea_failure_message_statement;

SET @canvas_generation_failure_message_exists = (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = @database_name
    AND table_name = 'canvas_generations'
    AND column_name = 'failure_message'
);
SET @canvas_generation_failure_message_sql = IF(
  @canvas_generation_failure_message_exists = 0,
  'ALTER TABLE canvas_generations ADD COLUMN failure_message VARCHAR(255) NULL AFTER error_code',
  'SELECT 1'
);
PREPARE canvas_generation_failure_message_statement
  FROM @canvas_generation_failure_message_sql;
EXECUTE canvas_generation_failure_message_statement;
DEALLOCATE PREPARE canvas_generation_failure_message_statement;

UPDATE business_ideas
SET generation_status = 'NOT_REQUESTED'
WHERE generation_status = 'PENDING'
  AND ai_enhanced_idea IS NULL
  AND deleted = FALSE;

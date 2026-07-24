export const CREATE_ENTRY =
  "INSERT INTO entries (id, canvas_generation_id, category_id, content, sort_order, entry_insertion_type, draft, state, version, created_by, updated_by) VALUES (?, ?, ?, ?, ?, 'AI', TRUE, 'HYPOTHESIS', 0, ?, ?)";
export const FIND_ENTRIES_BY_CANVAS_GENERATION_ID =
  "SELECT e.id, e.category_id AS categoryId, c.code AS categoryCode, c.name AS categoryName, e.content, e.sort_order AS sortOrder, e.entry_insertion_type AS entryInsertionType, e.draft, e.state, e.version, e.created_at AS createdAt, e.updated_at AS updatedAt FROM entries e JOIN categories c ON c.id = e.category_id WHERE e.canvas_generation_id = ? AND e.deleted = FALSE ORDER BY c.name, e.sort_order";

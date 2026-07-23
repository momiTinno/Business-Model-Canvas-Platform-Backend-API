export const FIND_CATEGORIES_BY_CANVAS_ID =
  "SELECT id, code, name FROM categories WHERE canvas_id = ? AND deleted = FALSE ORDER BY name";

export const FIND_CANVAS_TYPES =
  "SELECT id, name FROM canvas WHERE deleted = FALSE ORDER BY name";
export const FIND_CANVAS_TYPE_BY_ID =
  "SELECT id, name FROM canvas WHERE id = ? AND deleted = FALSE LIMIT 1";

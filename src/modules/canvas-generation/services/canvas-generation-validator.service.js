import { APP_LIMITS } from "../../../constants/app.constants.js";
import { AppError } from "../../../utils/app-error.util.js";
import { generate } from "../../../utils/uuid.util.js";

export class CanvasGenerationValidatorService {
  validate = ({ content, categories }) => {
    let payload;
    try {
      payload = JSON.parse(content);
    } catch {
      throw new AppError("AI response is invalid", 502, "AI_RESPONSE_INVALID");
    }
    if (!payload || Array.isArray(payload) || typeof payload !== "object")
      throw new AppError("AI response is invalid", 502, "AI_RESPONSE_INVALID");
    const keys = Object.keys(payload);
    if (
      keys[0] !== "description" ||
      typeof payload.description !== "string" ||
      !payload.description.trim()
    )
      throw new AppError("AI response is invalid", 502, "AI_RESPONSE_INVALID");
    const categoryByName = new Map(
      categories.map((category) => [category.name, category]),
    );
    const responseCategoryNames = keys.slice(1);
    if (
      responseCategoryNames.length !== categories.length ||
      responseCategoryNames.some((name) => !categoryByName.has(name)) ||
      categories.some((category) => !Object.hasOwn(payload, category.name))
    )
      throw new AppError("AI response is invalid", 502, "AI_RESPONSE_INVALID");
    const duplicateContent = new Set();
    const entries = [];
    for (const category of categories) {
      const hypotheses = payload[category.name];
      if (!Array.isArray(hypotheses))
        throw new AppError(
          "AI response is invalid",
          502,
          "AI_RESPONSE_INVALID",
        );
      hypotheses.forEach((hypothesis, sortOrder) => {
        const entry = hypothesis?.trim();
        const normalizedEntry = entry?.replace(/\s+/g, " ").toLowerCase();
        if (
          !entry ||
          entry.length > APP_LIMITS.MAX_ENTRY_LENGTH ||
          duplicateContent.has(normalizedEntry)
        )
          throw new AppError(
            "AI response is invalid",
            502,
            "AI_RESPONSE_INVALID",
          );
        duplicateContent.add(normalizedEntry);
        entries.push({
          id: generate(),
          categoryId: category.id,
          content: entry,
          sortOrder,
        });
      });
    }
    return entries;
  };
}

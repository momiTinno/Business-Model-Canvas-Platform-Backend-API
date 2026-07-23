export class PortkeyResponseMapper {
  getCompletionContent = (response) => {
    const choice = response?.body?.choices?.[0] ?? response?.choices?.[0];
    const messageContent = choice?.message?.content;

    if (typeof messageContent === "string") return messageContent.trim();

    const contentBlocks = choice?.message?.content_blocks;
    if (Array.isArray(contentBlocks))
      return contentBlocks
        .map((block) => block?.text)
        .filter((text) => typeof text === "string")
        .join("\n")
        .trim();

    if (typeof choice?.text === "string") return choice.text.trim();

    return null;
  };
}

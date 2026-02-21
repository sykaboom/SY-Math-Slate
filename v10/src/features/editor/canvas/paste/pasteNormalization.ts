export type ClipboardSource =
  | {
      clipboardData?: DataTransfer | null;
    }
  | DataTransfer
  | null
  | undefined;

const isDataTransfer = (value: unknown): value is DataTransfer => {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<DataTransfer>;
  return (
    typeof candidate.getData === "function" &&
    typeof candidate.setData === "function" &&
    Boolean(candidate.items)
  );
};

function resolveClipboardData(
  source: ClipboardSource
): DataTransfer | null | undefined {
  if (!source) return source;
  if (isDataTransfer(source)) return source;
  return source.clipboardData;
}

export function extractImageFilesFromClipboard(source: ClipboardSource): File[] {
  const items = resolveClipboardData(source)?.items;
  if (!items) return [];

  const imageFiles: File[] = [];
  for (const item of Array.from(items)) {
    if (!item.type.startsWith("image/")) continue;
    const file = item.getAsFile();
    if (file) imageFiles.push(file);
  }
  return imageFiles;
}

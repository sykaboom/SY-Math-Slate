export type BoardRatio = "16:9" | "4:3";

type BoardSize = { width: number; height: number };

const BOARD_SIZES: Record<BoardRatio, BoardSize> = {
  "16:9": { width: 1920, height: 1080 },
  "4:3": { width: 1440, height: 1080 },
};

export const getBoardSize = (ratio: BoardRatio): BoardSize => {
  return BOARD_SIZES[ratio];
};

export const getBoardPadding = () => 48;

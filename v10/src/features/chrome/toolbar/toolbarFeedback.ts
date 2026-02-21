import { dispatchCommand } from "@core/runtime/command/commandBus";

export type ToolbarFeedbackTone = "info" | "success" | "error";

export type ToolbarFeedbackNotice = {
  tone: ToolbarFeedbackTone;
  message: string;
};

type ToolbarFeedbackListener = (notice: ToolbarFeedbackNotice) => void;

const listeners = new Set<ToolbarFeedbackListener>();

export const publishToolbarNotice = (notice: ToolbarFeedbackNotice): void => {
  listeners.forEach((listener) => {
    listener(notice);
  });
};

export const subscribeToolbarNotice = (
  listener: ToolbarFeedbackListener
): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

type FireToolbarCommandInput = {
  commandId: string;
  payload?: unknown;
  source: string;
  errorMessage?: string;
};

export const fireToolbarCommand = ({
  commandId,
  payload = {},
  source,
  errorMessage,
}: FireToolbarCommandInput): void => {
  void dispatchCommand(commandId, payload, {
    meta: { source },
  }).catch(() => {
    publishToolbarNotice({
      tone: "error",
      message: errorMessage ?? "요청을 처리하지 못했습니다.",
    });
  });
};

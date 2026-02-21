import { ExtensionRuntimeBootstrap } from "@features/platform/extensions/ui/ExtensionRuntimeBootstrap";
import { AppLayout } from "@features/chrome/layout/AppLayout";

export default function Home() {
  return (
    <>
      <ExtensionRuntimeBootstrap />
      <AppLayout />
    </>
  );
}

import { ExtensionRuntimeBootstrap } from "@features/extensions/ui/ExtensionRuntimeBootstrap";
import { AppLayout } from "@features/layout/AppLayout";

export default function Home() {
  return (
    <>
      <ExtensionRuntimeBootstrap />
      <AppLayout />
    </>
  );
}

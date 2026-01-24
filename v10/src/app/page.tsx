import { AppLayout } from "@/components/layout/AppLayout";

export default function Home() {
  return (
    <AppLayout>
      <div className="flex flex-col items-center gap-4 text-center">
        <p className="text-xs uppercase tracking-[0.4em] text-neon-cyan/70">
          Empty Slate
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          SY Math Slate (v10)
        </h1>
        <p className="max-w-md text-sm leading-6 text-white/70">
          기본 레이아웃과 툴바가 준비되었습니다. 다음 작업에서 캔버스,
          필기 도구, 텍스트 레이어를 연결합니다.
        </p>
      </div>
    </AppLayout>
  );
}

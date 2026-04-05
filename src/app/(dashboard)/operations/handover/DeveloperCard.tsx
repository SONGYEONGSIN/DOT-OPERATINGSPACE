import { IconCode } from "@tabler/icons-react";
import { Card, ProgressBar } from "@/components/common";
import { type Service } from "./types";

interface DeveloperCardProps {
  developer: string;
  services: Service[];
}

export default function DeveloperCard({
  developer,
  services,
}: DeveloperCardProps) {
  const devActive = services.filter((s) => s.status === "active").length;
  const devTotal = services.length;
  const categories = Array.from(
    new Set(services.map((s) => s.category).filter(Boolean)),
  ).slice(0, 4);

  return (
    <Card hover className="p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="flex items-center justify-center w-9 h-9 rounded-full bg-secondary/10">
          <IconCode size={14} className="text-secondary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-on-surface truncate">
            {developer}
          </h3>
          <p className="text-[10px] text-on-surface-variant">
            담당 {devTotal}건
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-lg font-black text-on-surface tabular-nums">
            {devActive}
          </p>
          <p className="text-[10px] text-on-surface-variant">진행중</p>
        </div>
      </div>

      <ProgressBar
        value={devActive}
        max={devTotal || 1}
        size="sm"
        color="primary"
      />
      <div className="flex justify-between mt-1.5">
        <span className="text-[10px] text-on-surface-variant">진행률</span>
        <span className="text-[10px] font-bold text-on-surface tabular-nums">
          {devTotal > 0 ? Math.round((devActive / devTotal) * 100) : 0}%
        </span>
      </div>

      {/* 담당 서비스 카테고리 요약 */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-outline-variant/10">
          {categories.map((cat) => (
            <span
              key={cat}
              className="px-2 py-0.5 rounded-full bg-surface-container-high text-[10px] font-medium text-on-surface-variant"
            >
              {cat}
            </span>
          ))}
        </div>
      )}
    </Card>
  );
}

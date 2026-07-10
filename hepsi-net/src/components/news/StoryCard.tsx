"use client";

import { cn, timeAgo, getFaviconUrl, getImportanceBadge } from "@/lib/utils";
import type { StoryListItem } from "@/lib/types";

interface StoryCardProps {
  story: StoryListItem;
  selected: boolean;
  onClick: () => void;
}

export function StoryCard({ story, selected, onClick }: StoryCardProps) {
  const badge = getImportanceBadge(story.importanceScore);

  return (
    <div
      className={cn(
        "story-row cursor-pointer px-4 py-3 flex gap-3 select-none",
        selected && "selected",
        story.isBreaking && !selected && "border-l-2 border-l-brand-red/40"
      )}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      aria-selected={selected}
    >
      {/* Thumbnail */}
      <div className="flex-none w-16 h-12 rounded overflow-hidden bg-bg-elevated relative">
        {story.thumbnailUrl ? (
          <img
            src={story.thumbnailUrl}
            alt=""
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <img
              src={getFaviconUrl(story.sourceDomain)}
              alt={story.sourceName}
              className="w-5 h-5 opacity-40"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          </div>
        )}
        {story.isBreaking && (
          <div className="absolute bottom-0 left-0 right-0 bg-brand-red/80 text-white text-[8px] font-bold text-center py-0.5">
            CANLI
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Top meta */}
        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
          <div className="flex items-center gap-1">
            <img
              src={getFaviconUrl(story.sourceDomain)}
              alt={story.sourceName}
              className="w-3 h-3"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
            <span className="text-[11px] text-text-muted font-medium">{story.sourceName}</span>
          </div>
          <span className="text-text-dim text-[10px]">·</span>
          <span className="text-[11px] text-text-muted tabular-nums">{timeAgo(story.publishedAt)}</span>

          {story.keywordMatchCount && story.keywordMatchCount > 0 && (
            <span className="text-[9px] font-bold text-accent-cyan border border-accent-cyan/30 rounded px-1">
              KELİME
            </span>
          )}
        </div>

        {/* Headline */}
        <p className={cn(
          "text-sm leading-snug mb-1.5 line-clamp-2",
          story.isBreaking ? "text-text-primary font-semibold" : "text-text-primary font-medium"
        )}>
          {story.headline}
        </p>

        {/* Snippet */}
        {story.snippet && (
          <p className="text-[11px] text-text-muted line-clamp-1 mb-1.5">{story.snippet}</p>
        )}

        {/* Bottom meta */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="category-badge">{story.category}</span>

          <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded", badge.className)}>
            {story.importanceScore} {badge.label}
          </span>

          {story.clusterSourceCount && story.clusterSourceCount > 1 && (
            <span className="text-[10px] text-text-muted border border-border rounded px-1.5 py-0.5">
              {story.clusterSourceCount} kaynak
            </span>
          )}

          <span className={cn(
            "ml-auto text-[10px] font-medium px-1.5 py-0.5 rounded border",
            `status-${story.editorialStatus}`
          )}>
            {story.editorialStatus}
          </span>
        </div>
      </div>
    </div>
  );
}

export function StoryCardSkeleton() {
  return (
    <div className="story-row px-4 py-3 flex gap-3">
      <div className="skeleton flex-none w-16 h-12 rounded" />
      <div className="flex-1 space-y-2">
        <div className="flex gap-2">
          <div className="skeleton h-3 w-16 rounded" />
          <div className="skeleton h-3 w-10 rounded" />
        </div>
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-3 w-3/4 rounded" />
        <div className="flex gap-2">
          <div className="skeleton h-4 w-12 rounded" />
          <div className="skeleton h-4 w-16 rounded" />
        </div>
      </div>
    </div>
  );
}

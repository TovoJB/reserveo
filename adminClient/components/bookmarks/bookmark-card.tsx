"use client";

import { Bookmark } from "@/mock-data/bookmarks";
import { cn } from "@/lib/utils";
import {
    MoreVertical,
    ExternalLink,
    Star,
    Trash2,
    Edit,
    Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useBookmarksStore } from "@/store/bookmarks-store";

interface BookmarkCardProps {
    bookmark: Bookmark;
    variant?: "grid" | "list";
}

export function BookmarkCard({ bookmark, variant = "grid" }: BookmarkCardProps) {
    const { toggleFavorite, trashBookmark } = useBookmarksStore();

    const handleCopyUrl = () => {
        navigator.clipboard.writeText(bookmark.url);
    };

    if (variant === "list") {
        return (
            <div className="group flex items-center gap-4 bg-card hover:bg-accent/50 border rounded-lg p-3 transition-colors">
                <div className="flex-shrink-0 size-10 rounded-md bg-white border flex items-center justify-center overflow-hidden">
                    <img
                        src={bookmark.favicon}
                        alt={bookmark.title}
                        className="size-6 object-contain"
                        onError={(e) => {
                            e.currentTarget.style.display = "none";
                        }}
                    />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <h3 className="font-medium truncate">{bookmark.title}</h3>
                        {bookmark.isFavorite && (
                            <Star className="size-3 fill-yellow-400 text-yellow-400" />
                        )}
                    </div>
                    <a
                        href={bookmark.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted-foreground truncate hover:underline block"
                    >
                        {bookmark.url}
                    </a>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={() => toggleFavorite(bookmark.id)}
                    >
                        <Star
                            className={cn(
                                "size-4",
                                bookmark.isFavorite
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-muted-foreground"
                            )}
                        />
                    </Button>
                    <Button variant="ghost" size="icon" className="size-8" asChild>
                        <a href={bookmark.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="size-4 text-muted-foreground" />
                        </a>
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8">
                                <MoreVertical className="size-4 text-muted-foreground" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={handleCopyUrl}>
                                <Copy className="mr-2 size-4" />
                                Copy URL
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Edit className="mr-2 size-4" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => trashBookmark(bookmark.id)}
                            >
                                <Trash2 className="mr-2 size-4" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        );
    }

    return (
        <div className="group relative bg-card hover:shadow-sm border rounded-xl overflow-hidden transition-all hover:border-border/80 flex flex-col h-full">
            <div className="p-4 flex-1">
                <div className="flex items-start justify-between mb-3">
                    <div className="size-10 rounded-md bg-white border flex items-center justify-center overflow-hidden shrink-0">
                        <img
                            src={bookmark.favicon}
                            alt={bookmark.title}
                            className="size-6 object-contain"
                            onError={(e) => {
                                e.currentTarget.style.display = "none";
                            }}
                        />
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 rounded-full"
                            onClick={() => toggleFavorite(bookmark.id)}
                        >
                            <Star
                                className={cn(
                                    "size-4",
                                    bookmark.isFavorite
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "text-muted-foreground"
                                )}
                            />
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="size-8 rounded-full">
                                    <MoreVertical className="size-4 text-muted-foreground" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={handleCopyUrl}>
                                    <Copy className="mr-2 size-4" />
                                    Copy URL
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Edit className="mr-2 size-4" />
                                    Edit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onClick={() => trashBookmark(bookmark.id)}
                                >
                                    <Trash2 className="mr-2 size-4" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                <h3 className="font-semibold text-base mb-1 line-clamp-1">
                    {bookmark.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3 h-10">
                    {bookmark.description}
                </p>

                <div className="flex flex-wrap gap-1.5">
                    {bookmark.tags.slice(0, 3).map((tag) => (
                        <span
                            key={tag}
                            className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-secondary text-secondary-foreground"
                        >
                            #{tag}
                        </span>
                    ))}
                    {bookmark.tags.length > 3 && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-secondary text-secondary-foreground">
                            +{bookmark.tags.length - 3}
                        </span>
                    )}
                </div>
            </div>

            <div className="p-3 border-t bg-muted/20 flex items-center justify-between">
                <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                    {new URL(bookmark.url).hostname}
                </span>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs gap-1.5"
                    asChild
                >
                    <a href={bookmark.url} target="_blank" rel="noopener noreferrer">
                        Open
                        <ExternalLink className="size-3" />
                    </a>
                </Button>
            </div>
        </div>
    );
}

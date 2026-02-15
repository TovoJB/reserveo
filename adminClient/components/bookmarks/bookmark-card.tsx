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
    MapPin,
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
            <div
                className="group flex items-center gap-4 bg-card hover:bg-accent/50 border rounded-lg p-3 transition-colors cursor-pointer"
                onClick={() => {
                    window.dispatchEvent(new CustomEvent("open-bookmark-detail", { detail: bookmark }));
                }}
            >
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
                        <h3 className="font-medium truncate group-hover:text-primary transition-colors">{bookmark.title}</h3>
                        {bookmark.isFavorite && (
                            <Star className="size-3 fill-yellow-400 text-yellow-400" />
                        )}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="size-3 text-primary/60" />
                        <span>{bookmark.location || "Antananarivo"}</span>
                    </div>
                </div>

                <div className="flex items-center gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
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
                                Copier le lien
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Edit className="mr-2 size-4" />
                                Modifier
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => trashBookmark(bookmark.id)}
                            >
                                <Trash2 className="mr-2 size-4" />
                                Supprimer
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        );
    }

    return (
        <div
            className="group relative bg-card hover:shadow-md border rounded-xl overflow-hidden transition-all hover:border-primary/50 flex flex-col h-full cursor-pointer"
            onClick={() => {
                // Open detail view logic will go here
                window.dispatchEvent(new CustomEvent("open-bookmark-detail", { detail: bookmark }));
            }}
        >
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
                    <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
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
                                    Copier le lien
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Edit className="mr-2 size-4" />
                                    Modifier
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onClick={() => trashBookmark(bookmark.id)}
                                >
                                    <Trash2 className="mr-2 size-4" />
                                    Supprimer
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                <h3 className="font-semibold text-base mb-1 line-clamp-1 group-hover:text-primary transition-colors">
                    {bookmark.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3 h-10">
                    {bookmark.description}
                </p>

                <div className="flex flex-wrap gap-1.5">
                    {bookmark.tags.map((tag) => (
                        <span
                            key={tag}
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary/5 text-primary border border-primary/10"
                        >
                            #{tag}
                        </span>
                    ))}
                </div>
            </div>

            <div className="p-3 border-t bg-muted/20 flex items-center justify-between mt-auto">
                <span className="text-[10px] text-muted-foreground truncate max-w-[150px] flex items-center gap-1">
                    <MapPin className="size-3" />
                    {bookmark.location || "Antananarivo"}
                </span>
                <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-[10px] gap-1.5 font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
                    onClick={(e) => e.stopPropagation()}
                    asChild
                >
                    <a href={bookmark.url} target="_blank" rel="noopener noreferrer">
                        Maps
                        <ExternalLink className="size-3" />
                    </a>
                </Button>
            </div>
        </div>
    );
}

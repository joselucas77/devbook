"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ModulePostItem = {
  id: number;
  title: string;
  slug: string;
};

interface ModuleFolderProps {
  technologySlug: string;
  moduleTitle: string;
  moduleSlug: string;
  posts: ModulePostItem[];
}

export function ModuleFolder({
  moduleTitle,
  moduleSlug,
  posts,
  technologySlug,
}: ModuleFolderProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card className="border border-border/60 bg-card overflow-hidden">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center justify-between gap-3 p-3.5 sm:p-4 cursor-pointer group hover:bg-muted/40 transition-colors min-w-0">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500 group-hover:bg-blue-500/20 transition-colors shrink-0">
                {isOpen ? (
                  <i className="bx bx-folder-open text-xl" />
                ) : (
                  <i className="bx bx-folder text-xl" />
                )}
              </div>

              <div className="text-left min-w-0 flex-1">
                <h3 className="font-semibold text-sm sm:text-base text-foreground group-hover:text-blue-500 transition-colors break-words">
                  {moduleTitle}
                </h3>
              </div>
            </div>

            <i
              className={cn(
                "bx bx-chevron-right text-xl text-muted-foreground transition-transform duration-200 shrink-0",
                isOpen && "rotate-90"
              )}
            />
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-3 sm:px-4 pb-4">
            <div className="border-l-2 border-border ml-4 sm:ml-5 pl-3 sm:pl-4 space-y-1 mt-1">
              {posts.map((post) => (
                <Button
                  asChild
                  key={post.id}
                  variant="ghost"
                  className="w-full flex items-start sm:items-center justify-start text-sm h-auto min-h-9 py-2 px-2.5 sm:px-3 hover:text-blue-500 whitespace-normal text-left"
                >
                  <Link
                    href={`/tecnologias/${technologySlug}/modulos/${moduleSlug}/post/${post.slug}`}
                  >
                    <i className="bx bx-file text-base text-blue-400 mr-2 shrink-0 mt-0.5 sm:mt-0" />
                    <span className="min-w-0 flex-1 break-words leading-snug">
                      {post.title}
                    </span>
                  </Link>
                </Button>
              ))}

              {posts.length === 0 && (
                <p className="text-sm text-muted-foreground py-2 pl-3">
                  Ainda não há posts publicados neste módulo.
                </p>
              )}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

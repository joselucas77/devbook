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
          <div className="flex items-center justify-between p-4 cursor-pointer group hover:bg-muted/40 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500 group-hover:bg-blue-500/20 transition-colors">
                {isOpen ? (
                  <i className="bx bx-folder-open text-xl" />
                ) : (
                  <i className="bx bx-folder text-xl" />
                )}
              </div>

              <div className="text-left">
                <h3 className="font-semibold text-foreground group-hover:text-blue-500 transition-colors">
                  {moduleTitle}
                </h3>
              </div>
            </div>

            <i
              className={cn(
                "bx bx-chevron-right text-xl text-muted-foreground transition-transform duration-200",
                isOpen && "rotate-90"
              )}
            />
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-4 pb-4">
            <div className="border-l-2 border-border ml-5 pl-4 space-y-1 mt-1">
              {posts.map((post) => (
                <Button
                  asChild
                  key={post.id}
                  variant="ghost"
                  className="w-full flex items-center justify-start text-sm h-9 px-3 hover:text-blue-500"
                >
                  <Link
                    href={`/tecnologias/${technologySlug}/modulos/${moduleSlug}/post/${post.slug}`}
                  >
                    <i className="bx bx-file text-base text-blue-400 mr-2" />
                    <span>{post.title}</span>
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

"use client";

import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Folder, FolderOpen, FileText, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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

export default function ModuleFolder({
  moduleTitle,
  moduleSlug,
  posts,
  technologySlug,
}: ModuleFolderProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center justify-between p-4 cursor-pointer group">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                {isOpen ? (
                  <FolderOpen className="h-6 w-6" />
                ) : (
                  <Folder className="h-6 w-6" />
                )}
              </div>

              <div className="text-left flex gap-2">
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  {moduleTitle}
                </h3>
              </div>
            </div>

            <ChevronRight
              className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${
                isOpen ? "rotate-90" : ""
              }`}
            />
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-4 pb-4">
            <div className="border-l-2 border-border ml-5 pl-6 space-y-1">
              {posts.map((post) => (
                <Button
                  asChild
                  key={post.id}
                  variant="ghost"
                  className="w-full flex items-center justify-start">
                  <Link
                    href={`/tecnologias/${technologySlug}/modulos/${moduleSlug}/post/${post.slug}`}>
                    <FileText className="h-4 w-4 text-primary/70" />
                    <span>{post.title}</span>
                  </Link>
                </Button>
              ))}

              {posts.length === 0 && (
                <p className="text-sm text-muted-foreground py-2">
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

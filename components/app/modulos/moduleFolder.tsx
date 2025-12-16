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

interface ModuleFolderProps {
  module: string;
  posts: string[];
  slug: string;
}

export default function ModuleFolder({
  module,
  posts,
  slug,
}: ModuleFolderProps) {
  const [isOpen, setIsOpen] = useState(false);

  // const moduleSlug = module.toLowerCase().replace(/\s+/g, "-");

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
              <div className="text-left">
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  {module}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {posts.length} {posts.length === 1 ? "Post" : "Posts"}
                </p>
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
              {posts.map((post, postIndex) => {
                // const postSlug = post.toLowerCase().replace(/\s+/g, "-");
                return (
                  <Button
                    asChild
                    key={postIndex}
                    variant="ghost"
                    className="w-full flex items-center justify-start"
                  >
                    <Link
                      // href={`/tecnologias/${slug}/modulos/${module}/post/${post}`}
                      href={`/tecnologias/${slug}/modulos/${module}/post/variaveis-em-php`}
                    >
                      <FileText className="h-4 w-4 text-primary/70" />
                      <span>{post}</span>
                    </Link>
                  </Button>
                );
              })}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

import type { Metadata } from "next";
import { PageLoading } from "@/components/layout/page-loading";

export const metadata: Metadata = {
  title: "Loading | DevBook",
};

export default function LoadTestPage() {
  return <PageLoading />;
}

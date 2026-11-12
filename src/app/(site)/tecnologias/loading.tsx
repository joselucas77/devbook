import { FeaturedCardSkeleton } from "@/components/technologies/featured-card-skeleton";

export default function Loading() {
  return (
    <section className="mb-20">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold">Tecnologias</h2>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <FeaturedCardSkeleton key={i} />
        ))}
      </div>
    </section>
  );
}

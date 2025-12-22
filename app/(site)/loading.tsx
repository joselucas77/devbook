import FeaturedCardSkeleton from "@/components/app/site/tecnologias/featuredCardSkeleton";

export default function Loading() {
  return (
    <section className="mb-20">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold">Carregando...</h2>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <FeaturedCardSkeleton key={i} />
        ))}
      </div>
    </section>
  );
}

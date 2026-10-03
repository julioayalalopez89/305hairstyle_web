import { QUICK_STATS } from "@/data/business";

export default function QuickStats() {
  return (
    <section className="bg-[#15110E] text-[var(--brand)] border-y border-[var(--brand)]/25 py-10">
      <div className="max-w-5xl mx-auto px-5 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        {QUICK_STATS.map((stat) => (
          <div key={stat.label}>
            <div className="text-3xl font-bold mb-1" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              {stat.value}
            </div>
            <div className="text-sm text-foreground/60 font-medium">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

import { ImagesIcon } from "lucide-react";
import { PosterCard } from "@/components/poster-card";
import { buttonVariants } from "@/components/ui/button";
import { type Poster, posters } from "@/posters";

const GROUPS: { id: Poster["group"]; title: string }[] = [
  { id: "retenues", title: "Versions retenues" },
  { id: "nouvelles", title: "Nouvelles propositions" },
];

export function PostersPage() {
  return (
    <div className="flex flex-col gap-12">
      <section className="flex max-w-3xl flex-col gap-4">
        <p className="text-muted-foreground text-xs tracking-[0.2em] uppercase">Collecte · Petits Frères des Pauvres</p>
        <h1 className="font-serif text-4xl leading-tight text-balance sm:text-5xl">Affiches de collecte</h1>
        <p className="text-muted-foreground leading-relaxed">
          Six directions pour l’affiche de collecte : un truc bon, un truc chaud, de quoi se distraire, et un petit mot
          chaleureux. Toutes les affiches sont dessinées en SVG. Cliquez sur une affiche pour l’agrandir, ou
          téléchargez-la en PNG (impression jusqu’en A3) ou en SVG (vectoriel).
        </p>
        <div>
          <a href="/illustrations/index.html" className={buttonVariants({ variant: "secondary" })}>
            <ImagesIcon /> Illustrations seules (PNG et SVG)
          </a>
        </div>
      </section>

      {GROUPS.map((group) => (
        <section key={group.id} className="flex flex-col gap-6">
          <h2 className="font-serif text-2xl">{group.title}</h2>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,340px),1fr))] gap-x-8 gap-y-12">
            {posters
              .filter((poster) => poster.group === group.id)
              .map((poster) => (
                <PosterCard key={poster.slug} poster={poster} index={posters.indexOf(poster)} />
              ))}
          </div>
        </section>
      ))}
    </div>
  );
}

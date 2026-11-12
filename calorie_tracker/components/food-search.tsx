"use client";

import { useMemo, useState } from "react";
import { formatCalories, formatGrams } from "@/lib/nutrition";
import type { Food, FoodCategory } from "@/lib/types";
import { PlusIcon, SearchIcon } from "./icons";

interface Props {
  foods: Food[] | null; // null while loading
  onAdd: (food: Food) => void;
}

const CATEGORY_ORDER: FoodCategory[] = ["Protein", "Grains", "Fruit", "Vegetables", "Dairy", "Nuts & fats", "Legumes"];

/** Every word typed must appear somewhere in the name or category. */
function matches(food: Food, words: string[]) {
  const haystack = `${food.name} ${food.category}`.toLowerCase();
  return words.every((w) => haystack.includes(w));
}

/** Search box, category filter, and the list of foods to add. */
export function FoodSearch({ foods, onAdd }: Props) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<FoodCategory | "All">("All");

  const results = useMemo(() => {
    if (!foods) return [];
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    return foods.filter((f) => (category === "All" || f.category === category) && matches(f, words));
  }, [foods, query, category]);

  const categories = useMemo(
    () => CATEGORY_ORDER.filter((c) => foods?.some((f) => f.category === c)),
    [foods],
  );

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && query.trim() && results.length > 0) {
      e.preventDefault();
      onAdd(results[0]);
    } else if (e.key === "Escape") {
      setQuery("");
    }
  }

  const chip = (active: boolean) =>
    `shrink-0 rounded-full border px-3 py-1 text-sm font-medium ${
      active ? "border-ink bg-ink text-surface" : "border-line bg-surface hover:border-ink"
    }`;

  return (
    <section aria-labelledby="foods-title" className="flex flex-col gap-3">
      <h2 id="foods-title" className="sr-only">
        Add food
      </h2>

      <div>
        <label htmlFor="food-search" className="mb-1.5 block text-sm font-semibold">
          Search foods
        </label>
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted" />
          <input
            id="food-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Try rice, eggs, or banana"
            autoComplete="off"
            aria-describedby="search-hint"
            className="w-full rounded-lg border-2 border-ink bg-surface py-3 pr-4 pl-10 text-base placeholder:text-muted"
          />
        </div>
        <p id="search-hint" className="mt-1.5 text-xs text-muted">
          Press Enter to add the top match.
        </p>
      </div>

      <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Filter by category">
        <button type="button" className={chip(category === "All")} aria-pressed={category === "All"} onClick={() => setCategory("All")}>
          All
        </button>
        {categories.map((c) => (
          <button key={c} type="button" className={chip(category === c)} aria-pressed={category === c} onClick={() => setCategory(c)}>
            {c}
          </button>
        ))}
      </div>

      {foods === null ? (
        <p className="py-6 text-sm text-muted">Loading foods…</p>
      ) : results.length === 0 ? (
        <div className="rounded-lg border border-dashed border-line px-4 py-6 text-sm">
          <p>
            No foods match <strong>“{query.trim() || category}”</strong>
            {category !== "All" && query.trim() ? ` in ${category}` : ""}. Check the spelling or clear the filters.
          </p>
          <button
            type="button"
            className="mt-2 font-semibold underline underline-offset-2"
            onClick={() => {
              setQuery("");
              setCategory("All");
            }}
          >
            Clear search
          </button>
        </div>
      ) : (
        <ul className="overflow-hidden rounded-lg border border-line bg-surface" aria-label={`${results.length} foods`}>
          {results.map((food) => (
            <li key={food.id} className="border-b border-line last:border-b-0">
              <button
                type="button"
                onClick={() => onAdd(food)}
                className="group flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-paper"
                aria-label={`Add ${food.name}, ${food.servingSize}, ${formatCalories(food.calories)} calories`}
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">{food.name}</span>
                  <span className="block text-sm text-muted">{food.servingSize}</span>
                </span>
                <span className="hidden text-right text-xs leading-relaxed text-muted sm:block">
                  <MacroDot className="bg-protein" /> {formatGrams(food.protein)}
                  <MacroDot className="ml-2 bg-carbs" /> {formatGrams(food.carbs)}
                  <MacroDot className="ml-2 bg-fat" /> {formatGrams(food.fat)}
                </span>
                <span className="w-14 text-right font-bold">
                  {formatCalories(food.calories)}
                  <span className="ml-0.5 text-xs font-normal text-muted">Cal</span>
                </span>
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-accent text-accent-ink group-hover:scale-105 group-active:scale-95">
                  <PlusIcon width={14} height={14} />
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function MacroDot({ className }: { className: string }) {
  return <span className={`inline-block size-2 align-middle ${className}`} aria-hidden="true" />;
}

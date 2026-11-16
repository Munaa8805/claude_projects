import type { Brand } from "@/types/product";

export const BRANDS = {
  NOVA: { slug: "nova", name: "Nova" },
  OPTIX: { slug: "optix", name: "Optix" },
  PIXELWORKS: { slug: "pixelworks", name: "PixelWorks" },
  PLAYCORE: { slug: "playcore", name: "PlayCore" },
  SOUNDWAVE: { slug: "soundwave", name: "SoundWave" },
  VOLTIX: { slug: "voltix", name: "Voltix" },
} satisfies Record<string, Brand>;

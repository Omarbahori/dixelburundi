import createImageUrlBuilder from "@sanity/image-url";
import type { Image } from "sanity";
import { sanityClient } from "@/sanity/lib/client";

const builder = createImageUrlBuilder(sanityClient);

export function urlForImage(source: Image) {
  return builder.image(source).auto("format").fit("max");
}

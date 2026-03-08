import { createClient } from "next-sanity";
import { apiVersion } from "@/sanity/lib/apiVersion";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;

export const isSanityConfigured = Boolean(projectId && dataset);

export const sanityClient = createClient({
  projectId: projectId || "missing-project-id",
  dataset: dataset || "production",
  apiVersion,
  useCdn: process.env.NODE_ENV === "production",
});

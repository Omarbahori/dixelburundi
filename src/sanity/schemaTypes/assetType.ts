import { defineField, defineType, type ReferenceFilterResolverContext } from "sanity";
import { apiVersion } from "@/sanity/lib/apiVersion";

function categoryFilter({ document }: ReferenceFilterResolverContext) {
  const clientRef = (document as { client?: { _ref?: string } } | undefined)?.client?._ref;
  if (!clientRef) {
    return { filter: '_type == "category"' };
  }

  return {
    filter: '_type == "category" && client._ref == $clientRef',
    params: { clientRef },
  };
}

export const assetType = defineType({
  name: "asset",
  title: "Asset",
  type: "document",
  fields: [
    defineField({
      name: "client",
      title: "Client",
      type: "reference",
      to: [{ type: "client" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "reference",
      to: [{ type: "category" }],
      options: {
        filter: categoryFilter,
      },
      validation: (rule) =>
        rule.required().custom(async (value, context) => {
          const clientRef = (context.document as { client?: { _ref?: string } } | undefined)?.client?._ref;
          const categoryRef = (value as { _ref?: string } | undefined)?._ref;

          if (!clientRef || !categoryRef) return true;

          const client = context.getClient({ apiVersion });
          const belongsToClient = await client.fetch<boolean>(
            'count(*[_type == "category" && _id == $categoryRef && client._ref == $clientRef]) > 0',
            { clientRef, categoryRef },
          );

          return belongsToClient || "Selected category must belong to the selected client.";
        }),
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: {
        hotspot: true,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "caption",
      title: "Caption",
      type: "string",
    }),
    defineField({
      name: "isFeatured",
      title: "Featured",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "createdAt",
      title: "Created At",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {
      media: "image",
      title: "caption",
      category: "category.title",
      client: "client.name",
    },
    prepare(selection) {
      const title =
        typeof selection.title === "string" && selection.title.trim().length > 0
          ? selection.title
          : "Untitled image";
      const client = typeof selection.client === "string" ? selection.client : "No client";
      const category = typeof selection.category === "string" ? selection.category : "No category";

      return {
        media: selection.media,
        title,
        subtitle: `${client} • ${category}`,
      };
    },
  },
});

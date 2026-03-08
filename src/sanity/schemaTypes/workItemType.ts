import { defineArrayMember, defineField, defineType } from "sanity";

export const workItemType = defineType({
  name: "workItem",
  title: "Work Item",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "thumbnail",
      title: "Thumbnail",
      type: "image",
      options: { hotspot: true },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "categoryRefs",
      title: "Categories",
      type: "array",
      description: "Select saved categories or create a new one from the dropdown.",
      of: [
        defineArrayMember({
          type: "reference",
          to: [{ type: "workCategoryOption" }],
          options: {
            disableNew: false,
          },
        }),
      ],
      validation: (rule) =>
        rule.custom((value, context) => {
          const hasRefCategories = Array.isArray(value) && value.length > 0;
          const legacyCategories = (context.document as { categories?: string[] } | undefined)?.categories;
          const hasLegacyCategories =
            Array.isArray(legacyCategories) &&
            legacyCategories.some((entry) => typeof entry === "string" && entry.trim().length > 0);

          return hasRefCategories || hasLegacyCategories
            ? true
            : "At least one category is required.";
        }),
    }),
    defineField({
      name: "categories",
      title: "Categories (Legacy)",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      hidden: true,
    }),
    defineField({
      name: "client",
      title: "Client",
      type: "reference",
      to: [{ type: "client" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "caseStudy",
      title: "Case Study",
      type: "reference",
      to: [{ type: "caseStudy" }],
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "client.name",
      media: "thumbnail",
    },
  },
});

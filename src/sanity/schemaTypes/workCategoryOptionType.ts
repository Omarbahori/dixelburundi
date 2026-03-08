import { defineField, defineType } from "sanity";

export const workCategoryOptionType = defineType({
  name: "workCategoryOption",
  title: "Work Category Option",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required().min(1).max(80),
    }),
  ],
  preview: {
    select: {
      title: "title",
    },
  },
});

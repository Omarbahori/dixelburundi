import { defineField, defineType } from "sanity";

export const categoryType = defineType({
  name: "category",
  title: "Category",
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
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "order",
      title: "Order",
      type: "number",
      initialValue: 0,
      validation: (rule) => rule.required().integer().min(0),
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "client.name",
      order: "order",
    },
    prepare(selection) {
      const order = typeof selection.order === "number" ? selection.order : 0;
      const subtitle = typeof selection.subtitle === "string" ? selection.subtitle : "No client";
      return {
        title: selection.title,
        subtitle: `${subtitle} • #${order}`,
      };
    },
  },
});

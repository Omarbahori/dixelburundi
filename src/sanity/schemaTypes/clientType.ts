import { defineField, defineType } from "sanity";

export const clientType = defineType({
  name: "client",
  title: "Client",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "name",
        maxLength: 96,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "logo",
      title: "Logo",
      type: "image",
      options: {
        hotspot: true,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "shortDescription",
      title: "Short Description",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "services",
      title: "Services",
      type: "array",
      of: [{ type: "string" }],
      hidden: true,
    }),
    defineField({
      name: "description",
      title: "Description (Legacy)",
      type: "text",
      rows: 3,
      hidden: true,
    }),
    defineField({
      name: "serviceTags",
      title: "Service Tags (Legacy)",
      type: "array",
      of: [{ type: "string" }],
      hidden: true,
    }),
  ],
  preview: {
    select: {
      title: "name",
      media: "logo",
      subtitle: "shortDescription",
    },
    prepare(selection) {
      const subtitle = typeof selection.subtitle === "string" ? selection.subtitle : "";
      return {
        title: selection.title,
        media: selection.media,
        subtitle: subtitle.length > 90 ? `${subtitle.slice(0, 90)}...` : subtitle,
      };
    },
  },
});

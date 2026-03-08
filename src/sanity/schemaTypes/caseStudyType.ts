import { defineArrayMember, defineField, defineType } from "sanity";

export const caseStudyType = defineType({
  name: "caseStudy",
  title: "Case Study",
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
      name: "client",
      title: "Client",
      type: "reference",
      to: [{ type: "client" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "introHeadline",
      title: "Intro Headline",
      type: "string",
      hidden: true,
    }),
    defineField({
      name: "introText",
      title: "Intro Text",
      type: "text",
      rows: 3,
      hidden: true,
    }),
    defineField({
      name: "coverImages",
      title: "Cover Images",
      type: "array",
      of: [
        defineArrayMember({
          type: "image",
          options: { hotspot: true },
        }),
      ],
      hidden: true,
    }),
    defineField({
      name: "blocks",
      title: "Blocks",
      type: "array",
      of: [defineArrayMember({ type: "caseStudyBlock" })],
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "client.name",
    },
  },
});

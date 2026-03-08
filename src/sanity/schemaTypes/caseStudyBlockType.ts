import { defineArrayMember, defineField, defineType } from "sanity";

function workCategoryRefField() {
  return defineField({
    name: "workCategoryRef",
    title: "Work Category",
    type: "reference",
    description: "Select an existing category or create a new one from this field.",
    to: [{ type: "workCategoryOption" }],
    options: {
      disableNew: false,
    },
    validation: (rule) =>
      rule.custom((value, context) => {
        const parent = context.parent as
          | {
              showOnWork?: boolean;
              showOnHomeFeatured?: boolean;
              workCategory?: string;
            }
          | undefined;
        const required = Boolean(parent?.showOnWork || parent?.showOnHomeFeatured);
        if (!required) return true;
        const legacyValue =
          typeof parent?.workCategory === "string" && parent.workCategory.trim().length > 0;
        if (value || legacyValue) return true;
        return "Category is required when item is shown on Work or Home Featured.";
      }),
  });
}

function legacyWorkCategoryField() {
  return defineField({
    name: "workCategory",
    title: "Work Category (Legacy)",
    type: "string",
    hidden: true,
  });
}

export const caseStudyBlockType = defineType({
  name: "caseStudyBlock",
  title: "Case Study Block",
  type: "object",
  fields: [
    defineField({
      name: "type",
      title: "Block Type",
      type: "string",
      options: {
        list: [
          { title: "Gallery Grid", value: "galleryGrid" },
          { title: "Two Up", value: "twoUp" },
          { title: "Full Width", value: "fullWidth" },
          { title: "Text", value: "text" },
        ],
      },
    }),
    defineField({
      name: "title",
      title: "Title",
      type: "string",
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 4,
      hidden: true,
    }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      hidden: true,
    }),
    defineField({
      name: "mediaItems",
      title: "Media Items (Legacy)",
      description:
        "Legacy mixed-media field. Use Images / Videos-Reels / Video URLs fields below.",
      type: "array",
      of: [
        defineArrayMember({
          name: "caseStudyMediaItem",
          title: "Media Item",
          type: "object",
          fields: [
            defineField({
              name: "mediaType",
              title: "Media Type",
              type: "string",
              options: {
                list: [
                  { title: "Image", value: "image" },
                  { title: "Video/Reel Upload", value: "videoUpload" },
                  { title: "Video URL", value: "videoUrl" },
                ],
              },
              initialValue: "image",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "image",
              title: "Image",
              type: "image",
              options: { hotspot: true },
              hidden: ({ parent }) => (parent as { mediaType?: string } | undefined)?.mediaType !== "image",
              validation: (rule) =>
                rule.custom((value, context) => {
                  const mediaType = (context.parent as { mediaType?: string } | undefined)?.mediaType;
                  if (mediaType !== "image") return true;
                  return value ? true : "Image is required when media type is Image.";
                }),
            }),
            defineField({
              name: "videoFile",
              title: "Video/Reel File",
              type: "file",
              options: {
                accept: "video/mp4,video/webm,video/ogg,video/quicktime,.mp4,.webm,.ogg,.mov,.m4v",
              },
              hidden: ({ parent }) => (parent as { mediaType?: string } | undefined)?.mediaType !== "videoUpload",
              validation: (rule) =>
                rule.custom((value, context) => {
                  const mediaType = (context.parent as { mediaType?: string } | undefined)?.mediaType;
                  if (mediaType !== "videoUpload") return true;
                  return value ? true : "Video file is required when media type is Video/Reel Upload.";
                }),
            }),
            defineField({
              name: "videoUrl",
              title: "Video URL",
              type: "url",
              description: "Paste YouTube/Vimeo URL or a direct .mp4/.webm link.",
              hidden: ({ parent }) => (parent as { mediaType?: string } | undefined)?.mediaType !== "videoUrl",
              validation: (rule) =>
                rule.uri({ scheme: ["http", "https"] }).custom((value, context) => {
                  const mediaType = (context.parent as { mediaType?: string } | undefined)?.mediaType;
                  if (mediaType !== "videoUrl") return true;
                  return value ? true : "Video URL is required when media type is Video URL.";
                }),
            }),
            defineField({
              name: "poster",
              title: "Poster (optional)",
              type: "image",
              options: { hotspot: true },
              hidden: ({ parent }) => (parent as { mediaType?: string } | undefined)?.mediaType === "image",
            }),
            defineField({
              name: "caption",
              title: "Caption",
              type: "string",
            }),
            defineField({
              name: "showOnWork",
              title: "Show On Work Page",
              type: "boolean",
              initialValue: false,
            }),
            defineField({
              name: "showOnHomeFeatured",
              title: "Show On Home Featured",
              type: "boolean",
              initialValue: false,
            }),
            defineField({
              name: "workTitle",
              title: "Work Card Title",
              type: "string",
            }),
            workCategoryRefField(),
            legacyWorkCategoryField(),
            defineField({
              name: "order",
              title: "Order",
              type: "number",
              initialValue: 0,
              validation: (rule) => rule.integer().min(0),
            }),
          ],
          preview: {
            select: {
              mediaType: "mediaType",
              caption: "caption",
              image: "image",
              poster: "poster",
            },
            prepare(selection) {
              const mediaType = typeof selection.mediaType === "string" ? selection.mediaType : "media";
              const title =
                typeof selection.caption === "string" && selection.caption.trim().length > 0
                  ? selection.caption
                  : `Untitled ${mediaType}`;
              return {
                title,
                subtitle: mediaType,
                media: selection.image || selection.poster,
              };
            },
          },
        }),
      ],
    }),
    defineField({
      name: "imageItems",
      title: "Images",
      description:
        "Drop many images at once. This is the recommended image field.",
      type: "array",
      of: [
        defineArrayMember({
          type: "image",
          options: { hotspot: true, accept: "image/*" },
          fields: [
            defineField({
              name: "caption",
              title: "Caption",
              type: "string",
            }),
            defineField({
              name: "showOnWork",
              title: "Show On Work Page",
              type: "boolean",
              initialValue: false,
            }),
            defineField({
              name: "showOnHomeFeatured",
              title: "Show On Home Featured",
              type: "boolean",
              initialValue: false,
            }),
            defineField({
              name: "workTitle",
              title: "Work Card Title",
              type: "string",
            }),
            workCategoryRefField(),
            legacyWorkCategoryField(),
            defineField({
              name: "order",
              title: "Order",
              type: "number",
              initialValue: 0,
              validation: (rule) => rule.integer().min(0),
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: "videoItems",
      title: "Videos / Reels",
      description:
        "Drop many reel/video files at once. Recommended for local uploads.",
      type: "array",
      of: [
        defineArrayMember({
          type: "file",
          options: {
            accept: "video/mp4,video/webm,video/ogg,video/quicktime,.mp4,.webm,.ogg,.mov,.m4v",
          },
          fields: [
            defineField({
              name: "poster",
              title: "Poster (optional)",
              type: "image",
              options: { hotspot: true },
            }),
            defineField({
              name: "caption",
              title: "Caption",
              type: "string",
            }),
            defineField({
              name: "showOnWork",
              title: "Show On Work Page",
              type: "boolean",
              initialValue: false,
            }),
            defineField({
              name: "showOnHomeFeatured",
              title: "Show On Home Featured",
              type: "boolean",
              initialValue: false,
            }),
            defineField({
              name: "workTitle",
              title: "Work Card Title",
              type: "string",
            }),
            workCategoryRefField(),
            legacyWorkCategoryField(),
            defineField({
              name: "order",
              title: "Order",
              type: "number",
              initialValue: 0,
              validation: (rule) => rule.integer().min(0),
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: "videoUrlItems",
      title: "Video URLs",
      description:
        "Add external links (YouTube / Vimeo / direct video URLs). One item per URL.",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({
              name: "videoUrl",
              title: "Video URL",
              type: "url",
              validation: (rule) => rule.required().uri({ scheme: ["http", "https"] }),
            }),
            defineField({
              name: "poster",
              title: "Poster (optional)",
              type: "image",
              options: { hotspot: true },
            }),
            defineField({
              name: "caption",
              title: "Caption",
              type: "string",
            }),
            defineField({
              name: "showOnWork",
              title: "Show On Work Page",
              type: "boolean",
              initialValue: false,
            }),
            defineField({
              name: "showOnHomeFeatured",
              title: "Show On Home Featured",
              type: "boolean",
              initialValue: false,
            }),
            defineField({
              name: "workTitle",
              title: "Work Card Title",
              type: "string",
            }),
            workCategoryRefField(),
            legacyWorkCategoryField(),
            defineField({
              name: "order",
              title: "Order",
              type: "number",
              initialValue: 0,
              validation: (rule) => rule.integer().min(0),
            }),
          ],
          preview: {
            select: {
              url: "videoUrl",
              caption: "caption",
              poster: "poster",
            },
            prepare(selection) {
              const title =
                typeof selection.caption === "string" && selection.caption.trim().length > 0
                  ? selection.caption
                  : typeof selection.url === "string"
                    ? selection.url
                    : "Untitled video URL";
              return {
                title,
                subtitle: "videoUrl",
                media: selection.poster,
              };
            },
          },
        }),
      ],
    }),
    defineField({
      name: "images",
      title: "Images",
      description:
        "Legacy image field (kept for compatibility). Prefer the Images field above.",
      type: "array",
      of: [
        defineArrayMember({
          type: "image",
          options: { hotspot: true, accept: "image/*" },
          fields: [
            defineField({
              name: "caption",
              title: "Caption",
              type: "string",
            }),
            defineField({
              name: "showOnWork",
              title: "Show On Work Page",
              type: "boolean",
              initialValue: false,
            }),
            defineField({
              name: "showOnHomeFeatured",
              title: "Show On Home Featured",
              type: "boolean",
              initialValue: false,
            }),
            defineField({
              name: "workTitle",
              title: "Work Card Title",
              type: "string",
            }),
            workCategoryRefField(),
            legacyWorkCategoryField(),
          ],
        }),
      ],
    }),
    defineField({
      name: "order",
      title: "Order",
      type: "number",
      initialValue: 0,
      validation: (rule) => rule.integer().min(0),
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "type",
      order: "order",
    },
    prepare(selection) {
      const blockType = typeof selection.subtitle === "string" ? selection.subtitle : "block";
      const order = typeof selection.order === "number" ? selection.order : 0;
      return {
        title: selection.title,
        subtitle: `${blockType} • #${order}`,
      };
    },
  },
});

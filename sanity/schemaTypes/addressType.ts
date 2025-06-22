// schemas/schemaTypes/addressType.ts
import { defineField, defineType } from "sanity";

export const addressType = defineType({
  name: "address",
  title: "Address",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Address Name",
      type: "string",
      validation: Rule => Rule.required().max(50)
    }),
    defineField({
      name: "address",
      title: "Street Address",
      type: "string",
      validation: Rule => Rule.required()
    }),
    defineField({
      name: "barangay",
      title: "Barangay",
      type: "string",
      validation: Rule => Rule.required()
    }),
    defineField({
      name: "city",
      title: "City/Municipality",
      type: "string",
      validation: Rule => Rule.required()
    }),
    defineField({
      name: "province",
      title: "Province",
      type: "string",
      validation: Rule => Rule.required()
    }),
    defineField({
      name: "zip",
      title: "ZIP Code",
      type: "string",
      validation: Rule => Rule.required().regex(/^\d{4}$/, { name: "zipCode" })
    }),
    defineField({
      name: "isDefault",
      title: "Default Address",
      type: "boolean",
      initialValue: false
    }),
    defineField({
      name: "user",
      title: "User",
      type: "reference",
      to: [{ type: "user" }],
      validation: Rule => Rule.required(),
       options: {
        disableNew: true
      }
    })
  ]
});

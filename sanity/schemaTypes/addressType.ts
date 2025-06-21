import { defineField, defineType } from "sanity";

export const addressType = defineType({
  name: "address",
  title: "Address",
  type: "document",
  fields: [
    defineField({
      name: "user",
      title: "User",
      type: "reference",
      to: [{ type: "user" }],
      weak: true, // Breaks circular reference
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: "street",
      title: "Street Address",
      type: "string",
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: "city",
      title: "City",
      type: "string",
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: "state",
      title: "State/Province",
      type: "string"
    }),
    defineField({
      name: "postalCode",
      title: "Postal Code",
      type: "string"
    }),
    defineField({
      name: "country",
      title: "Country",
      type: "string",
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: "isDefault",
      title: "Default Address",
      type: "boolean",
      initialValue: false
    }),
  ],
  preview: {
    select: {
      title: 'street',
      city: 'city',
      user: 'user.fullName'
    },
    prepare({ title, city, user }) {
      return {
        title: `${user || 'No user'}: ${title}`,
        subtitle: city
      }
    }
  }
});
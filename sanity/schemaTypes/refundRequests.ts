import { defineField, defineType } from 'sanity'
import { ClockIcon } from '@sanity/icons'

export const refundRequestType = defineType({
  name: 'refundRequest',
  title: 'Refund Request',
  type: 'document',
  icon: ClockIcon,
  fields: [
    defineField({
      name: 'order',
      title: 'Order',
      type: 'reference',
      to: [{ type: 'order' }],
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'user',
      title: 'User',
      type: 'reference',
      to: [{ type: 'user' }],
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Pending', value: 'pending' },
          { title: 'Approved', value: 'approved' },
          { title: 'Rejected', value: 'rejected' }
        ],
        layout: 'radio'
      },
      initialValue: 'pending'
    }),
    defineField({
      name: 'requestedAt',
      title: 'Requested At',
      type: 'datetime',
      initialValue: (new Date()).toISOString()
    }),
    defineField({
      name: 'reason',
      title: 'Reason',
      type: 'text'
    })
  ],
  preview: {
    select: {
      orderNumber: 'order.orderNumber',
      customer: 'order.customerName',
      status: 'status',
      reason: 'reason',
      date: 'requestedAt'
    },
    prepare({ orderNumber, customer, status, reason, date }) {
      return {
        title: `Refund for Order #${orderNumber}`,
        subtitle: `${customer} - ${status}`,
        description: reason ? `${reason.substring(0, 50)}...` : 'No reason provided',
        media: ClockIcon
      }
    }
  }
})
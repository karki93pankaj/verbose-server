export default {
  Query: {
  },
  Mutation: {
    async upsertAlertBox (parent, args, ctx, info) {
      const { id, page, title, content, prefix, style, top, order } = args

      const alertBox = await ctx.prisma.upsertAlertBox({
        where: {
          id
        },
        update: {
          page: {
            connect: { id: page }
          },
          title,
          content,
          prefix,
          style,
          top,
          order,
        },
        create: {
          page: {
            connect: { id: page }
          },
          title,
          content,
          prefix,
          style,
          top,
          order,
        }
      })

      return alertBox
    },
    async deleteAlertBox (parent, args, ctx, info) {
      const { id } = args

      const alertBox = await ctx.prisma.deleteAlertBox({
        id
      }, info)

      return alertBox
    },
  },
}
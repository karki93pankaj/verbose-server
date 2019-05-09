export default {
  Query: {
  },
  Mutation: {
    async upsertAlertBox (parent, args, ctx, info) {
      const { id, page, title, content, prefix, style, order } = args

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
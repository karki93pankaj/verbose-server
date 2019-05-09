export default {
  Query: {
  },
  Mutation: {
    async upsertQuickTip (parent, args, ctx, info) {
      const { id, page, title, content, buttonText, buttonLink, media, order } = args

      const mediaQuery = media ? { connect: { id: media } } : null

      const quickTip = await ctx.prisma.upsertQuickTip({
        where: {
          id
        },
        update: {
          page: {
            connect: { id: page }
          },
          media: mediaQuery,
          title,
          content,
          buttonText,
          buttonLink,
          order,
        },
        create: {
          page: {
            connect: { id: page }
          },
          media: mediaQuery,
          title,
          content,
          buttonText,
          buttonLink,
          order,
        }
      })

      // disconnecting the media if not provied
      if (quickTip.id && !media) {
        const currentMedia = await ctx.prisma.quickTip({ id: quickTip.id }).media()
        if ( currentMedia ) {
          await ctx.prisma.updateQuickTip({
            where: {
              id: quickTip.id
            },
            data: {
              media:
              {
                disconnect: true
              },
            }
          })
        }
      }
      return quickTip
    },
    async deleteQuickTip (parent, args, ctx, info) {
      const { id } = args

      const quickTip = await ctx.prisma.deleteQuickTip({
        id
      }, info)

      return quickTip
    },
  },
  QuickTip: {
    media: (parent, args, ctx, info) => {
      return ctx.prisma.quickTip({
        id: parent.id
      }, info).media()
    }
  }
}
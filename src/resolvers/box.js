export default {
  Query: {
  },
  Mutation: {
    async upsertBox (parent, args, ctx, info) {
      const { id, page, media, title, video, style, content, order } = args

      const mediaQuery = media ? { connect: { id: media } } : null

      const box = await ctx.prisma.upsertBox({
        where: {
          id
        },
        update: {
          page: {
            connect: { id: page }
          },
          media: mediaQuery,
          title,
          video,
          style,
          content,
          order,
        },
        create: {
          page: {
            connect: { id: page }
          },
          media: mediaQuery,
          title,
          video,
          style,
          content,
          order,
        }
      })

      // disconnecting the media if not provied
      if (box.id && !media) {
        const currentMedia = await ctx.prisma.box({ id: box.id }).media()
        if ( currentMedia ) {
          await ctx.prisma.updateBox({
            where: {
              id
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

      return box
    },
    async deleteBox (parent, args, ctx, info) {
      const { id } = args

      const box = await ctx.prisma.deleteBox({
        id
      }, info)

      return box
    },
  },
  Box: {
    media: (parent, args, ctx, info) => {
      return ctx.prisma.box({
        id: parent.id
      }, info).media()
    }
  }
}
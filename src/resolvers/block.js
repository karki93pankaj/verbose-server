export default {
  Query: {
  },
  Mutation: {
    async upsertBlock (parent, args, ctx, info) {
      const { id, page, media, title, video, style, content, order } = args

      const mediaQuery = media ? { connect: { id: media } } : null

      const block = await ctx.prisma.upsertBlock({
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
      if (block.id && !media) {
        const currentMedia = await ctx.prisma.block({ id: block.id }).media()
        if(currentMedia ) {
          await ctx.prisma.updateBlock({
            where: {
              id: block.id
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

      return block
    },
    async deleteBlock (parent, args, ctx, info) {
      const { id } = args

      const block = await ctx.prisma.deleteBlock({
        id
      }, info)

      return block
    },
  },
  Block: {
    media: (parent, args, ctx, info) => {
      return ctx.prisma.block({
        id: parent.id
      }, info).media()
    }
  }
}
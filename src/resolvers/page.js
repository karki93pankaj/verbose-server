export default {
  Query: {
    async pages(parent, args, ctx, info) {
      // 1. Check if they are logged in
      if (!ctx.req.userId) {
        throw new Error('You must be logged in!');
      }
      // 2. Check if the user has the permissions to query all the users
      // hasPermission(ctx.request.user, ['ADMIN', 'PERMISSIONUPDATE']);

      // 2. if they do, query all the users!
      return ctx.prisma.pages({ orderBy: 'createdAt_DESC' }, info);
    },
    async page(parent, args, ctx, info) {
      return ctx.prisma.page(args, info);
    },
  },
  Mutation: {
    async upsertPage (parent, args, ctx, info) {
      const { id, media, title, slug, type, vertical, status } = args

      const mediaQuery = media ? { connect: { id: media } } : null

      const page = await ctx.prisma.upsertPage({
        where: {
          id
        },
        update: {
          media: mediaQuery,
          title,
          slug,
          type,
          vertical,
          status,
        },
        create: {
          media: mediaQuery,
          title,
          slug,
          type,
          vertical,
          status,
        }
      })

      // disconnecting the media if not provied
      if (page.id && !media) {
        const currentMedia = await ctx.prisma.page({ id: page.id }).media()
        if(currentMedia) {
          await ctx.prisma.updatePage({
            where: {
              id: page.id
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

      return page
    },
    async updateSectionsOrder (parent, args, ctx, info) {
      const { sectionsOrder } = args

      const sectionsOrderData = sectionsOrder.map(async section => {
        const query = {
          where: {
            id: section.id
          },
          data: {
            order: section.order
          }
        }

        try {
          if(section.type == 'Block') {
            return await ctx.prisma.updateBlock(query)
          }
          else if(section.type == 'Box') {
            return await ctx.prisma.updateBox(query)
          }
          else if(section.type == 'AlertBox') {
            return await ctx.prisma.updateAlertBox(query)
          }
          else if(section.type == 'QuickTip') {
            return await ctx.prisma.updateQuickTip(query)
          }
          else if(section.type == 'ProsAndCons') {
            return await ctx.prisma.updateProsAndCons(query)
          }
        } catch(e) {
          return section
        }
      })

      return sectionsOrderData[0].then((data) => ({ id: data.id }))
    }
  },
  Page: {
    media: (parent, args, ctx, info) => {
      return ctx.prisma.page({
        id: parent.id
      }).media()
    },
    blocks: (parent, args, ctx, info) => {
      return ctx.prisma.page({
        id: parent.id
      }).blocks()
    },
    boxes: (parent, args, ctx, info) => {
      return ctx.prisma.page({
        id: parent.id
      }).boxes()
    },
    alertBoxes: (parent, args, ctx, info) => {
      return ctx.prisma.page({
        id: parent.id
      }).alertBoxes()
    },
    quickTips: (parent, args, ctx, info) => {
      return ctx.prisma.page({
        id: parent.id
      }).quickTips()
    },
    prosAndCons: (parent, args, ctx, info) => {
      return ctx.prisma.page({
        id: parent.id
      }).prosAndCons()
    },
  },
}
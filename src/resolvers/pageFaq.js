export default {
    Query: {

    },
    Mutation: {
      async upsertPageFaq (parent, args, ctx, info) {
        const { id, page, faq, order } = args
        console.log('>>>>>>>>>>>>>>', args)
        const pageFaq = await ctx.prisma.upsertPageFaq({
          where: {
            id
          },
          update: {
            page: {
              connect: { id: page }
            },
            faq: {
                connect: { id: faq }
            },
            order
          },
          create: {
            page: {
              connect: { id: page }
            },
            faq: {
                connect: { id: faq }
            },
            order,
          }
        })

        return pageFaq
      },
      async deletePageFaq (parent, args, ctx, info) {
        const { id } = args
  
        const pageFaq = await ctx.prisma.deletePageFaq({
          id
        }, info)
  
        return pageFaq
      },
    },
    PageFaq: {
        faq: (parent, args, ctx, info) => {
            return ctx.prisma.pageFaq({
              id: parent.id
            }).faq()
        },
        page: (parent, args, ctx, info) => {
            return ctx.prisma.pageFaq({
              id: parent.id
            }).page()
        },
    }
  }
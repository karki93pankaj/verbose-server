export default {
    Query: {
    },
    Mutation: {
      async upsertPageFaqAccordion (parent, args, ctx, info) {
        const { id, page, faqCategory, order } = args
  
        const pageFaqAccordion = await ctx.prisma.upsertPageFaqAccordion({
          where: {
            id
          },
          update: {
            page: {
              connect: { id: page }
            },
            faqCategory: {
                connect: { id: faqCategory }
            },
            order
          },
          create: {
            page: {
              connect: { id: page }
            },
            faqCategory: {
                connect: { id: faqCategory }
            },
            order,
          }
        })

        return pageFaqAccordion
      },
      async deletePageFaqAccordion (parent, args, ctx, info) {
        const { id } = args
  
        const pageFaqAccordion = await ctx.prisma.deletePageFaqAccordion({
          id
        }, info)
  
        return pageFaqAccordion
      },
    },
    PageFaqAccordion: {
      faqCategory: (parent, args, ctx, info) => {
          return ctx.prisma.pageFaqAccordion({
            id: parent.id
          }).faqCategory()
      },
      page: (parent, args, ctx, info) => {
        return ctx.prisma.pageFaqAccordion({
          id: parent.id
        }).page()
      },
    }
  }
export default {
    Query: {
        async faqCategories(parent, args, ctx, info) {
          // 1. Check if they are logged in
          if (!ctx.req.userId) {
            throw new Error('You must be logged in!');
          }
          // 2. Check if the user has the permissions to query all the users
          // hasPermission(ctx.request.user, ['ADMIN', 'PERMISSIONUPDATE']);
    
          // 2. if they do, query all the faq categories!
          return ctx.prisma.faqCategories({ orderBy: 'createdAt_DESC' }, info);
        },
        async faqCategory(parent, args, ctx, info) {
          return ctx.prisma.faqCategory(args, info);
        },
      },

    Mutation: {
        async addFaqCategory (parent, args, ctx, info) {
            const { name, description, slug } = args
        
            /** Executing the query */
            const faqCategory = await ctx.prisma.createFaqCategory({
                name,
                description,
                slug
              }, info)
        
              return faqCategory
          },
       
        async updateFaqCategory (parent, args, ctx, info) {
          const { id, name, description, slug } = args
      
          /** Executing the query */
          const faqCategory = await ctx.prisma.updateFaqCategory({
            data: {
              name,
              description,
              slug
            },
              where: { id }
            }, info)
      
            return faqCategory
        },
        async deleteFaqCategory (parent, args, ctx, info) {
          const { id } = args
    
          /** Executing the query */
          const faqCategory = await ctx.prisma.deleteFaqCategory(
            {
              id
            }, info)
    
          return faqCategory
      },
    },
    FaqCategory: {
      faqs: (parent, args, ctx, info) => {
        return ctx.prisma.faqCategory({
          id: parent.id
        }).faqs()
      },
    }
}
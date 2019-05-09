import differenceBy from 'lodash/differenceBy'
import map from 'lodash/map'

export default {
    Query: {
        async faqs(parent, args, ctx, info) {
          // 1. Check if they are logged in
          if (!ctx.req.userId) {
            throw new Error('You must be logged in!');
          }
          // 2. Check if the user has the permissions to query all the users
          // hasPermission(ctx.request.user, ['ADMIN', 'PERMISSIONUPDATE']);
    
          // 2. if they do, query all the faqs!
          return ctx.prisma.faqs({ orderBy: 'createdAt_DESC' }, info);
        },
        async faq(parent, args, ctx, info) {
          return ctx.prisma.faq(args, info)
        },
        async searchFaq(parent, args, ctx, info) {
          const { searchString } = args
          return ctx.prisma.faqs({where: {OR: [{OR: searchString.split(' ').map((item) => {return {title_contains: item}})}, {OR: searchString.split(' ').map((item) => {return {description_contains: item}})}, {OR: searchString.split(' ').map((item) => {return {short_description_contains: item}})}]}}, info);
        },
      },

    Mutation: {
        async addFaq (parent, args, ctx, info) {
            const { title, description, short_description, slug, vertical, category = [], readingTime, order, variant, tag, authors } = args
            const faq = await ctx.prisma.createFaq({
              title,
              description,
              short_description,
              slug,
              vertical,
              category: {
                connect: category.map((categoryId) => {return {id: categoryId}})
              },
              readingTime,
              order,
              variant: {set: variant},
              tag: {set: tag},
              authors: {
                connect: authors.map((authorId) => {return {id: authorId}})
              },
              pubDate: new Date().toISOString()
            }, info)
      
            return faq
        },
        async updateFaq (parent, args, ctx, info) {
            const { id, title, description, short_description, slug, vertical, category = [], readingTime, order, variant, tag, authors } = args
            
            /** get all the existing authors */
            const existingAuthors = await ctx.prisma.faq({ id }).authors()
            let authorsQuery = {};

            // preparing the query to update authours
            const authorsToConnect = differenceBy(authors, map(existingAuthors, 'id'))
            const authorsToDelete = differenceBy(map(existingAuthors, 'id'), authors)
            authorsQuery = {
              connect: authorsToConnect.map((authorId) => {return {id: authorId}}),
              disconnect: authorsToDelete.map((authorId) => {return {id: authorId}})
            }    
            
            /** get all the existing faq categories */
            const existingCategory = await ctx.prisma.faq({ id }).category()
            let categoryQuery = {};

            // preparing the query to update authours
            const categoryToConnect = differenceBy(category, map(existingCategory, 'id'))
            const categoryToDelete = differenceBy(map(existingCategory, 'id'), category)
            categoryQuery = {
              connect: categoryToConnect.map((categoryId) => {return {id: categoryId}}),
              disconnect: categoryToDelete.map((categoryId) => {return {id: categoryId}})
            }

            

            
            /** Executing the query */
            const faq = await ctx.prisma.updateFaq({
              data: {
                title,
                description,
                short_description,
                slug,
                vertical,
                category: categoryQuery,
                readingTime,
                order,
                variant: {set: variant},
                tag: {set: tag},
                authors: authorsQuery
              },
              where: { id }
            }, info)
      
            return faq
        },
        async deleteFaq (parent, args, ctx, info) {
          const { id } = args
    
          /** Executing the query */
          const faq = await ctx.prisma.deleteFaq(
            {
             id
            },
              info
            );
    
          return faq
      },

    },

    Faq: {
      authors: (parent, args, ctx, info) => {
        return ctx.prisma.faq({
          id: parent.id
        }).authors()
      },
      category: (parent, args, ctx, info) => {
        return ctx.prisma.faq({
          id: parent.id
        }).category()
      }
    },
    
}
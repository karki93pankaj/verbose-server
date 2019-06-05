import slugify from 'slugify'
import split from 'lodash/split'
import forEach from 'lodash/forEach'

import { importPages } from '../ingestor/pages'

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
      const items = await ctx.prisma.pages({...args}, info);
      const total_count = await ctx.prisma.pagesConnection().aggregate().count();
      return {
        items,
        meta: { total_count, hit_count : items.length },
      }

    },
    async page(parent, args, ctx, info) {
      return ctx.prisma.page(args, info);
    },
    async generatePageUrl (parent, args, ctx, info) {
      const { slug, type, vertical } = args
      
      if (type === 'PAGE' || type === 'STATIC') {
        // keep the `/` in `url` from `slug` for static and page
        const urlArr = split(slug, '/');
        let url = '';
        forEach(urlArr, elem => {
          if(elem !== '') url += `/${slugify(elem, { lower: true })}`;
        })
        return { url }
      }
      else if (type === 'ARTICLE') {
        return { url: `/${vertical}/articles/${slugify(slug, { lower: true })}` }
      }
      else if (type === 'NEWS') {
        const newsSlug = vertical === 'home-loans' ? 'mortgage-news' : 'news'
        return { url: `/${vertical}/${newsSlug}/${slugify(slug, { lower: true })}` }
      }
      else if (type === 'GUIDE') {
        return { url: `/${vertical}/guide` }
      }
    },
  },
  Mutation: {
    async upsertPage (parent, args, ctx, info) {
      const { id, media, title, slug, url, type, vertical, template, status, content } = args

      const mediaQuery = media ? { connect: { id: media } } : null

      const page = await ctx.prisma.upsertPage({
        where: {
          id
        },
        update: {
          media: mediaQuery,
          title,
          slug,
          url,
          type,
          content,
          vertical,
          template,
          status,
        },
        create: {
          media: mediaQuery,
          title,
          slug,
          url,
          type,
          vertical,
          content,
          template,
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
          else if(section.type == 'PageFaq') {
            return await ctx.prisma.updatePageFaq(query)
          }
          else if(section.type == 'PageFaqAccordion') {
            return await ctx.prisma.updatePageFaqAccordion(query)
          }
        } catch(e) {
          return section
        }
      })

      return sectionsOrderData[0].then((data) => ({ id: data.id }))
    },
    async reingestPages (parent, args, ctx, info) {
      return await importPages()
    }, 
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
    faqs: (parent, args, ctx, info) => {
      return ctx.prisma.page({
        id: parent.id
      }).faqs()
    },
    faqAccordion: (parent, args, ctx, info) => {
      return ctx.prisma.page({
        id: parent.id
      }).faqAccordion()
    },
    grids : (parent, args, ctx, info) => {
      return ctx.prisma.page({
        id: parent.id
      }).grids()
    }
  },
 
}
import differentWith from 'lodash/differenceWith'
import isEmpty from 'lodash/isEmpty'

const compareItemId = (item1, item2) => item1.id == item2.id
export default {
    Query: {
        async grids(parent, args, ctx, info) {
            // if (!ctx.req.userId) {
            //     throw new Error('You must be logged in!');
            // }
            // 2. Check if the user has the permissions to query all the users
            // hasPermission(ctx.request.user, ['ADMIN', 'PERMISSIONUPDATE']);
    
            // 2. if they do, query all the faqs!
            return ctx.prisma.grids();
        },
        async grid(parent, args, ctx, info) {
            return ctx.prisma.grid(args, info);
        },
    },
    Mutation: {
        async upsertGrid (parent, args, ctx, info) {
            const { id, title, content, order, page } = args
            const items = args.items.map(item => ({
                ...item,
                media: item.media ? { connect: { id: item.media } } : null
            }))

            let gridItems
            let grid = await ctx.prisma.grid({ id })

            if ( isEmpty(grid) ) {
                grid = await ctx.prisma.createGrid({
                    page: { 
                        connect: { id: page }
                    }
                })
            } else {
                gridItems = await ctx.prisma.grid({ id }).items()
            }

            const createGridItems = differentWith(items, gridItems, compareItemId)

            let gridItemsToUpdate = differentWith(items, createGridItems, compareItemId)
            if (!isEmpty(gridItemsToUpdate)) {
                for (let item of gridItemsToUpdate) {
                    if (!item.media) {
                        const media = await ctx.prisma.gridItem({ id: item.id }).media()
                        item.media = media ? { disconnect: true } : null
                    }
                }
            }
            const updateGridItems = gridItemsToUpdate.map(item => {
                const { id, ...data } = item
                return {
                    where: { id },
                    data
                }
            })

            const deleteGridItems = !isEmpty(gridItems)  
                ?  differentWith(gridItems,
                    items,
                    compareItemId
                  ).map(item => ({ id: item.id }))
                : null

            const itemsQuery = Object.assign({},
                !isEmpty(createGridItems) && { create: createGridItems },
                !isEmpty(updateGridItems) && { update: updateGridItems },
                !isEmpty(deleteGridItems) && { delete: deleteGridItems }
            )
            console.log("itemsQuery", JSON.stringify(itemsQuery))
            const data = {
                title,
                content,
                order,
                items: itemsQuery
            }
            return await ctx.prisma.updateGrid({
              where: {
                id: grid.id
              },
              data,
            }) 
        },
        async deleteGrid (parent, args, ctx, info) {
            const { id } = args
      
            const grid = await ctx.prisma.deleteGrid({
              id
            }, info)
      
            return grid
          },
    },
    Grid: {
        items: async function (parent, args, ctx) {
            return await ctx.prisma.grid({id: parent.id}).items()
        }
    },
    GridItem: {
        media: async function (parent, args, ctx) {
            return await ctx.prisma.gridItem({ id: parent.id }).media()
        }
    }
}
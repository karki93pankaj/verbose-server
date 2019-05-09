import map from 'lodash/map'

export default {
  Query: {
  },
  Mutation: {
    async upsertProsAndCons (parent, args, ctx, info) {
      const { id, page, title, pros, cons, order } = args

      const existingPros = await ctx.prisma.prosAndCons({ id }).pros()
      const existingCons = await ctx.prisma.prosAndCons({ id }).cons()

      const prosToDelete = map(existingPros, elem => ({id: elem.id}))
      const consToDelete = map(existingCons, elem => ({id: elem.id}))

      const prosAndCons = await ctx.prisma.upsertProsAndCons({
        where: {
          id
        },
        update: {
          page: {
            connect: { id: page }
          },
          title,
          pros: {
            create: pros,
            delete: prosToDelete
          },
          cons: {
            create: cons,
            delete: consToDelete
          },
          order,
        },
        create: {
          page: {
            connect: { id: page }
          },
          title,
          pros: {
            create: pros,
          },
          cons: {
            create: cons,
          },
          order,
        }
      })
      return prosAndCons
    },
    async deleteProsAndCons (parent, args, ctx, info) {
      const { id } = args

      const prosAndCons = await ctx.prisma.deleteProsAndCons({
        id
      }, info)

      return prosAndCons
    },
  },
  ProsAndCons: {
    pros: (parent, args, ctx, info) => {
      return ctx.prisma.prosAndCons({
        id: parent.id
      }).pros()
    },
    cons: (parent, args, ctx, info) => {
      return ctx.prisma.prosAndCons({
        id: parent.id
      }).cons()
    }
  },
}
import { rcPagesMigrate } from '../migration/rcPage'

export default {
  Query: {
  },
  Mutation: {
    async migrateRcPages (parent, args, ctx, info) {
      await rcPagesMigrate()
      return { status: true }
    }, 
  },
}
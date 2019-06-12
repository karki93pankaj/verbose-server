import isEmpty from 'lodash/isEmpty'

export const getAndFilterQuery = (filter, filterType = 'contains') => {
    let containsQuery = []
    for (let key in filter) {
        filter[key] && containsQuery.push({
        [`${key}_${filterType}`]: filter[key]
      })
    }
    return isEmpty(containsQuery) ? {}
      : { where: { AND: containsQuery } }
}
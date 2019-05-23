import { getVerticalName } from './verticals'

export default (data) => {
  if (!data || !data.vertical) { return data }
  const verticalName = getVerticalName(data.vertical)
  data.vertical = verticalName !== '' ? verticalName : 'nonspecific'
  return data
}
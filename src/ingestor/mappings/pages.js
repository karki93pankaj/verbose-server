import { entityTypes } from '../libs/elasticSearchUtils'

export default {
  [entityTypes.PAGES]: {
    dynamic_templates: [
      {
        long_as_double: {
          match_mapping_type: 'long',
          mapping: {
            type: 'double',
          },
        },
      },
    ],
    properties: {
      url: {
        type: 'keyword',
      },
      cannedSearchGroup: {
        type: 'keyword',
      },
      userJourneyStage: {
        type: 'keyword',
      },
      rankingScore: {
        type: 'double',
      },
    },
  },
}

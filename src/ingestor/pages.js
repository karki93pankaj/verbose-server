import map from 'lodash/map'
import findIndex from 'lodash/findIndex'
import merge from 'lodash/merge'
import remove from 'lodash/remove'

import { prisma } from '../generated/prisma-client'
import client, {
  updateElasticSearchAlias,
  importData,
  entityTypes,
  generateIndexName,
} from './libs/elasticSearchUtils'
import KeystoneAPIClient from './libs/keystone/apiClient'
import mappings from './mappings/pages'
import extractKeystonePageData from './libs/extractKeystonePageData'
import extractVerbosePageData from './libs/extractVerbosePageData'

async function createPagesIndex (indexName) {
  await client.indices.create({
    index: indexName,
    body: {
      mappings,
    },
  })
  return client.indices.refresh({index: indexName})
}

async function getVerbosePages() {
  const fragment = `
    fragment PageWithAllData on Page {
      id
      title
      slug
      type
      vertical
      status
      media {
        id
        url
      }
      blocks {
        id
        title
        video
        style
        content
        order
        media {
          id
          url
        }
      }
      boxes {
        id
        title
        video
        style
        content
        order
        media {
          id
          url
        }
      }
      alertBoxes {
        id
        title
        content
        prefix
        style
        order
      }
      quickTips {
        id
        title
        content
        buttonText
        buttonLink
        order
        media {
          id
          url
        }
      }
      prosAndCons {
        id
        title
        order
        pros {
          id
          content
        }
        cons {
          id
          content
        }
      }
      faqAccordion {
        id
        faqCategory {
          id
          name
          description
          slug
          faqs {
            id
            title
            description
            slug
            vertical
            variant
            tag
          }
        }
        order
      }
      faqs {
        id
        order
        faq {
          id
          title
          description
          slug
          vertical
          variant
          tag
        }
      }
    }
  `

  return prisma.pages().$fragment(fragment)
}

async function getKeystonePages() {
  const keystonePages = await new KeystoneAPIClient().getFeed('pages')
  return keystonePages
}

async function getFilteredVerbosePages() {
  const verbosePages = await getVerbosePages()
  remove(verbosePages, verbosePage => {
    return verbosePage.slug === '' || verbosePage.status === 'DRAFT'
  })
  return verbosePages
}

async function fetchPages () {

  const verbosePages = await getFilteredVerbosePages()
  const keystonePages = await getKeystonePages()

  // only works for type = `PAGE` for now, as its url matches to the url on ultimate
  // article and news will have slug including the vertical slug
  const pages = map(verbosePages, verbosePage => {
    const keystonePageIndex = findIndex(keystonePages, { url: verbosePage.slug })
    return merge(extractVerbosePageData(verbosePage), extractKeystonePageData(keystonePages[keystonePageIndex]))
  })

  return pages
}

export async function importPages () {
  const { aliasName, indexName } = generateIndexName(entityTypes.PAGES)
  const pages = await fetchPages()

  const pageResponse = { status: true }
  try {
    await createPagesIndex(indexName)
    await importData(indexName, entityTypes.PAGES, pages, 'id', 300)
    await updateElasticSearchAlias(aliasName, indexName)
  }
  catch(e) {
    pageResponse.status = false
  }

  return pageResponse
}
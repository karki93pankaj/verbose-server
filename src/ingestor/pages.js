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
import extractContentPageData from './libs/extractContentPageData'

async function createPagesIndex (indexName) {
  await client.indices.create({
    index: indexName,
    body: {
      mappings,
    },
  })
  return client.indices.refresh({index: indexName})
}

async function getContentPages() {
  const fragment = `
    fragment PageWithAllData on Page {
      id
      title
      slug
      url
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
        alignment
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
        alignment
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

async function getFilteredContentPages() {
  const contentPages = await getContentPages()
  remove(contentPages, contentPage => {
    return contentPage.slug === '' || contentPage.status === 'DRAFT'
  })
  return contentPages
}

async function fetchPages () {

  const contentPages = await getFilteredContentPages()
  const keystonePages = await getKeystonePages()

  const pages = map(contentPages, contentPage => {
    const keystonePageIndex = findIndex(keystonePages, { url: contentPage.url })
    return merge(extractContentPageData(contentPage), extractKeystonePageData(keystonePages[keystonePageIndex]))
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
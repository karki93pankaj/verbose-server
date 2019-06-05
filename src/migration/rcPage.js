import join from 'lodash/join'
import forEach from 'lodash/forEach'
import uniqBy from 'lodash/uniqBy'

import { prisma } from '../generated/prisma-client'
import { getWordpressFeedAsJson } from './utils'

const deleteAllPages = async () => {
  await prisma.deleteManyBlocks()
  await prisma.deleteManyBoxes()
  await prisma.deleteManyAlertBoxes()
  await prisma.deleteManyQuickTips()
  await prisma.deleteManyMedias()
  await prisma.deleteManyComponents()
  const deleteCount = await prisma.deleteManyPages()
  console.log('Total Deleted Pages: ', deleteCount);
}

const insertComponent = async (section, pageId) => {
  const component = await prisma.createComponent({
    page: {
      connect: { id: pageId }
    },
    component: section.component,
    order: parseOrder(section.order),
  })
}

const parseOrder = (order) => {
  let parsedOrder = 0
  try {
    parsedOrder = parseInt(order, 10)
  } catch (e) {}

  return parsedOrder
}

const getMediaQuery = async (url) => {
  let mediaId = null
  if(url) {
    const media = await prisma.media({ url: url })
    if(media) {
      mediaId = media.id
    } else {
      const createMediaData = await prisma.createMedia({
        url
      })
      mediaId = createMediaData.id
    }
  }
  return mediaId ? { connect: { id: mediaId } } : null
}


const insertSubsection = async (section, pageId) => {

  const formatType = [
    { formats: ['box-white', 'box-grey', 'box-vertical'], type: 'Box' },
    { formats: ['tip', 'tip-star', 'disclaimer', 'warning', 'info'], type: 'AlertBox' },
    { formats: ['quick-tip'], type: 'QuickTip' },
  ]

  forEach(formatType, formatTypeRow => {
    forEach(formatTypeRow.formats, format => {
      if (section.format && section.format.includes(format)) {
        section.type = formatTypeRow.type
        section.formatTypeFormat = format
      }
    })
  })

  if (section.type === 'Box') {
    await insertBox(section, pageId);
  } else if(section.type === 'AlertBox') {
    await insertAlertBox(section, pageId)
  } else if (section.type === 'QuickTip') {
    await insertQuickTip(section, pageId)
  } else {
    await insertBlock(section, pageId)
  }

  return '';
}

const insertBox = async (section, pageId) => {
  const mediaQuery = await getMediaQuery(section.image)

  let style = 'white'
  if (section.format.includes('box-grey')) style = 'grey'
  else if (section.format.includes('box-vertical')) style = 'vertical'

  let alignment = 'content-right'
  if(section.format.includes('align-content-left') && !section.format.includes('align-content-left-column'))
    alignment = 'content-left'
  else if (section.format.includes('align-content-left-column'))
    alignment = 'content-left-column'
  else if (section.format.includes('align-content-right-column'))
    alignment = 'content-right-column'

  const box = await prisma.createBox({
      page: {
        connect: { id: pageId }
      },
      media: mediaQuery,
      title: section.title,
      video: section.video,
      style: style,
      alignment: alignment,
      content: section.content,
      order: parseOrder(section.order),
  })
}

const insertAlertBox = async (section, pageId) => {
  let style = 'tip'
  if (section.format.includes('disclaimer')) style = 'disclaimer'
  else if (section.format.includes('warning')) style = 'warning'
  else if (section.format.includes('info')) style = 'info'

  let prefix = ''
  if (section.format.includes('alert-box-add-prefix')) {
    if (section.format.includes('tip')) prefix = 'Tip: '
    if (section.format.includes('disclaimer')) prefix = 'Disclaimer: '
    if (section.format.includes('warning')) prefix = 'Warning: '
    if (section.format.includes('info')) prefix = 'Info: '
  }
  prefix = section.buttonText || prefix

  const alertBox = await prisma.createAlertBox({
      page: {
        connect: { id: pageId }
      },
      title: section.title,
      style: style,
      prefix,
      content: section.content,
      order: parseOrder(section.order),
  })
}

const insertQuickTip = async (section, pageId) => {
  const mediaQuery = await getMediaQuery(section.image)
  const quickTip = await prisma.createQuickTip({
      page: {
        connect: { id: pageId }
      },
      media: mediaQuery,
      title: section.title,
      content: section.content,
      buttonText: section.buttonText,
      buttonLink: section.url,
      order: parseOrder(section.order),
  })
}

const insertBlock = async (section, pageId) => {
  const mediaQuery = await getMediaQuery(section.image)

  let alignment = 'full-width'
  if(section.format.includes('align-content-left') && !section.format.includes('align-content-left-column'))
    alignment = 'content-left'
  else if (section.format.includes('align-content-left-column'))
    alignment = 'content-left-column'
  else if(section.format.includes('align-content-right') && !section.format.includes('align-content-right-column'))
  alignment = 'content-right'
  else if (section.format.includes('align-content-right-column'))
    alignment = 'content-right-column'

  const block = await prisma.createBlock({
      page: {
        connect: { id: pageId }
      },
      media: mediaQuery,
      title: section.title,
      video: section.video,
      alignment: alignment,
      content: section.content,
      order: parseOrder(section.order),
  })
}


export const rcPagesMigrate = async () => {
  // delete all pages
  // await deleteAllPages();

  let wordPressMeta = await getWordpressFeedAsJson('ratecity_page')
  wordPressMeta = uniqBy(wordPressMeta, 'url')

  for(let elem of wordPressMeta) {
    if(elem.url) {

      /** Featured Image */  
      const mediaQuery = await getMediaQuery(elem.featured_image)

      /** Page */
      const page = await prisma.page({ url: elem.url })
      if(!page) {

        let createPageData = {}
        try {
          createPageData = await prisma.createPage({
            title: elem['_yoast_wpseo_title'] || elem['title'],
            slug: elem.url,
            url: elem.url,
            type: 'PAGE',
            status: 'PUBLISHED',
            media: mediaQuery,
            header: elem['page_header'],
            tagline: elem['page_subheader'], 
            resultName: elem['result_name'],
            description: elem['_yoast_wpseo_metadesc'],
            keywords: elem['_yoast_wpseo_focuskw'],
            canonical: elem['_yoast_wpseo_canonical'],
            category: join(elem.category, ', '),
            userJourneyStage: elem['user_journey_stage'],
            content: elem['long_blurb'] || elem['content:encoded'],
            contentSummary: elem['short_blurb'],
          })
        }
        catch (e) {console.log('error, creating page, url already exists');}

          /** JSON SECTIONS */
          if(createPageData.id) {
            let jsonSections = []
            try {
              jsonSections = JSON.parse(elem.sections)
            } catch(e) {}

            if(jsonSections) {

              for(let section of jsonSections) {

                /**          
                title: '', -- good
                format: '', // have to parse
                component: 'TalkToUs', -- good insert into component
                image: '', // have to remove https: or http: // only on box and block (align-content-left)
                video: '', // only on `block`
                url: '', `buttonLink` on `QuickTip`, `linkUrl` on GridItem
                buttonText: '', `buttonText` on `QuickTip`, `linkText` on GridItem, `prefix` on tip
                content: '', - good
                order: '11' - good
                */

                // if component found then insert to component directly
                // component only needs - component data and order

                // if not then start parsing the format
                // start with other subsection
                // if no subsection then its a `block`

                // order - try parse int, if failed set to 0
                
                if (section.component !== '') {
                  await insertComponent(section, createPageData.id)
                }
                else {
                  await insertSubsection(section, createPageData.id)
                }

              }
            }
          }
      }
    }
  }
  /** There is no vertical, faq_url and faq_type data on RC-Pages */
  /** textContent as content, textSummary as contentSummary*/
  /** og, google, twitter is not defined on any RC-pages */
  /** no case-study on RC-Pages */

  console.log(wordPressMeta.length, 'Data length');
}
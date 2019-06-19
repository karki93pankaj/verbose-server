import map from 'lodash/map'
import get from 'lodash/get'
import union from 'lodash/union'

export default (contentPage) => {
  const faqs = map(contentPage.faqs, faq => ({
    render: 'block',
    order: faq.order,
    data: [{
      description: get(faq, 'faq.description'),
      tag: get(faq, 'faq.tag'),
      variant: get(faq, 'faq.variant'),
      slug: get(faq, 'faq.slug'),
      vertical: get(faq, 'faq.vertical'),
      title: get(faq, 'faq.title'),
    }]
  }))

  const faqAccordion = map(contentPage.faqAccordion, elem => ({
    name: elem.faqCategory.name,
    render: 'accordion',
    order: elem.order,
    data: map(elem.faqCategory.faqs, faq => ({
      description: get(faq, 'description'),
      tag: get(faq, 'tag'),
      variant: get(faq, 'variant'),
      slug: get(faq, 'slug'),
      vertical: get(faq, 'vertical'),
      title: get(faq, 'title'),
    }))
  }))

  const blocks = map(contentPage.blocks, block => ({
    alignment: block.alignment,
    order: block.order,
    video: block.video,
    content: block.content,
    media: {
      url: block.media && block.media.url,
    },
    title: block.title,
    top: block.top,
  }))

  const boxes = map(contentPage.boxes, box => ({
    style: box.style,
    alignment: box.alignment,
    order: box.order,
    video: box.video,
    content: box.content,
    media: {
      url: box.media && box.media.url,
    },
    title: box.title,
    top: box.top,
  }))

  const alertBoxes = map(contentPage.alertBoxes, alertBox => ({
    style: alertBox.style,
    prefix: alertBox.prefix,
    order: alertBox.order,
    content: alertBox.content,
    title: alertBox.title,
    top: alertBox.top,
  }))

  const quickTips = map(contentPage.quickTips, quickTip => ({
    order: quickTip.order,
    buttonText: quickTip.buttonText,
    buttonLink: quickTip.buttonLink,
    content: quickTip.content,
    media: {
      url: quickTip.media && quickTip.media.url,
    },
    title: quickTip.title,
    top: quickTip.top,
  }))

  const prosAndCons = map(contentPage.prosAndCons, prosAndConsElem => ({
    pros: map(prosAndConsElem.pros, pro => pro.content),
    cons: map(prosAndConsElem.cons, con => con.content),
    order: prosAndConsElem.order,
    title: prosAndConsElem.title,
    top: prosAndConsElem.top,
  }))

  const grids = map(contentPage.grids, grid => ({
    order: grid.order,
    title: grid.title,
    content: grid.content,
    media: {
      url: grid.media && grid.media.url,
    },
    items: map(grid.items, item => ({
      title: item.title,
      content: item.content,
      linkText: item.linkText,
      linkUrl: item.linkUrl,
      media: {
        url: item.media && item.media.url,
      },
    }))
  }))

  const page = {
    id: contentPage.id,
    vertical: contentPage.vertical,
    status: contentPage.status,
    media: {
      url: contentPage.media && contentPage.media.url,
    },
    title: contentPage.title,
    type: contentPage.type,
    slug: contentPage.slug,
    faqs: union(faqs, faqAccordion),
    blocks,
    boxes,
    alertBoxes,
    quickTips,
    prosAndCons,
    grids,
  }

  return page
}

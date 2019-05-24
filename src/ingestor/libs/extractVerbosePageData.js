import map from 'lodash/map'
import get from 'lodash/get'
import union from 'lodash/union'

export default (verbosePage) => {
  const faqs = map(verbosePage.faqs, faq => ({
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

  const faqAccordion = map(verbosePage.faqAccordion, elem => ({
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

  const blocks = map(verbosePage.blocks, block => ({
    alignment: block.alignment,
    order: block.order,
    video: block.video,
    content: block.content,
    media: {
      url: block.media && block.media.url,
    },
    title: block.title,
  }))

  const boxes = map(verbosePage.boxes, box => ({
    style: box.style,
    alignment: box.alignment,
    order: box.order,
    video: box.video,
    content: box.content,
    media: {
      url: box.media && box.media.url,
    },
    title: box.title,
  }))

  const alertBoxes = map(verbosePage.alertBoxes, alertBox => ({
    style: alertBox.style,
    prefix: alertBox.prefix,
    order: alertBox.order,
    content: alertBox.content,
    title: alertBox.title,
  }))

  const quickTips = map(verbosePage.quickTips, quickTip => ({
    order: quickTip.order,
    buttonText: quickTip.buttonText,
    buttonLink: quickTip.buttonLink,
    content: quickTip.content,
    media: {
      url: quickTip.media && quickTip.media.url,
    },
    title: quickTip.title,
  }))

  const prosAndCons = map(verbosePage.prosAndCons, prosAndConsElem => ({
    pros: map(prosAndConsElem.pros, pro => pro.content),
    cons: map(prosAndConsElem.cons, con => con.content),
    order: prosAndConsElem.order,
    title: prosAndConsElem.title,
  }))

  const page = {
    id: verbosePage.id,
    vertical: verbosePage.vertical,
    status: verbosePage.status,
    media: {
      url: verbosePage.media && verbosePage.media.url,
    },
    title: verbosePage.title,
    type: verbosePage.type,
    slug: verbosePage.slug,
    faqs: union(faqs, faqAccordion),
    blocks,
    boxes,
    alertBoxes,
    quickTips,
    prosAndCons,
  }

  return page
}

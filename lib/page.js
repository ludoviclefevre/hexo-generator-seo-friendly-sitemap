const _ = require('lodash')

const page = function(locals, config) {
  const isExcluded = function(page) {
    if (page.sitemap === false) {
      return true
    }
    if (!page.layout || page.layout === 'false') {
      return true
    }
    return false
  }

  const get = function() {
    if (locals.pages.length === 0) {
      return
    }
    const pages = _(locals.pages.toArray())
      .reject(isExcluded)
      .orderBy('updated', 'desc')
      .value()

    const lastUpdatedPage = _.chain(pages)
      .first()
      .get('updated')
      .value()

    return {
      template: 'page-sitemap.ejs',
      filename: 'page-sitemap.xml',
      data: {
        items: pages
      },
      lastModification: lastUpdatedPage,
      isInIndexSitemap: true
    }
  }

  return {
    get: get
  }
}

module.exports = page

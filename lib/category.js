const _ = require('lodash'),
  common = require('./common')

const mentionedInPosts = function(category) {
  return category.posts.length > 0
}

const category = function(locals, config) {
  const get = function() {
    if (config.sitemap && config.sitemap.category === false) {
      return
    }
    if (locals.categories.length === 0) {
      return
    }

    const categories = _(locals.categories.toArray())
      .filter(mentionedInPosts)
      .map(common.setItemLastUpdate)
      .sortBy(common.lastModified)
      .reverse()
      .value()

    const lastUpdatedCategory = common.lastModified(_.first(categories))

    return {
      template: 'category-sitemap.ejs',
      filename: 'category-sitemap.xml',
      data: {
        items: categories
      },
      lastModification: lastUpdatedCategory,
      isInIndexSitemap: true
    }
  }

  return {
    get: get
  }
}

module.exports = category

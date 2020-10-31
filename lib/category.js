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
      .sortBy('updated')
      .reverse()
      .value()

    const lastUpdatedCategory = _.chain(categories)
      .first()
      .get('updated')
      .value()

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

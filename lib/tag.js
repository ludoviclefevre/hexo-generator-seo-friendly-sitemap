var _ = require('lodash'),
  common = require('./common')

var mentionedInPosts = function(tag) {
  return tag.posts.length > 0
}

var tag = function(locals, config) {
  var get = function() {
    if (config.sitemap && config.sitemap.tag === false) {
      return
    }
    if (locals.tags.length === 0) {
      return
    }

    var tags = _(locals.tags.toArray())
      .filter(mentionedInPosts)
      .map(common.setItemLastUpdate)
      .sortBy('updated')
      .reverse()
      .value()

    var lastUpdatedTag = _.chain(tags)
      .first()
      .get('updated')
      .value()

    return {
      template: 'tag-sitemap.ejs',
      filename: 'tag-sitemap.xml',
      data: {
        items: tags
      },
      lastModification: lastUpdatedTag,
      isInIndexSitemap: true
    }
  }

  return {
    get: get
  }
}

module.exports = tag

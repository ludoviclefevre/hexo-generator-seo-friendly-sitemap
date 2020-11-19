const Promise = require('bluebird'),
  common = require('./common'),
  _ = require('lodash')

const seoFriendlySitemap = function(locals) {
  const config = this.config,
    posts = require('./post')(locals, config),
    pages = require('./page')(locals, config),
    categories = require('./category')(locals, config),
    tags = require('./tag')(locals, config),
    xsl = require('./xsl')(locals, config),
    indexSitemap = require('./indexSitemap')(locals, config),
    render = require('./render')(locals, config),
    sitemaps = _.concat(posts.get(), pages.get(), categories.get(), tags.get(), xsl.get())

  if (config.sitemap.additionalUrl) {
    sitemaps.push(
      Promise.resolve({
        filename: config.sitemap.additionalUrl.filename,
        lastModification: config.sitemap.additionalUrl.lastModification,
        isInIndexSitemap: true
      })
    )
  }

  return Promise.all(sitemaps)
    .filter(common.isDefined)
    .then(indexSitemap.get)
    .map(render)
}

module.exports = seoFriendlySitemap

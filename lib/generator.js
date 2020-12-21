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
    if(_.isArray(config.sitemap.additionalUrl)) {
      _.each(config.sitemap.additionalUrl, sitemap=>{
        sitemaps.push(Promise.resolve({
          filename: sitemap.filename,
          lastModification: sitemap.lastModification,
          isInIndexSitemap: true
        }))})
    } else {
      sitemaps.push(
        Promise.resolve({
          filename: config.sitemap.additionalUrl.filename,
          lastModification: config.sitemap.additionalUrl.lastModification,
          isInIndexSitemap: true
        })
      )
    }
  }

  return Promise.all(sitemaps)
    .filter(common.isDefined)
    .then(indexSitemap.get)
    .map(render)
}

module.exports = seoFriendlySitemap

const _ = require('lodash'),
  common = require('./common'),
  urljoin = require('url-join')

const indexSitemap = function(locals, config) {
  const get = function(filePaths) {
    const indexSitemapItems = _.chain(filePaths)
      .filter('isInIndexSitemap')
      .map(getIndexSitemapItem)
      .value()

    filePaths.push({
      template: 'index-sitemap.ejs',
      filename: common.getIndexSitemapFilename(config),
      data: {
        items: indexSitemapItems
      }
    })
    return filePaths
  }

  const getIndexSitemapItem = function(item) {
    return {
      url: urljoin(config.url, item.filename),
      lastModification: item.lastModification
    }
  }

  return {
    get
  }
}

module.exports = indexSitemap

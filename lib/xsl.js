const common = require('./common')

const xsl = function(locals, config) {
  const get = function() {
    return {
      template: 'sitemapXsl.ejs',
      filename: 'sitemap.xsl',
      data: {
        indexSitemapUrl: common.getIndexSitemapFilename(config)
      },
      isInIndexSitemap: false
    }
  }

  return {
    get: get
  }
}

module.exports = xsl

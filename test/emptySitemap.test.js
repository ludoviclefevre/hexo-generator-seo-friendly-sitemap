var Hexo = require('hexo'),
  path = require('path'),
  _ = require('lodash')

describe('SEO-friendly sitemap generator: Empty Sitemaps', function() {
  it('should only generate index sitemap and xsl files if posts, pages, categories and tags are not defined', function() {
    var hexo = new Hexo(__dirname, { silent: true }),
      generator = require(path.join(__dirname, '../lib/generator')).bind(hexo),
      locals,
      checkAssertions = function(result) {
        expect(result).toHaveLength(2)

        var xslSitemap = _.find(result, { path: 'sitemap.xsl' })
        expect(xslSitemap).toBeDefined()

        var indexSitemap = _.find(result, { path: 'sitemap.xml' })
        expect(indexSitemap).toBeDefined()
      }

    locals = hexo.locals.toObject()

    hexo.config.sitemap = {
      path: 'sitemap.xml'
    }

    return generator(locals).then(checkAssertions)
  })
})

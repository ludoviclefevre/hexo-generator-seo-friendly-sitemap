var Hexo = require('hexo'),
  path = require('path'),
  _ = require('lodash'),
  chai = require('chai'),
  should = chai.should();

describe('SEO-friendly sitemap generator: Empty Sitemaps', function () {
  it('should only generate index sitemap and xsl files if posts, pages, categories and tags are not defined', function () {
    var hexo = new Hexo(__dirname, {silent: true}),
      generator = require(path.join(__dirname, '../lib/generator')).bind(hexo),
      locals,
      checkAssertions = function (result) {
        result.should.have.length(2);

        var xslSitemap = _.find(result, {path: 'sitemap.xsl'});
        should.exist(xslSitemap);

        var indexSitemap = _.find(result, {path: 'sitemap.xml'});
        should.exist(indexSitemap);
      };

    locals = hexo.locals.toObject();

    hexo.config.sitemap = {
      path: 'sitemap.xml'
    };

    return generator(locals)
      .then(checkAssertions);
  });
});

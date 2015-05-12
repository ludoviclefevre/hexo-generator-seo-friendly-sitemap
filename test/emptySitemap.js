var chai = require("chai"),
    should = chai.should(),
    Hexo = require('hexo'),
    path = require('path'),
    _ = require('lodash');

describe('Sitemap generator', function () {
    var hexo = new Hexo(__dirname, {silent: true}),
        generator = require(path.join(__dirname, '../lib/generator')).bind(hexo),
        locals;

    before(function () {
        locals = hexo.locals.toObject();
    });

    it('should not generate sitemap files if posts, pages, categories and tags are not defined', function () {
        hexo.config.sitemap = {
            path: 'sitemap.xml'
        };

        var checkAssertions = function (result) {
            result.should.be.empty;
        };

        return generator(locals)
            .then(checkAssertions);
    });
});

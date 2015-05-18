'use strict';

var Hexo = require('hexo'),
    path = require('path');

describe('Hexo', function () {
    it('should not generate sitemap files if posts, pages, categories and tags are not defined', function () {
        var hexo = new Hexo(__dirname, {silent: true}),
            generator = require(path.join(__dirname, '../lib/generator')).bind(hexo),
            locals,
            checkAssertions = function (result) {
                return result.should.be.empty;
            };

        locals = hexo.locals.toObject();


        hexo.config.sitemap = {
            path: 'sitemap.xml'
        };

        return generator(locals)
            .then(checkAssertions);
    });
});

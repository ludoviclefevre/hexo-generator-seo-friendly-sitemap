var chai = require("chai"),
    should = chai.should(),
    Hexo = require('hexo'),
    path = require('path'),
    _ = require('lodash');

describe('Hexo', function () {
    it('should not generate sitemap files if posts, pages, categories and tags are not defined', function () {
        var hexo = new Hexo(__dirname, {silent: true}),
            generator = require(path.join(__dirname, '../lib/generator')).bind(hexo),
            locals,
            checkAssertions = function (result) {
                return result.should.be.empty;
            },
            result = [];

        locals = hexo.locals.toObject();


        hexo.config.sitemap = {
            path: 'sitemap.xml'
        };

        //result.should.be.empty;

        /*
         generator(locals)
         .then(checkAssertions)
         .finally(done);
         */

        return generator(locals)
            .then(checkAssertions);

    });
});

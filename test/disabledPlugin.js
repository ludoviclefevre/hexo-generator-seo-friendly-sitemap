'use strict';

var Hexo = require('hexo'),
    path = require('path');

describe('Hexo', function () {
    it('should not generate sitemap files if plugin is not enabled in _config.yml.', function () {
        var hexo = new Hexo(__dirname, {silent: true}),
            generator = require(path.join(__dirname, '../lib/generator')).bind(hexo),
            locals,
            checkAssertions = function (result) {
                return result.should.be.empty;
            };

        locals = hexo.locals.toObject();

        return generator(locals)
            .then(checkAssertions);
    });
});

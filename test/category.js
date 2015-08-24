(function () {
    'use strict';

    var Hexo = require('hexo'),
        path = require('path'),
        moment = require('moment'),
        _ = require('lodash'),
        chai = require('chai'),
        assert = chai.assert,
        category = require('../lib/category');

    var setPostCategory = function (posts) {
        var post = posts[1];
        return post.setCategories(['Category1']);
    };

    describe('SEO-friendly sitemap generator', function () {
        it('should not generate sitemap category file if no categories are mentioned in posts', function () {
            var hexo = new Hexo(__dirname, {silent: true}),
                generator = require(path.join(__dirname, '..', 'lib', 'generator')).bind(hexo),
                locals,
                checkAssertions = function (result) {
                    assert.isArray(result);
                    assert.lengthOf(result, 2);
                    assert.isFalse(_.some(result, {path: 'category-sitemap.xml'}));
                };

            locals = hexo.locals.toObject();

            hexo.config.sitemap = {
                path: 'sitemap.xml'
            };

            return generator(locals)
                .then(checkAssertions);
        });

        it('should generate sitemap category file', function () {
            var hexo = new Hexo(__dirname, {silent: true}),
                Post = hexo.model('Post'),
                generator = require(path.join(__dirname, '..', 'lib', 'generator')).bind(hexo),
                getHexoLocals = function () {
                    var locals = hexo.locals.toObject();
                    hexo.config.sitemap = {
                        path: 'sitemap.xml'
                    };
                    return locals;
                },
                checkAssertions = function (result) {
                    assert.isObject(result);
                    assert.isTrue(moment(result.lastModification).isSame(moment.utc([2015, 0, 2, 14])));
                    assert.isArray(result.items);
                    assert.lengthOf(result.items, 1);
                    assert.isTrue(_.some(result.items, {name: 'Category1'}));
                },
                posts = [
                    {source: 'foo', slug: 'foo', path: 'foo', updated: moment.utc([2015, 0, 1, 8]).toDate()},
                    {source: 'bar', slug: 'bar', path: 'bar', updated: moment.utc([2015, 0, 2, 14]).toDate()},
                    {source: 'baz', slug: 'baz', path: 'baz', updated: moment.utc([2015, 0, 3, 16]).toDate()}
                ];

            return Post.insert(posts)
                .then(setPostCategory)
                .then(getHexoLocals)
                .then(category)
                .call('get')
                .then(checkAssertions);
        });
    });
})();

var chai = require('chai'),
    should = chai.should(),
    Hexo = require('hexo'),
    path = require('path'),
    _ = require('lodash'),
    moment = require('moment'),
    Promise = require('bluebird'),
    fs = Promise.promisifyAll(require('fs')),

    readFileOptions = {
        encoding: 'utf8'
    },

    hexo = new Hexo(__dirname, {silent: true}),
    Post = hexo.model('Post'),
    Page = hexo.model('Page'),
    generator = require(path.join(__dirname, '../lib/generator')).bind(hexo),
    posts = [
        {source: 'foo', slug: 'foo', path: 'foo', updated: moment.utc([2015, 0, 1, 8]).toDate()},
        {source: 'bar', slug: 'bar', path: 'bar', updated: moment.utc([2015, 0, 2, 14]).toDate()},
        {source: 'baz', slug: 'baz', path: 'baz', updated: moment.utc([2015, 0, 3, 16]).toDate()}
    ],
    pages = [
        {source: 'Page 1', slug: 'Page 1', updated: moment.utc([2014, 11, 10, 9]).toDate(), path: 'page1'},
        {source: 'Page 2', slug: 'Page 2', updated: moment.utc([2014, 11, 15, 10]).toDate(), path: 'page2'},
        {source: 'Page 3', slug: 'Page 3', updated: moment.utc([2014, 11, 20, 11]).toDate(), path: 'page3'}
    ],
    locals,

    insertPosts = function () {
        return Post.insert(posts)
            .then(function (insertedPosts) {
                return Promise.all([
                    insertedPosts[0].setCategories(['Cat1']),
                    insertedPosts[0].setCategories(['Cat2']),
                    insertedPosts[1].setCategories(['Cat1']),
                    insertedPosts[0].setTags(['Tag1']),
                    insertedPosts[0].setTags(['Tag2']),
                    insertedPosts[1].setTags(['Tag'])
                ]);
            });
    };

before(function () {
    return Promise.all(
        [
            insertPosts(),
            Page.insert(pages)
        ])
        .then(function () {
            locals = hexo.locals.toObject();
        });
});

it('should generate all sitemap files if posts, pages, categories and tags are defined', function (done) {
    hexo.config.sitemap = {
        path: 'sitemap.xml'
    };

    var expectedDirectory = path.join(__dirname, 'expected'),

        expectedIndexFilePath = path.join(expectedDirectory, 'full-index-sitemap.xml'),
        expectedPostFilePath = path.join(expectedDirectory, 'full-post-sitemap.xml'),
        expectedPageFilePath = path.join(expectedDirectory, 'full-page-sitemap.xml'),
        expectedCategoryFilePath = path.join(expectedDirectory, 'full-category-sitemap.xml'),
        expectedTagFilePath = path.join(expectedDirectory, 'full-tag-sitemap.xml'),

        expectedIndexSitemap = fs.readFileAsync(expectedIndexFilePath, readFileOptions),
        expectedPostSitemap = fs.readFileAsync(expectedPostFilePath, readFileOptions),
        expectedPageSitemap = fs.readFileAsync(expectedPageFilePath, readFileOptions),
        expectedCategorySitemap = fs.readFileAsync(expectedCategoryFilePath, readFileOptions),
        expectedTagSitemap = fs.readFileAsync(expectedTagFilePath, readFileOptions),

        checkAssertions = function (result) {
            result.should.be.a('array');

            var indexSitemap = _.find(result, {path: 'index-sitemap.xml'}),
                postSitemap = _.find(result, {path: 'post-sitemap.xml'}),
                pageSitemap = _.find(result, {path: 'page-sitemap.xml'}),
                categorySitemap = _.find(result, {path: 'category-sitemap.xml'}),
                tagSitemap = _.find(result, {path: 'tag-sitemap.xml'});

            should.exist(indexSitemap);
            should.exist(indexSitemap.data);

            should.exist(postSitemap);
            should.exist(postSitemap.data);

            should.exist(pageSitemap);
            should.exist(pageSitemap.data);

            should.exist(categorySitemap);
            should.exist(categorySitemap.data);

            should.exist(tagSitemap);
            should.exist(tagSitemap.data);

            //console.log(indexSitemap.data);
            //fs.writeFileAsync(expectedTagFilePath, tagSitemap.data);
            return Promise.all([
                expectedIndexSitemap.then(function (buffer) {
                    indexSitemap.data.should.equal(buffer);
                }),
                expectedPostSitemap.then(function (buffer) {
                    postSitemap.data.should.equal(buffer);
                }),
                expectedPageSitemap.then(function (buffer) {
                    pageSitemap.data.should.equal(buffer);
                }),
                expectedCategorySitemap.then(function (buffer) {
                    categorySitemap.data.should.equal(buffer);
                }),
                expectedTagSitemap.then(function (buffer) {
                    tagSitemap.data.should.equal(buffer);
                })
            ]);
        };

    return generator(locals)
        .then(checkAssertions)
        .then(function () {
            hexo = null;
            done();
        });
});

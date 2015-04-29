var should = require('chai').should();
var Hexo = require('hexo');
var ejs = require('ejs');
var pathFn = require('path');
var fs = require('fs');
var _ = require('lodash');

var sitemapSrc = pathFn.join(__dirname, '../views/sitemap.ejs');
var sitemapTmpl = ejs.compile(fs.readFileSync(sitemapSrc, 'utf8'), {
    filename: sitemapSrc
});

describe('Sitemap generator', function () {
    var hexo = new Hexo(__dirname, {silent: true});
    var Post = hexo.model('Post');
    var generator = require(pathFn.join(__dirname, '../lib/generator')).bind(hexo);
    var posts;

    before(function () {
        return Post.insert([
            {source: 'foo', slug: 'foo', updated: 1e8},
            {source: 'bar', slug: 'bar', updated: 1e8 + 1},
            {source: 'baz', slug: 'baz', updated: 1e8 - 1}
        ]).then(function (data) {
            posts = Post.sort('-updated');
        });
    });

    it('default', function (done) {
        hexo.config.sitemap = {
            path: 'sitemap.xml'
        };

        generator(hexo.locals.toObject()).then(function (result) {
            result.should.be.a('array');

            var indexSitemap = _.find(result, {path: 'index-sitemap.xml'});
            should.exist(indexSitemap);
            should.exist(indexSitemap.data);

            var postSitemap = _.find(result, {path: 'post-sitemap.xml'});
            should.exist(postSitemap);
            should.exist(postSitemap.data);

            /*
            indexSitemap.data.should.eql(sitemapTmpl({
                config: hexo.config,
                posts: posts
            }));
            */
            done();
        })
            .catch(function (err) {
                done(err);
            });


        /*
         getJSONFromSomewhere().then(function (jsonString) {
         return JSON.parse(jsonString);
         }).then(function (object) {
         console.log("it was valid json: ", object);
         }).catch(SyntaxError, function (e) {
         console.log("don't be evil");
         });
         */


    });
});

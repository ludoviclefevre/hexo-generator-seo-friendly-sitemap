var path = require('path'),
    ejs = require('ejs'),
    _ = require('lodash'),
    Promise = require('bluebird'),
    fs = Promise.promisifyAll(require('fs'));

var googleFriendlySitemap = function (locals) {
    "use strict"

    var config = this.config,
        viewPath = path.join(__dirname, '../views/'),
        readFileOptions = {
            encoding: 'utf8'
        },

        postInSitemap = function (post) {
            return post.sitemap !== false && post.published;
        },

        setItemLastUpdate = function (item) {
            item.lastUpdated = _.max(item.posts.toArray(), function (post) {
                return post.updated.toDate();
            }).updated.toDate();
            return item;
        },

        posts,
        lastUpdatedPost,
        pages,
        lastUpdatedPage,
        categories,
        lastUpdatedCategory,
        tags,
        lastUpdatedTag,

        filePaths = [
            {
                template: 'sitemapXsl.ejs',
                filename: 'sitemap.xsl',
                isInIndexSitemap: false
            }
        ]

    if (locals.posts.length > 0) {
        posts = _(locals.posts.toArray())
            .filter(postInSitemap)
            .sortByOrder('updated', false)
            .value();

        lastUpdatedPost = _.chain(posts).first().get('updated').value();

        filePaths.push({
            template: 'post-sitemap.ejs',
            filename: 'post-sitemap.xml',
            items: posts,
            lastModification: lastUpdatedPost,
            isInIndexSitemap: true
        });
    }

    if (locals.pages.length > 0) {
        pages = _(locals.pages.toArray())
            .reject({sitemap: false})
            .sortByOrder('updated', false)
            .value();

        lastUpdatedPage = _.chain(pages).first().get('updated').value();

        filePaths.push({
            template: 'page-sitemap.ejs',
            filename: 'page-sitemap.xml',
            items: pages,
            lastModification: lastUpdatedPage,
            isInIndexSitemap: true
        });
    }

    if(locals.categories.length>0) {
        categories = _(locals.categories.toArray())
            .map(setItemLastUpdate)
            .sortByOrder('lastUpdated')
            .value();

        lastUpdatedCategory = _.chain(categories).first().get('lastUpdated').value();

        filePaths.push(            {
            template: 'category-sitemap.ejs',
            filename: 'category-sitemap.xml',
            items: categories,
            lastModification: lastUpdatedPost,
            isInIndexSitemap: true
        });
    }

    if(locals.tags.length>0) {
        tags = _(locals.tags.toArray())
            .map(setItemLastUpdate)
            .sortByOrder('lastUpdated')
            .value();

        lastUpdatedTag = _.chain(tags).first().get('lastUpdated').value();

        filePaths.push(             {
            template: 'tag-sitemap.ejs',
            filename: 'tag-sitemap.xml',
            items: tags,
            lastModification: lastUpdatedPost,
            isInIndexSitemap: true
        });
    }

    var getIndexSitemapItem = function (item) {
        return {
            url: config.url + '/' + item.filename,
            lastModification: item.lastModification
        };
    };

    var indexSitemapItems = _.chain(filePaths)
        .filter('isInIndexSitemap')
        .map(getIndexSitemapItem)
        .value();

    filePaths.push(
        {
            template: 'index-sitemap.ejs',
            filename: 'index-sitemap.xml',
            items: indexSitemapItems
        });

    var getFileContent = function(filePath) {
        return fs.readFileAsync(filePath, readFileOptions);
    };

    var getCompiledContent = function (data, filePath, templateContent) {
        var compiledTemplate = ejs.compile(templateContent, {
                filename: filePath
            }),
            xml = compiledTemplate({
                config: config,
                items: data.items
            });

        return {
            path: data.filename,
            data: xml
        };
    };

    var getSitemap = function (sitemap) {
        var filePath = path.join(viewPath, sitemap.template);
        //return getCompiledContent(item, filePath);
        return Promise.join(
            sitemap,
            filePath,
            getFileContent(filePath),
            getCompiledContent);
    };

    return Promise.map(filePaths, getSitemap);
};

module.exports = googleFriendlySitemap;

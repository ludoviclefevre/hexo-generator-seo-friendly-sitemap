'use strict';

var Hexo = require('hexo'),
  moment = require('moment'),
  _ = require('lodash'),
  Promise = require('bluebird'),
  chai = require('chai'),
  assert = chai.assert,
  category = require('../lib/category');

var instanciateHexo = function (category) {
  var hexo = new Hexo(__dirname, {silent: true});
  hexo.config.sitemap = {
    path: 'sitemap.xml'
  };
  if (category !== undefined) {
    hexo.config.sitemap.category = category;
  }
  hexo.config.permalink = ':title';
  hexo.init();
  return Promise.resolve(hexo);
};

var insertPosts = function (hexo) {
  var Post = hexo.model('Post');
  var mockedPosts = [
    {source: 'foo', slug: 'foo', path: 'foo', updated: moment.utc([2015, 0, 1, 8]).toDate()},
    {source: 'bar', slug: 'bar', path: 'bar', updated: moment.utc([2015, 0, 2, 14]).toDate()},
    {source: 'baz', slug: 'baz', path: 'baz', updated: moment.utc([2015, 0, 3, 16]).toDate()}
  ];
  return [hexo, Post.insert(mockedPosts)];
};

var setPostCategory = function (hexo, posts) {
  var post = posts[1];
  return [hexo, post.setCategories(['Category1'])];
};

var getHexoLocalsAndConfig = function (hexo) {
  return Promise.resolve([hexo.locals.toObject(), hexo.config]);
};

describe('SEO-friendly sitemap generator', function () {
  var applyCategory = function (args) {
    return category.apply(null, args);
  };

  it('should not generate sitemap category file if no categories are mentioned in posts', function () {
    var checkAssertions = function (result) {
      assert.isUndefined(result);
    };

    return instanciateHexo()
      .then(getHexoLocalsAndConfig)
      .then(applyCategory)
      .call('get')
      .then(checkAssertions);
  });

  it('should generate sitemap category data', function () {
    var checkAssertions = function (result) {
      assert.isObject(result);
      assert.isTrue(moment(result.lastModification).isSame(moment.utc([2015, 0, 2, 14])));
      assert.isArray(result.data.items);
      assert.lengthOf(result.data.items, 1);
      assert.isTrue(_.some(result.data.items, {name: 'Category1'}));
    };

    return instanciateHexo()
      .then(insertPosts)
      .spread(setPostCategory)
      .spread(getHexoLocalsAndConfig)
      .then(applyCategory)
      .call('get')
      .then(checkAssertions);
  });

  it('should not generate sitemap category file if config.sitemap.category set to false', function () {
    var checkAssertions = function (result) {
      assert.isUndefined(result);
    };

    return instanciateHexo(false)
      .then(insertPosts)
      .spread(setPostCategory)
      .spread(getHexoLocalsAndConfig)
      .then(applyCategory)
      .call('get')
      .then(checkAssertions);
  });
});

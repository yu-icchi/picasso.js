'use strict';

const _ = require('lodash');
const m = require('mithril');

const dynamicForm = require('./dynamic_form');
const menu = require('./menu');
const view = require('./view');
const error404 = require('./404');

const pageMap = {};
const route = {};

// 先にconfigを追加して
exports.add = function(config) {
  pageMap[config.key] = config;
};

// 外部から定義したComponentを追加する方法
exports.addRoute = function(url, commponent) {
  route[url] = commponent;
};

// initで追加されているconfigを元にメニューやラウティングを作る
exports.init = function(config) {

  // page route
  const mainEl = document.getElementById('main');

  let defaultRoute;
  if (config['error_404']) {
    console.log('404');
    defaultRoute = '/';
  } else {
    route['/404'] = error404; // default 404 page
    defaultRoute = '/404';
  }

  const menus = [];
  _.forEach(pageMap, (page) => {
    if (page.url && _.isString(page.url)) {
      route[page.url] = m.component(view, page);
      menus.push({
        title: page.title,
        url: page.url
      });
    }
  });
  m.route.mode = 'hash'; // m.routeよりも前に記述しておく必要がある
  m.route(mainEl, defaultRoute, route);

  // menu
  const menuEl = document.getElementById('menu');
  const menuComponent = m.component(menu, {menus});
  m.mount(menuEl, menuComponent);
};

exports.generateForm = function(key, data) {
  const el = document.getElementById('form');
  const config = pageMap[key];
  const component = m.component(dynamicForm, config.model, data);
  m.mount(el, component);
};

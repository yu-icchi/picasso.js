'use strict';

const _ = require('lodash');
const m = require('mithril');

exports.controller = function(opt) {
  this.menus = opt && opt.menus || [];
};

exports.view = function(ctrl) {
  return m('div', 'menu', _.map(ctrl.menus, (menu) => {
    return m('li', m('a', {href: `#${menu.url}`}, menu.title))
  }));
};

/**
 * @file counter component
 */

'use strict';

const m = require('mithril');

exports.controller = function() {
  this.counter = m.prop(0);
  setInterval(() => {
    this.counter(this.counter() + 1);
    m.redraw(true);
  }, 1000);
};

exports.view = function(ctrl) {
  return m('div', 'count: ' + ctrl.counter());
};

/**
 * @file user component
 */

'use strict';

const m = require('mithril');

class User {
  constructor(name) {
    this.name = m.prop(name);
  }
}

exports.controller = function() {
  this.user = new User('John Doe');
  this.ohayou = () => {
    return `おはよう ${this.user.name()}`;
  };
  this.konbanha = () => {
    return `こんばんは ${this.user.name()}`;
  };
};

exports.view = function(ctrl) {
  return m('div', [
    m('input', {onkeyup: m.withAttr('value', ctrl.user.name)}),
    m('p', ctrl.ohayou()),
    m('p', ctrl.konbanha())
  ]);
};

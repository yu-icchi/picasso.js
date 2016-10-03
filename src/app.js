'use strict';

const m = require('mithril');

const view = require('./view');

const dynamicForm = require('./dynamic_form');

exports.init = function(id) {};

exports.add = function(config) {
  const el = document.getElementById('form');

  const data = {};

  const component = m.component(dynamicForm, config.model, data);
  m.mount(el, component);
};

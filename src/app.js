'use strict';

const m = require('mithril');

const view = require('./view');

const dynamicForm = require('./dynamic_form');

exports.init = function(id) {};

exports.add = function(config) {
  const el = document.getElementById('form');

  const data = {
    _id: 'test-test-test',
    pass: 'pass',
    gender: 'female',
    blood: 'B',
    obj: {
      str: 'hoge',
      int: 100,
      num: 3.14,
      bool: true
    },
    arr: [
      'fuga1',
      'fuga2',
      'fuga3'
    ],
    list: [
      'test',
      100,
      3.14,
      false,
      {
        id: 'id'
      }
    ],
    multi: [
      {
        k1: 'v1',
        k2: true
      }
    ]
  };

  const component = m.component(dynamicForm, config.model, data);
  m.mount(el, component);
};

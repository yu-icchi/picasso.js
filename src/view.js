/**
 * @file view component
 */

'use strict';

const _ = require('lodash');
const m = require('mithril');
const hbs = require('handlebars');

function generateTable(items, list) {
  const contexts = [];
  const th = [];
  _.forEach(items, (item) => {
    let type, exec;
    if (item.template && item.key) {
      type = 'template';
      const cc = hbs.compile(item.template);
      exec = function(data) {return data && data[item.key] && cc(data[item.key])};
    } else if (item.template) {
      type = 'template';
      exec = hbs.compile(item.template);
    } else {
      type = 'key';
      exec = function(data) {return data && data[item.key]};
    }
    contexts.push({type, exec});
    th.push(m('th', item.title || '-'));
  });

  const td = _.map(list, (data) => {
    const inner = [];
    for (let i = 0, len = contexts.length; i < len; i++) {
      const context = contexts[i];
      const value = context.exec(data);
      if (context.type === 'template') {
        inner.push(m('td', m.trust(value))); // HTMLを入れる場合はtrustメソッドを使用する
      } else {
        inner.push(m('td', value));
      }
    }
    return m('tr', inner);
  });

  return m('table', [
    m('thead', th),
    m('tbody', td)
  ]);
}

function getParams(url) {
  const params = {};
  _.forEach(url.split('/'), (value) => {
    if (!/^:/.test(value)) {
      return;
    }
    const key = value.slice(1); // sliceで`:`をカットする
    const param = m.route.param(key);
    if (param) {
      params[key] = param;
    }
  });
  return params;
}

function parseApi(api) {
  const arr = api.split(':');
  return {
    method: arr[0],
    url: arr[1]
  };
}

exports.controller = function(schema) {
  const params = getParams(schema.url);
  console.log(params);

  this.items = schema.view.list.items;

  this.list = m.request(parseApi(schema.view.action.read.api));
};

exports.view = function(ctrl) {
  const list = ctrl.list();

  // テーブル表示
  const table = generateTable(ctrl.items, list);

  return m('div', table);
};

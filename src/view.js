'use strict';

const _ = require('lodash');
const m = require('mithril');
const hbs = require('handlebars');

function getTableContext(items) {
  return _.map(items, (item) => {
    let type, exec;
    if (item.template && item.key) {
      // template: 'this is {{this}}'
      type = 'template';
      const cc = hbs.compile(item.template);
      exec = function(data) {return data && data[item.key] && cc(data[item.key])};
    } else if (item.template) {
      // template: 'this is {{pen}}'
      type = 'template';
      exec = hbs.compile(item.template);
    } else {
      // key: 'key'
      type = 'key';
      exec = function(data) {return data && data[item.key]};
    }
    return {type, exec};
  });
}

function getParams(url) {
  const params = {};
  _.forEach(url.split('/'), (value) => {
    if (!/^:/.test(value)) {
      return;
    }
    const key = value.slice(1); // `:`をカットする
    params[key] = m.route.param(key);
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
  const options = parseApi(schema.view.action.read.api);
  this.res = m.request(options);
};

exports.view = function(ctrl) {
  const list = ctrl.res();

  const contexts = getTableContext(ctrl.items);

  // テーブル表示
  const table = [];
  _.forEach(list, (data) => {
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
    table.push(m('tr', inner));
  });

  return m('div', [
    m('table', table)
  ]);
};

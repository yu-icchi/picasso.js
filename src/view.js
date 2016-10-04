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
      type = 'key';
      exec = function(data) {return data && data[item.key]};
    }
    return {type, exec};
  });
}

function parseApi(api) {
  const arr = api.split(':');
  return {
    method: arr[0],
    url: arr[1]
  };
}

exports.controller = function(schema) {
  console.log(m.route.param('id'));
  this.items = schema.list.items;

  const params = parseApi(schema.action.read.api);
  this.res = m.request(params);
};

exports.view = function(ctrl) {
  const list = ctrl.res();

  const tableContexts = getTableContext(ctrl.items);

  // テーブル表示
  const table = [];
  _.forEach(list, (data) => {
    const inner = [];
    for (let i = 0, len = tableContexts.length; i < len; i++) {
      const context = tableContexts[i];
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

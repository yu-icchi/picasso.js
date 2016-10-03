'use strict';

const _ = require('lodash');
const uuid = require('uuid');
const m = require('mithril');

const TYPE = {
  NULL: 'null',
  OBJECT: 'object',
  ARRAY: 'array',
  BOOLEAN: 'boolean',
  INTEGER: 'integer',
  NUMBER: 'number',
  STRING: 'string'
};

function getValue(schema, data, key, idx) {
  let value = data && data[key];

  if (!_.isUndefined(idx)) {
    value = data && data[key] && data[key][idx];
  }

  if (_.isUndefined(value)) {
    value = schema.default ? schema.default : null;
  }
  return value;
}

function getValue2(schema, data) {
  if (_.isUndefined(data)) {
    data = schema.default ? schema.default : null;
  }
  return data;
}

function createModel2(schema, data) {
  const model = {};
  const type = schema.type.toLowerCase();
  switch (type) {
    case TYPE.OBJECT:
      _.forEach(schema.properties, (prop, key) => {
        model[key] = createModel2(prop, data && data[key]);
      });
      break;
    case TYPE.ARRAY:
      if (_.isArray(schema.items)) {
        return _.map(schema.items, (item, i) => createModel2(item, data && data[i]));
      }
      if (_.isPlainObject(schema.items)) {
        return _.map(data, (d) => createModel2(schema.items, d));
      }
      break;
  }

  let value = getValue2(schema, data);
  switch (type) {
    // ここから下は別の関数にしたほうがいいかも
    case TYPE.BOOLEAN:
      if (value !== null) {
        value = Boolean(value);
      }
      return m.prop(value);
    case TYPE.INTEGER:
      if (value !== null) {
        value = parseInt(value, 10);
      }
      return m.prop(value);
    case TYPE.NUMBER:
      if (value !== null) {
        value = Number(value);
      }
      return m.prop(value);
    case TYPE.STRING:
      if (value !== null) {
        value = String(value);
      }
      return m.prop(value);
  }

  return model;
}

function createModel(schema, data) {
  data = data || {};
  const model = {};

  _.forEach(schema.properties, (prop, key) => {
    switch (prop.type.toLowerCase()) {
      case TYPE.OBJECT:
        model[key] = createModel(prop, data[key]);
        break;
      case TYPE.ARRAY:
        model[key] = [];
        // fixed array
        if (_.isArray(prop.items)) {
          _.forEach(prop.items, (item, idx) => {
            if (item.type.toLowerCase() === TYPE.OBJECT) {
              model[key].push(createModel(item, data[key]));
            } else {
              const value = getValue(item, data, key, idx);
              model[key][idx] = m.prop(value); // nullは保存できない
            }
          });
        }
        // additional array
        if (_.isPlainObject(prop.items)) {
          if (prop.items.type.toLowerCase() === TYPE.OBJECT) {
            model[key].push(createModel(prop.items, data[key]));
          } else if (prop.items.enum) {
            model[key] = _.map(prop.items.enum, () => m.prop(null));
          } else {
            const value = getValue(prop, data, key);
            if (value) {
              model[key] = _.map(value, (v) => m.prop(v));
            } else {
              model[key].push(m.prop(null));
            }
          }
        }
        break;
      default:
        const value = getValue(prop, data, key);
        model[key] = m.prop(value);
        break;
    }
  });

  return model;
}

function addModel(model, schema) {
  if (schema.type === 'object') {
    model.push(createModel(schema));
  } else {
    model.push(m.prop(null));
  }
  // model.push(createModel2(schema));
}

function removeModel(model, i) {
  if (_.isArray(model)) {
    model.splice(i, 1);
  }
}

function convertType(type, model, value) {
  if (value === TYPE.NULL) {
    value = null;
  } else if(type === TYPE.BOOLEAN) {
    value = value === 'true';
  } else if (type === TYPE.INTEGER) {
    value = parseInt(value, 10);
  } else if (type === TYPE.NUMBER) {
    value = Number(value);
  } else {
    value = String(value);
  }
  model(value);
}

function text(inputType, type, model) {
  return m('input', {
    type: inputType,
    value: model(),
    onchange: m.withAttr('value', (value) => convertType(type, model, value))
  });
}

function textarea(model) {
  return m('textarea', {
    value: model(),
    onchange: m.withAttr('value', model)
  });
}

function radio(radios, type, model) {
  const key = uuid.v4();
  return _.map(radios, (radio) => {
    return (m('label', [radio.title, m('input', {
      type: 'radio',
      name: key,
      value: radio.value,
      checked: radio.value === model(),
      onclick: m.withAttr('value', (value) => convertType(type, model, value))
    })]));
  });
}

function select(selects, type, model) {
  const key = uuid.v4();
  selects = [{title: '', value: null}].concat(selects);
  const options = _.map(selects, (select) => {
    return (m('option', {
      selected: select.value === model(),
      value: select.value
    }, select.title))
  });
  return m('select', {
    name: key,
    onchange: m.withAttr('value', (value) => convertType(type, model, value))
  }, options);
}

function checkbox(boxes, schema, model) {
  const key = uuid.v4();
  return _.map(boxes, (box, i) => {
    return (m('label', [box, m('input', {
      type: 'checkbox',
      name: key,
      value: box,
      onclick: m.withAttr('checked', (isChecked) => {
        if (isChecked) {
          convertType(schema.items.type, model[i], box);
        } else {
          model[i](null);
        }
      })
    })]));
  })
}

function createInputType(schema, model) {

  if (schema.type === TYPE.STRING && schema.form === 'textarea') {
    return textarea(model);
  }

  if (schema.type === TYPE.STRING && schema.form === 'password') {
    return text('password', TYPE.STRING, model);
  }

  if (_.isArray(schema.enum) && !_.isEmpty(schema.enum)) {
    const list = _.map(schema.enum, (value, idx) => {
      const title = schema.labels && schema.labels[idx] || value;
      return {title, value};
    });
    if (schema.form === 'select') {
      return select(list, schema.type, model);
    } else {
      return radio(list, schema.type, model);
    }
  }

  switch (schema.type.toLowerCase()) {
    case TYPE.BOOLEAN:
      return radio([
        {
          title: 'true',
          value: true
        },
        {
          title: 'false',
          value: false
        }
      ], TYPE.BOOLEAN, model);
    case TYPE.INTEGER:
      return text('number', TYPE.INTEGER, model);
    case TYPE.NUMBER:
      return text('number', TYPE.NUMBER, model);
    case TYPE.STRING:
      return text('text', TYPE.STRING, model);
    default:
      return null;
  }
}

function createInputDom(schema, model) {
  const dom = [];
  _.forEach(schema.properties, (prop, key) => {
    if (!prop.type) {
      return; // continue
    }

    const obj = model[key];
    switch (prop.type.toLowerCase()) {
      case TYPE.OBJECT:
        dom.push(m('div', createInputDom(prop, obj)));
        break;
      case TYPE.ARRAY:
        if (_.isArray(prop.items)) {
          // fixed array
          const arr = [];
          _.forEach(prop.items, (item, idx) => {
            if (item.type.toLowerCase() === TYPE.OBJECT) {
              arr.push(m('div', createInputDom(item, obj[idx])));
            } else {
              arr.push(m('label', idx));
              arr.push(createInputType(item, obj[idx]));
              arr.push(m('br'));
            }
          });
          dom.push(m('div', arr));
        }
        if (_.isPlainObject(prop.items)) {
          if (prop.items.enum) {
            // fixed array
            dom.push(m('label', 'checkbox'));
            dom.push(checkbox(prop.items.enum, prop, obj));
            dom.push(m('br'));
          } else {
            // additional array
            // add button
            const addExec = addModel.bind(this, obj, prop.items);
            dom.push(m('button', {onclick: addExec}, 'add'));
            dom.push(m('br'));
            if (prop.items.type.toLowerCase() === TYPE.OBJECT) {
              for (let i = 0, len = obj.length; i < len; i++) {
                const inputs = createInputDom(prop.items, obj[i]);
                // remove button
                const remExec = removeModel.bind(this, obj, i);
                inputs.push(m('button', {onclick: remExec}, 'remove'));
                dom.push(m('div', inputs));
              }
            } else {
              for (let i = 0, len = obj.length; i < len; i++) {
                dom.push(m('label', i));
                dom.push(createInputType(prop.items, obj[i]));
                // remove button
                const remExec = removeModel.bind(this, obj, i);
                dom.push(m('button', {onclick: remExec}, 'remove'));
                dom.push(m('br'));
              }
            }
          }
        }
        break;
      default:
        const input = createInputType(prop, obj);
        if (input) {
          const title = prop.title || key;
          dom.push(m('label', title));
          dom.push(input);
          dom.push(m('br'));
        }
        break;
    }
  });
  return dom;
}

exports.controller = function(schema, data) {
  this.schema = schema;
  this.model = createModel(schema, data);
  this.model2 = createModel2(schema, data);

  this.json = () => JSON.stringify(this.model, null, 2);
  this.json2 = () => JSON.stringify(this.model2, null, 2);
};

exports.view = function(ctrl) {
  const dom = createInputDom(ctrl.schema, ctrl.model2);
  //dom.push(m('pre', ctrl.json()));
  dom.push(m('pre', ctrl.json2()));
  return m('div', dom);
};

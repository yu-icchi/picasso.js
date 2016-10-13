/**
 * @file Dynamic Forms
 */

/*global componentHandler */

'use strict';

require('material-design-lite');
require('flatpickr');

const _ = require('lodash');
const uuid = require('uuid');
const m = require('mithril');
const tv4 = require('tv4');

const TYPE = {
  NULL: 'null',
  OBJECT: 'object',
  ARRAY: 'array',
  BOOLEAN: 'boolean',
  INTEGER: 'integer',
  NUMBER: 'number',
  STRING: 'string'
};

function getValue(schema, data) {
  if (_.isUndefined(data)) {
    data = schema.default ? schema.default : null;
  }
  return data;
}

function createModel(schema, data) {
  const model = {};
  const type = schema.type.toLowerCase();
  switch (type) {
    case TYPE.OBJECT:
      _.forEach(schema.properties, (prop, key) => {
        model[key] = createModel(prop, data && data[key]);
      });
      break;
    case TYPE.ARRAY:
      if (_.isArray(schema.items)) {
        return _.map(schema.items, (item, i) => createModel(item, data && data[i]));
      }
      if (_.isPlainObject(schema.items)) {
        return _.map(data, (d) => createModel(schema.items, d));
      }
      break;
  }

  let value = getValue(schema, data);
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

function addModel(model, schema) {
  model.push(createModel(schema));
}

function removeModel(model, i) {
  if (_.isArray(model) && _.size(model) > 0) {
    model.splice(i, 1);
  }
}

function convertType(type, model, value) {

  if (value === TYPE.NULL) {
    value = null;
  } else if(type === TYPE.BOOLEAN) {
    value = value === 'true';
  } else if (type === TYPE.INTEGER) {
    const int = parseInt(value, 10);
    if (!_.isNaN(int)) {
      value = int;
    }
  } else if (type === TYPE.NUMBER) {
    const num = parseFloat(value);
    if (!_.isNaN(num)) {
      value = num;
    }
  } else {
    value = String(value);
  }

  if (_.isFunction(model)) {
    model(value);
  }
}

function hasError(model, schema) {
  const value = model();
  const valid = tv4.validate(value, schema);
  if (value && !valid) {
    return 'has-error'; // TODO: ここは可変できるといいかも
  }
  return '';
}

function text(inputType, schema, model) {
  const opt = {
    class: 'mdl-textfield__input',
    type: inputType,
    value: model(),
    oninput: m.withAttr('value', (value) => convertType(schema.type, model, value)),
    onchange: m.withAttr('value', (value) => convertType(schema.type, model, value))
  };
  const err = hasError(model, schema);
  if (err) {
    opt.class = opt.class ? `${opt.class} ${err}` : err;
  }
  return m('div[class=mdl-textfield mdl-js-textfield mdl-textfield--floating-label]', [
    m('input', opt),
    m('label[class=mdl-textfield__label]', schema.title)
  ]);
}

function textarea(schema, model) {
  const opt = {
    class: 'mdl-textfield__input',
    value: model(),
    oninput: m.withAttr('value', (value) => convertType(schema.type, model, value)),
    onchange: m.withAttr('value', (value) => convertType(schema.type, model, value))
  };
  const err = hasError(model, schema);
  if (err) {
    opt.class = opt.class ? `${opt.class} ${err}` : err;
  }
  return m('div[class=mdl-textfield mdl-js-textfield mdl-textfield--floating-label]', [
    m('textarea', opt),
    m('label[class=mdl-textfield__label]', schema.title)
  ]);
}

function radio(radios, type, schema, model) {
  const key = uuid.v4();
  return m('div', _.map(radios, (radio) => {
    return (m('label[class=mdl-radio mdl-js-radio mdl-js-ripple-effect]', [radio.title, m('input', {
      type: 'radio',
      class: 'mdl-radio__button',
      name: key,
      value: radio.value,
      checked: radio.value === model(),
      onclick: m.withAttr('value', (value) => convertType(type, model, value, schema))
    })]));
  }));
}

function select(selects, type, schema, model) {
  const key = uuid.v4();
  selects = [{title: '', value: null}].concat(selects);
  const options = _.map(selects, (select) => {
    return (m('option', {
      selected: select.value === model(),
      value: select.value
    }, select.title))
  });
  return m('div[class=mdl-textfield mdl-js-textfield mdl-textfield--floating-label]', [
    m('select', {
      class: 'mdl-textfield__input',
      name: key,
      onchange: m.withAttr('value', (value) => convertType(type, model, value)),
      // config: function() {
      //   console.log('select', this);
      // }
    }, options)
  ]);
}

function checkedBox(value, models) {
  let done = false;
  _.forEach(models, (model) => {
    if (value === model()) {
      done = true;
      return false; // break
    }
  });
  return done;
}

function checkbox(boxes, schema, models) {
  const key = uuid.v4();
  return _.map(boxes, (box) => {
    return (m('label[class=mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect]', [box, m('input', {
      type: 'checkbox',
      class: 'mdl-checkbox__input',
      name: key,
      value: box,
      checked: checkedBox(box, models),
      onclick: m.withAttr('checked', (isChecked) => {
        let idx = -1;
        _.forEach(models, (model, i) => {
          if (model() === box) {
            idx = i;
            return false; // break
          }
        });

        if (isChecked) {
          models.push(m.prop(box));
          convertType(schema.items.type, models[idx], box);
        } else if (idx >= 0) {
          models.splice(idx, 1);
        }
      })
    })]));
  })
}

function datePicker(schema, model) {
  const opt = {
    type: 'text',
    class: 'mdl-textfield__input',
    // onchange: m.withAttr('data-default-date', (value) => {
    //   console.log('event', value);
    // }),
    config: (el, isInit, ctx) => {
      el.flatpickr({
        mode: 'single',
        allowInput: true,
        enableTime: true,
        enableSeconds: true,
        time_24hr: true,
        onChange: (dateObj) => {
          if (_.isEmpty(dateObj) || !dateObj[0]) {
            return;
          }
          const value = dateObj[0];
          model(new Date(value).getTime());
          // el.value = new Date(value).getTime();
          // el.setAttribute('data-default-date', new Date(value).toString());
          // el.setAttribute('data-enable-time', 'true');
          // componentHandler.upgradeDom();
        }
      });
    }
  };

  const value = model();
  if (value) {
    opt['data-enable-time'] = true;
    opt['data-default-date'] = new Date(value).toString();
    opt.value = value;
  }

  return m('div[class=mdl-textfield mdl-js-textfield mdl-textfield--floating-label]', [
    m('input', opt),
    m('label[class=mdl-textfield__label]', schema.title)
  ]);
}

function createInputType(schema, model) {

  if (schema.form === 'date') {
    return datePicker(schema, model);
  }

  if (schema.type === TYPE.STRING && schema.form === 'textarea') {
    return textarea(schema, model);
  }

  if (schema.type === TYPE.STRING && schema.form === 'password') {
    return text('password', schema, model);
  }

  if (_.isArray(schema.enum) && !_.isEmpty(schema.enum)) {
    const list = _.map(schema.enum, (value, idx) => {
      const title = schema.labels && schema.labels[idx] || value;
      return {title, value};
    });
    if (schema.form === 'select') {
      return select(list, schema.type, schema, model);
    } else {
      return radio(list, schema.type, schema, model);
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
      ], TYPE.BOOLEAN, schema, model);
    case TYPE.INTEGER:
      return text('number', schema, model);
    case TYPE.NUMBER:
      return text('text', schema, model);
    case TYPE.STRING:
      return text('text', schema, model);
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
              arr.push(createInputType(item, obj[idx]));
              arr.push(m('br'));
            }
          });
          dom.push(m('div', arr));
        }
        if (_.isPlainObject(prop.items)) {
          // `schema`
          // items: {
          //   type: 'string',
          //   enum: ['a', 'b', 'c']
          // },
          // uniqItems: true
          if (prop.items.enum && prop.uniqItems) {
            // fixed array
            dom.push(checkbox(prop.items.enum, prop, obj));
            dom.push(m('br'));
          } else {
            // additional array
            // add button // TODO: ここのaddButtonがformタグ内だとリクエストになってしまい問題になる
            dom.push(m('button', {
              class: 'mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent',
              onclick: addModel.bind(this, obj, prop.items)
            }, 'add'));
            dom.push(m('br'));
            if (prop.items.type.toLowerCase() === TYPE.OBJECT) {
              for (let i = 0, len = obj.length; i < len; i++) {
                const inputs = createInputDom(prop.items, obj[i]);
                // remove button
                inputs.push(m('button', {
                  class: 'mdl-button mdl-js-button mdl-js-ripple-effect',
                  onclick: removeModel.bind(this, obj, i)
                }, 'remove'));
                dom.push(m('div', inputs));
              }
            } else {
              for (let i = 0, len = obj.length; i < len; i++) {
                dom.push(createInputType(prop.items, obj[i]));
                // remove button
                dom.push(m('button', {
                  class: 'mdl-button mdl-js-button mdl-js-ripple-effect',
                  onclick: removeModel.bind(this, obj, i)
                }, 'remove'));
                dom.push(m('br'));
              }
            }
          }
        }
        break;
      default:
        prop.title = prop.title || key;
        const input = createInputType(prop, obj);
        if (input) {
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

  this.json = () => JSON.stringify(this.model, null, 2);
  this.submit = () => {
    console.log('submit');
    console.log(JSON.stringify(this.model, null, 2));
    const els = document.getElementsByClassName('flatpickr-calendar');
    _.forEach(els, (el) => {
      m.mount(el, null); // unmount
      //el.parentNode.removeChild(el);
    });
  };
  this.reset = () => {
    console.log('reset');
    const els = document.getElementsByClassName('flatpickr-calendar');
    _.forEach(els, (el) => {
      m.mount(el, null); // unmount
      //el.parentNode.removeChild(el);
    });
  };
};

exports.view = function(ctrl) {
  const dom = createInputDom(ctrl.schema, ctrl.model);
  dom.push(m('button', {
    class: 'mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect',
    type: 'submit',
    onclick: ctrl.submit
  }, 'submit'));
  dom.push(m('button', {
    class: 'mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect',
    type: 'reset',
    onclick: ctrl.reset
  }, 'reset'));
  dom.push(m('pre', ctrl.json()));
  return m('div', {
    config: () => {
      componentHandler.upgradeDom();
    }
  }, dom); // TODO: ここをformにするとうまくいかなくなる
};

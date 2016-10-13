var user_spec = {
  key: 'user_spec',
  title: 'ユーザ',
  url: '/user/:id',
  model: {
    name: 'User',
    primary_key: '_id',
    type: 'object',
    properties: {
      _id: {
        title: 'ID',
        type: 'string',
        default: 'yyyymmdd'
      },
      pass: {
        title: 'PASS',
        type: 'string',
        form: 'password'
      },
      name: {
        title: 'NAME',
        type: 'string',
        description: 'なまえを入力',
        default: '----',
        form: 'textarea'
      },
      age: {
        title: 'AGE',
        type: 'integer',
        default: 20
      },
      term: {
        title: 'term',
        type: 'object',
        properties: {
          start: {
            type: 'integer',
            form: 'date'
          },
          end: {
            type: 'integer',
            form: 'date'
          }
        }
      },
      gender: {
        title: '性別',
        type: 'string',
        enum: [
          'male',
          'female'
        ],
        labels: [
          '男性',
          '女性'
        ]
      },
      blood: {
        title: '血液型',
        type: 'string',
        enum: [
          'A',
          'B',
          'O',
          'AB'
        ],
        labels: [
          'AA',
          'BB'
        ],
        form: 'select'
      },
      obj: {
        type: 'object',
        properties: {
          str: {
            title: 'STR',
            type: 'string'
          },
          int: {
            type: 'integer'
          },
          num: {
            type: 'number'
          },
          bool: {
            type: 'boolean'
          }
        }
      },
      arr: {
        type: 'array',
        items: {
          type: 'string'
        }
      },
      box: {
        title: 'checkbox',
        type: 'array',
        items: {
          type: 'integer',
          enum: [
            1,
            2,
            3,
            4,
            5
          ]
        },
        uniqItems: true
      },
      list: {
        type: 'array',
        items: [
          {
            title: 'STR',
            type: 'string'
          },
          {
            title: 'INT',
            type: 'integer'
          },
          {
            title: 'NUM',
            type: 'number'
          },
          {
            title: 'BOOL',
            type: 'boolean'
          },
          {
            type: 'object',
            properties: {
              id: {
                type: 'string'
              }
            }
          }
        ]
      },
      multi: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            k1: {
              type: 'string'
            },
            k2: {
              type: 'boolean'
            }
          }
        }
      }
    },
    required: [
      '_id',
      'name',
      'age'
    ]
  },
  view: {
    title: 'テーブル',
    list: {
      // ページングのときのURLをどうするか？
      size: 20,
      sort: {
        name: 'asc'
      },
      items: [
        {
          title: 'LINK',
          template: '<a href="#/hoge">{{name}}</a>'
        },
        {
          title: 'なまえ',
          template: '{{_id}}({{name}})'
        },
        {
          key: 'age',
          title: '年齢'
        },
        {
          key: 'age',
          title: '年齢2',
          template: '{{this}}歳'
        }
      ]
    },
    action: {
      create: {
        api: 'POST:/data'
      },
      read: {
        api: 'GET:/user'
      },
      update: {
        api: 'PUT:/data'
      },
      delete: {
        api: 'DELETE:/data'
      },
      import: {
        api: 'POST:/import'
      },
      export: {
        api: 'GET:/export?model=User'
      }
    },
    search: {
      api: 'GET:/user',
      type: 'radio',
      selector: [
        {
          key: '_id',
          title: 'ID',
          query: {
            q: '_id: /^{{this}}/'
          }
        },
        {
          key: 'name',
          title: 'NAME',
          query: {
            q: 'name: /^{{name}}/'
          }
        }
      ],
      autocomplete: {
        size: 10,
        template: '{{id}} {{name}}'
      }
    }
  }
};

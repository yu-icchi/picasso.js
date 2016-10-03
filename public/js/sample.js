var user_spec = {
  title: 'ユーザ',
  route: '/user/:id',
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
        }
      },
      list: {
        type: 'array',
        items: [
          {
            type: 'string'
          },
          {
            type: 'integer'
          },
          {
            type: 'number'
          },
          {
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
      size: 20,
      sort: {
        name: 'asc'
      },
      items: [
        {
          title: 'LINK',
          template: '<a href="/user/{{:id}}/detail">{{name}}</a>'
        },
        {
          title: 'なまえ',
          template: '{{_id}} ({{name}})'
        },
        {
          key: 'age',
          title: '年齢'
        }
      ]
    },
    action: [
      {
        type: 'create',
        api: 'POST:/data'
      },
      {
        type: 'read',
        api: 'GET:/data?model=User&query_type=all'
      },
      {
        type: 'update',
        api: 'PUT:/data'
      },
      {
        type: 'delete',
        api: 'DELETE:/data'
      },
      {
        type: 'import',
        api: 'POST:/import'
      },
      {
        type: 'export',
        api: 'GET:/export?model=User'
      }
    ],
    search: {
      api: 'GET:/data?model=User',
      type: 'radio',
      selector: [
        {
          key: '_id',
          title: 'ID',
          query: '_id: /^{{this}}/'
        },
        {
          key: 'name',
          title: 'NAME',
          query: 'name: /^{{name}}/'
        }
      ],
      autocomplete: {
        size: 10,
        template: '{{id}} {{name}}'
      }
    }
  }
};

var hoge_spec = {
  key: 'hoge_spec',
  title: 'HOGE',
  route: '/hoge',
  model: {
    name: 'Hoge',
    primary_key: '_id',
    type: 'object',
    properties: {
      _id: {
        type: 'string'
      },
      name: {
        type: 'string'
      },
      age: {
        type: 'integer'
      }
    }
  },
  view: {
    title: 'ほげテーブル',
    list: {
      size: 20,
      sort: {
        name: 'asc'
      },
      items: [
        {
          title: 'LINK',
          template: '<a href="#/user/{{_id}}">ほげスペック({{name}})</a>'
        },
        {
          key: 'name',
          title: 'なまえ'
        },
        {
          key: 'age',
          title: 'とし'
        }
      ]
    },
    action: {
      read: {
        api: 'GET:/hoge'
      }
    }
  }
};

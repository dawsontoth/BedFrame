var Cloud = {};
var BedFrame = require('bedframe');
BedFrame.build(Cloud, {
    verb: 'GET',
    executor: function (data) {
        // TODO: connect to your REST API!
        alert({
            data: data,
            verb: this.verb,
            method: this.method,
            namespace: this.namespace,
            restNamespace: this.restNamespace,
            foo: this.foo
        });
    },
    preparer: function () {
        if (!this.restNamespace) {
            this.restNamespace = this.namespace.toLowerCase();
        }
    },
    namespaces: [
        {
            foo: 'bar',
            namespace: 'Users',
            methods: [
                { method: 'create', verb: 'POST' },
                { method: 'get', restNamespace: 'user' },
                { method: 'remove', verb: 'DELETE' }
            ]
        }
    ]
});
Cloud.Users.create({ user: 'dawson', password: 'something... sneaky...' });
Cloud.Users.get({ user: 'dawson' });
Cloud.Users.remove({ user: 'dawson' });
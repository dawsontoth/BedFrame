# BedFrame v0.1 by Dawson Toth
A framework for exposing RESTful APIs to Appcelerator Titanium Mobile.

This framework is designed for REST APIs with the following characteristics:

1. Contains many different methods, in many different namespaces.
2. Method signatures are all very similar.
 

You probably don't need this framework if:

1. You only want to expose a couple methods.


NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.


## THE API OBJECT

 There are 5 rules you need to understand when creating the API object. Once you have these under your belt, you will
 know everything there is to know about BedFrame!

 As we walk through these rules, we'll use the following API BedFrame:

<pre>
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
</pre>

1. Namespaces are all of the properties of your parent object.
    - "Users" is a namespace of "Cloud".
    
2. Methods are the functions in a namespace.
    - "create", "get", and "remove" are all methods of "Users".
 
3. Every property, other than "namespaces" and "methods", will be mixed down in to your methods, unless it is already defined.
    - "verb: 'GET'" will mix down to all three methods
    - "executor" will also mix down to all three methods
    - "verb: 'POST'" in the "create" method overrides "verb: 'GET'"
    - "foo: 'bar': will mix down to all three methods
    
4. Executors handle function execution.
    - "Cloud.Users.create" is your executor, and it will execute in the mixed down context of "{ method: 'create', verb: 'POST' }".
    - These are where you want to actually make network requests to your REST API.
 
5. Preparers help prepare your methods before they are given to the executors.
    - They are called once for each method.
    - Their execution context is the method.
    - They give you a programmatic way to ensure default values are present.
    - In our example, if a method doesn't have a "restNamespace", the preparer uses the lowercase'd "namespace".
    
## Why the Name?

Because it helps you REST.
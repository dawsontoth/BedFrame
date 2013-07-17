# BedFrame by Dawson Toth
A framework for exposing RESTful APIs to Appcelerator Titanium Mobile.

This framework is designed for REST APIs with the following characteristics:

1. Well structured.
2. Medium to large number of methods.
 

You probably don't need this framework if:

1. You only need to expose a couple methods.


This has been tested to work properly with:

1. iOS devices and simulators
2. Android devices and emulators
3. Mobile Web

## What About a Real, Working Version?

1. Check out the app.js and netflix.js included in this repository. It wraps the Netflix OData feed.
2. The ti.cloud module, shipping with Titanium Mobile 2.0.0 and higher, uses BedFrame to wrap the Appcelerator Cloud Services.

## THE API OBJECT

There are 5 rules you need to understand when creating the API object. Once you have these under your belt, you will
know everything there is to know about BedFrame!

As we walk through these rules, we'll be creating an API that can be used like this:

<pre>
Cloud.Users.create({ user: 'dawson', password: 'something... sneaky...' });
Cloud.Users.get({ user: 'dawson' });
Cloud.Users.remove({ user: 'dawson' });
</pre>

 We create this API with the following call to the BedFrame.build method:

<pre>
var Cloud = {};
var BedFrame = require('bedframe');
BedFrame.build(Cloud, {
	propertyTypes: {
        // Properties default to BedFrame.PROPERTY_TYPE_ONLY_LATEST
        url: BedFrame.PROPERTY_TYPE_SLASH_COMBINE
    },
	verb: 'GET',
	url: 'https://api.example.com',
	executor: function (data) {
		// TODO: connect to your REST API!
		Ti.API.info({
			data: data,
			verb: this.verb,
			url: this.url,
			foo: this.foo
		});
	},
	children: [
		{
			property: 'Users',
			url: 'Users',
			foo: 'bar',
			children: [
				{ method: 'create', url: 'create.json', verb: 'POST'  },
				{ method: 'get', url: 'get.json' },
				{ method: 'remove', url: 'remove.json', verb: 'DELETE' }
			]
		}
	]
});
</pre>

 The following will be logged as a result of running the above two code snippets:
 
<pre>
[INFO] {
    data =     {
        password = "something... sneaky...";
        user = dawson;
    };
    foo = bar;
    url = "https://api.example.com/Users/create.json";
    verb = POST;
}
[INFO] {
    data =     {
        user = dawson;
    };
    foo = bar;
    url = "https://api.example.com/Users/get.json";
    verb = GET;
}
[INFO] {
    data =     {
        user = dawson;
    };
    foo = bar;
    url = "https://api.example.com/Users/remove.json";
    verb = DELETE;
}
</pre>

1. The BedFrame module only has one method: *BedFrame.build(target, api)*.
	- object target: The object that the API will be created in.
	- object api: The specifications for the API you want to expose through objects.

2. Specifying the "children" array creates a child API of the current API. That child API also follows these 5 rules. You can deeply nest child APIs.
	- "Users" is a child API of the "Cloud" API.
    
3. Methods are the functions in an API.
    - "create", "get", and "remove" are all methods of "Users".
 
4. Every property, other than "children", will be mixed down in to your methods, according to the propertyTypes.
	- There are four available constants: *BedFrame.PROPERTY_TYPE_SLASH_COMBINE*, *BedFrame.PROPERTY_TYPE_CONCATENATE*, *BedFrame.PROPERTY_TYPE_ONLY_LATEST*, and *BedFrame.PROPERTY_TYPE_IGNORE*.
	- "verb: 'GET'" will mix down to all three methods
	- "executor" will also mix down to all three methods
	- "verb: 'POST'" in the "create" method overrides "verb: 'GET'"
	- "foo: 'bar'" will mix down to all three methods
	- "url" will combine down to a slash-separated, valid URL
    
5. Executors handle function execution.
	- "Cloud.Users.create" is your executor (a function), and it will execute with the context ("this") of "{ method: 'create', verb: 'POST', url: 'https://api.example.com/Users/create.json', foo: 'bar' }".
	- These are where you want to actually make network requests to your REST API.
    
## Why the Name?

Because it helps you REST, but it is not a full REST framework. It just helps you accomplish the end goal with far less code.

## Warning

NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
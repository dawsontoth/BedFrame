/*!
 * BedFrame v0.1 by Dawson Toth
 * A framework for exposing RESTful APIs to Appcelerator Titanium Mobile.
 * 
 * This framework is designed for REST APIs with the following characteristics:
 *  1) Contains many different methods, in many different namespaces.
 *  2) Method signatures are all very similar.
 *  
 * You probably don't need this framework if:
 *  1) You only want to expose a couple methods.
 *
 * NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
 */
/*
 THE API OBJECT
 --------------

 There are 5 rules you need to understand when creating the API object. Once you have these under your belt, you will
 know everything there is to know about BedFrame!

 As we walk through these rules, we'll use the following API BedFrame:

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
                        { method: 'get' },
                        { method: 'remove', verb: 'DELETE' }
                    ]
                }
            ]
        });
        Cloud.Users.create({ user: 'dawson', password: 'something... sneaky...' });
        Cloud.Users.get({ user: 'dawson' });
        Cloud.Users.remove({ user: 'dawson' });

 1) Namespaces are all of the properties of your parent object.
    - "Users" is a namespace of "Cloud".
    
 2) Methods are the functions in a namespace.
    - "create", "get", and "remove" are all methods of "Users".
 
 3) Every property, other than "namespaces" and "methods", will be mixed down in to your methods, unless it is already defined.
    - "verb: 'GET'" will mix down to all three methods
    - "executor" will also mix down to all three methods
    - "verb: 'POST'" in the "create" method overrides "verb: 'GET'"
    - "foo: 'bar': will mix down to all three methods
    
 4) Executors handle function execution.
    - "Cloud.Users.create" is your executor, and it will execute in the mixed down context of "{ method: 'create', verb: 'POST' }".
    - These are where you want to actually make network requests to your REST API.
 
 5) Preparers help prepare your methods before they are given to the executors.
    - They are called once for each method.
    - Their execution context is the method.
    - They give you a programmatic way to ensure default values are present.
    - In our example, if a method doesn't have a "restNamespace", the preparer uses the lowercase'd "namespace".

 */


/**
 * Builds a full API on the provided parent object, as defined in the api object.
 * @param parent An object in to which the API should be injected.
 * @param api The specifications for the REST API you want to expose through objects. Read "THE API OBJECT" in bedframe.js to find out more.
 */
exports.build = function (parent, api) {

    // Ensure we received a namespaces object, and extract it.
    var namespaces = api.namespaces;
    requireArgument('namespaces', namespaces, 'object');
    delete api.namespaces;

    // Iterate through the namespaces.
    for (var n = 0, nl = namespaces.length; n < nl; n++) {
        var namespace = namespaces[n];

        // Ensure we received a methods object, and extract it.
        var methods = namespace.methods;
        requireArgument('namespaces[' + n + '].methods', methods, 'object');
        delete namespace.methods;

        // Iterate through the methods.
        for (var m = 0, ml = methods.length; m < ml; m++) {
            var method = methods[m];

            // Mix the properties from the api and namespace in to the method. (This lets us set up default values
            // very easily.)
            mixToMethod(api, namespace, method);

            // If there is a preparer function, give it a chance to prepare the method.
            if (method.preparer) {
                method.preparer.apply(method);
            }

            // Ensure the required properties are present.
            requireArgument('namespaces[' + n + '].methods[' + m + '].method', method.method, 'string');
            requireArgument('namespaces[' + n + '].methods[' + m + '].namespace', method.namespace, 'string');
            requireArgument('namespaces[' + n + '].methods[' + m + '].executor', method.executor, 'function');

            // Ensure the namespace exists.
            if (parent[method.namespace] === undefined) {
                parent[method.namespace] = {};
            }

            // Curry the method itself, which is how we can set the executor's context (ie "this.").
            parent[method.namespace][method.method] = curryMethod(method);
        }
    }
};

/**
 * Returns a function that will use the provided method's executor, using the method as the execution context.
 * @param method
 */
function curryMethod(method) {
    return function () {
        method.executor.apply(method, arguments);
    };
}

/**
 * Mixes the properties from the arguments together in to the method argument. Method takes precedence, followed
 * by namespace. NOTE THAT THIS DOES NOT RECURSIVELY COPY!
 * @param api
 * @param namespace
 * @param method
 */
function mixToMethod(api, namespace, method) {
    for (var n in namespace) {
        if (!namespace.hasOwnProperty(n) || method.hasOwnProperty(n))
            continue;
        method[n] = namespace[n];
    }
    for (var a in api) {
        if (!api.hasOwnProperty(a) || method.hasOwnProperty(a))
            continue;
        method[a] = api[a];
    }
}

/**
 * Throws an exception if an argument has not been provided, or is not of the expected type.
 * @param name The string display name of the argument (such as 'data')
 * @param arg The actual provided argument
 * @param type The string value of the expected argument type (such as 'object' or 'string').
 */
function requireArgument(name, arg, type) {
    if (arg === undefined)
        throw 'Argument ' + name + ' was not provided!';
    if (typeof(arg) != type)
        throw 'Argument ' + name + ' was an unexpected type! Expected: ' + type + ', Received: ' + typeof(arg);
}
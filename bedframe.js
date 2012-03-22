/*!
 * BedFrame v0.3 by Dawson Toth
 * A framework for exposing RESTful APIs to Appcelerator Titanium Mobile.
 * 
 * This framework is designed for REST APIs with the following characteristics:
 *  1) Contains many different methods, in many different namespaces.
 *  2) Method signatures are all very similar.
 *  
 * You probably don't need this framework if:
 *  1) You only want to expose a couple methods.
 *  
 * To learn more about this framework, or get the latest version, check out:
 *  https://github.com/dawsontoth/BedFrame
 *
 * NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
 */

/**
 * This can be used as a module or as an included file. If you are including it (or inlining it) in to another module,
 * then you should replace the below with simply var BedFrame = {}, removing the exports ternary expression.
 */
var BedFrame = exports ? exports : {};

/**
 * Default property type that results in only the latest specified value being used (that is, the deepest child's value
 * will be used over any of its parents). Particularly useful for specifying default values that most children use, and
 * then overriding those default values on exceptional children.
 */
BedFrame.PROPERTY_TYPE_ONLY_LATEST = 0;
/**
 * Property type that results in child values equating to their parent value plus their own, separated by a forward
 * slash. Particularly useful for creating a URL hierarchy.
 */
BedFrame.PROPERTY_TYPE_SLASH_COMBINE = 1;
/**
 * Property type that results in a parent value not propogating to its children.
 */
BedFrame.PROPERTY_TYPE_IGNORE = 2;

/**
 * Recursively builds a full API on the target object, as defined in the api object. Properties will be added to the target object,
 * but the object reference itself will not be altered. This means you can safely "build" on a CommonJS exports object.
 *
 * @param target The object that the API will be created in.
 * @param api The specifications for the API you want to expose through objects. Read "THE API OBJECT" in readme.md to find out more.
 */
BedFrame.build = function bedFrameTransformObject(target, api) {
    // Save a reference to the children property of the current segment of the API.
    var children = api.children || [];

    // Iterate over every child to set up its API.
    for (var c in children) {
        // Avoid prototyped members.
        if (!children.hasOwnProperty(c))
            continue;
        // Create a shorter reference to the present child.
        var child = children[c];
        // Determine the present property types, or default to an empty object.
        // (We will pass this variable down in the next step; propertyTypes is itself by default typed ONLY_LATEST).
        var propertyTypes = child.propertyTypes || api.propertyTypes || {};
        // Don't pass down children (that causes an infinite recursion).
        propertyTypes.children = BedFrame.PROPERTY_TYPE_IGNORE;

        // Iterate over every member of the current segment of the API.
        for (var o in api) {
            // Avoid prototyped members and children.
            if (!api.hasOwnProperty(o))
                continue;
            // Based on the property type specified for this API, cascade property down from parent to child.
            switch (propertyTypes[o] || BedFrame.PROPERTY_TYPE_ONLY_LATEST) {
                case BedFrame.PROPERTY_TYPE_ONLY_LATEST:
                    // ONLY_LATEST results in child taking precedence over the parent, completely replacing the value.
                    child[o] = child[o] === undefined ? api[o] : child[o];
                    break;
                case BedFrame.PROPERTY_TYPE_SLASH_COMBINE:
                    // SLASH_COMBINE results in the child ending up with a slash-separated-value from the top most
                    // parent to the present child, where elements without a value are ignored (there won't be any
                    // double slashes in the computed value).
                    var parts = [];
                    if (api[o])
                        parts.push(api[o]);
                    if (child[o])
                        parts.push(child[o]);
                    child[o] = parts.join('/');
                    break;
            }
        }

        // If the current child specifies the method property, and does not have any children, it's an endpoint and
        // needs to be set up as a method. Inject it in to the target.
        if (child.method && !child.children) {
            target[child.method] = (function (child) {
                return function () {
                    // Executors are designed to work based off of their context. Act upon the child, which is a mixed
                    // down result of its parent, and its parent's parent, and so on.
                    return child.executor.apply(child, arguments);
                };
            })(child);
        }
        // Otherwise, inject the new property in to the target, and recurse upon the sub-segment of the API.
        else if (child.property) {
            bedFrameTransformObject(target[child.property] = {}, child);
        }
    }
};
var BedFrame = require('bedframe');
BedFrame.build(exports, {
    propertyTypes: {
        // Properties default to BedFrame.PROPERTY_TYPE_ONLY_LATEST
        url: BedFrame.PROPERTY_TYPE_SLASH_COMBINE
    },
    executor: defaultExecutor,
    verb: 'GET',
    url: 'http://odata.netflix.com/v2/Catalog',
    $format: 'json',
    children: [
        {
            property: 'Genres',
            url: 'Genres',
            children: [
                { method: 'find' }
            ]
        },
        {
            property: 'Title',
            children: [
                { url: 'Titles', method: 'find' },
                { url: 'Titles', method: 'findOne' },
                {
                    property: 'AudioFormats',
                    url: 'TitleAudioFormats',
                    children: [
                        { method: 'find' }
                    ]
                },
                {
                    property: 'Awards',
                    url: 'TitleAwards',
                    children: [
                        { method: 'find' }
                    ]
                },
                {
                    property: 'ScreenFormats',
                    url: 'TitleScreenFormats',
                    children: [
                        { method: 'find' }
                    ]
                }
            ]
        },
        {
            property: 'People',
            url: 'People',
            children: [
                { method: 'find' }
            ]
        },
        {
            property: 'Languages',
            url: 'Languages',
            children: [
                { method: 'find' }
            ]
        }
    ]
});

function defaultExecutor() {
    executorsByMethodName[this.method].apply(this, arguments);
}

var executorsByMethodName = {
    /**
     * Takes in a data object, and based on the current context, hits the OData API with the provided data $parameters.
     * @param data An object containing at least success and error methods that will be called when a request finishes.
     */
    find: function (data) {
        requireArgument('data', data, 'object');
        requireArgument('data.success', data.success, 'function');
        requireArgument('data.error', data.error, 'function');
        var success = data.success,
            error = data.error;

        for (var p in this) {
            data[p] = data[p] || this[p];
        }
        var url = (data.url || this.url);
        url += url.indexOf('?') > 0 ? '&' : '?';
        for (var d in data) {
            if (d.indexOf('$') == 0 && data[d]) {
                url += d + '=' + encodeURI(data[d]) + '&';
            }
        }
        url = url.substring(0, url.length - 1);

        var verb = data.verb || this.verb || 'GET';
        var client = Ti.Network.createHTTPClient({
            onload: function () {
                var json = this.responseText;
                try {
                    if (json && json.length > 0 && json != ' ') {
                        success(JSON.parse(json).d);
                    }
                } catch (err) {
                    error(err);
                }
                success = error = null;
            },
            onerror: function (err) {
                var json = this.responseText;
                try {
                    if (json && json.length > 0 && json != ' ') {
                        var parsed = JSON.parse(json);
                        error(parsed.error && parsed.error.message && parsed.error.message.value || parsed);
                    }
                } catch (err) {
                    error(err);
                }
                success = error = null;
            }
        });
        Ti.API.info(verb + ': ' + url);
        client.open(verb, url);
        client.send();
    },
    /**
     * Takes in data, which must have the id property, tweaks the context's url property, and then calls "find" with it.
     * @param data An object that has an id, plus all the requirements imposed on "find"'s data object.
     */
    findOne: function (data) {
        requireArgument('data', data, 'object');
        requireArgument('data.id', data.id, 'string');
        // Have we received a string or a number?
        if (parseInt(data.id, 10) != data.id) {
            // Strings need to be passed in ensconced in quotes.
            data.id = "'" + data.id + "'";
        }
        data.url = this.url + '(' + data.id + ')';
        executorsByMethodName.find.apply(this, arguments);
    }
};

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
module.exports = {
    packages: {
        'angular2-text-mask': {
            ignorableDeepImportMatchers: [
                /text-mask-core\//,
            ]
        },
        "angular-instantsearch": {
            // A collection of regexes that match deep imports to ignore, for this package, rather than displaying a warning.
            ignorableDeepImportMatchers: [/instantsearch.js\//, /algoliasearch\//, /querystring-es3\//],
        },
    },
};

module.exports = {
    '@context':        'fua.load.rdf',
    'dct:identifier':  __filename,
    'dct:format':      'application/fua.load+js',
    'dct:title':       'load',
    'dct:alternative': '@nrd/fua.resource.universe.currency',
    'dct:requires':    [{
        'dct:identifier': '../data/currencies.ttl',
        'dct:format':     'text/turtle'
    }]
};

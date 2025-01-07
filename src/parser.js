const
    persist    = require('@fua/module.persistence'),
    dfc        = require('@fua/module.dfc'),
    context    = require('../data/context.json'),
    factory    = new persist.TermFactory(context),
    dataParser = new dfc.CSVTransformer({
        id:      'currencies-parser',
        headers: true,
        trim:    true
    }),
    rowParser  = new dfc.Transformer('currencies-parser');

dataParser.use(function (source, output, next) {
    output.dataset = new persist.Dataset(null, factory);
    output.dataset.add(factory.quad(
        factory.namedNode(context.fua_currency),
        factory.namedNode(context.rdf + 'type'),
        factory.namedNode(context.ldp + 'Container')
    ));
    next();
});

dataParser.use(async function (source, output, next) {
    try {
        for (let row of output.rows) {
            if (!row['AlphabeticCode']) continue;
            if (row['WithdrawalDate']) continue;
            const rowParam = {
                Identifier:  row['AlphabeticCode'].toLowerCase(),
                ISO_4217:    row['AlphabeticCode'],
                EnglishName: row['Currency']
            };
            await rowParser(rowParam, output.dataset);
        }
        next();
    } catch (err) {
        next(err);
    }
});

dataParser.use(function (source, output, next) {
    next(null, output.dataset);
});

rowParser.use(function (source, output, next) {
    output.add(factory.quad(
        factory.namedNode(context.fua_currency + source.Identifier),
        factory.namedNode(context.rdf + 'type'),
        factory.namedNode(context.ldp + 'RDFSource')
    ));
    next();
});

rowParser.use(function (source, output, next) {
    output.add(factory.quad(
        factory.namedNode(context.fua_currency),
        factory.namedNode(context.ldp + 'contains'),
        factory.namedNode(context.fua_currency + source.Identifier)
    ));
    next();
});

rowParser.use(function (source, output, next) {
    if (source.EnglishName) output.add(factory.quad(
        factory.namedNode(context.fua_currency + source.Identifier),
        factory.namedNode(context.rdfs + 'label'),
        factory.literal(source.EnglishName, 'en')
    ));
    next();
});

rowParser.lock();
module.exports = dataParser.lock();

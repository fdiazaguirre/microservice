'use strict';

const restify = require('restify');
const paginate = require('restify-paginate');
const DomainInterface = require('./domain');
const PATH = '/organizations';
const _ = require('lodash');

let server = restify.createServer({name: 'My Server'});
let domainInterface = new DomainInterface();

server.use(restify.plugins.acceptParser(server.acceptable));
server.use(restify.plugins.queryParser());
server.use(restify.plugins.bodyParser());
server.use(paginate(server));


// noinspection JSUnusedLocalSymbols
restify.defaultResponseHeaders= function(data) {
  this.header('Access-Control-Allow-Origin', '*');
  this.header('content-type', 'application/json');
};

// noinspection JSUnusedLocalSymbols
/**
 * Stub fn
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
function noImpl(req, res, next) {
  res.send('not implemented');
  next();
}

/**
 * @param {Object} req Request to verify
 * @param {Object} res Response for feedback
 * @param {Function} next middleware fn to execute if everything it's okay
 */
function checkPayload(req, res, next) {
  if (req.getContentType() !== 'application/json'
  || !req.body
  || _.isEmpty(req.body)) {
    res.send({'Invalid request': 'header should be content-type application/json and a non-empty body'});
  } else {
    next();
  }
};

// Create
server.post( PATH, checkPayload, domainInterface.createOrganization);

// Update
server.put( PATH, checkPayload, domainInterface.updateOrganizations);
server.put( PATH + '/:id', checkPayload, domainInterface.updateOrganization);

// Retrieve
server.get( PATH, domainInterface.getOrganizations);
server.get( PATH + '/:id', domainInterface.getOrganization);

// Delete
server.del( PATH, checkPayload, domainInterface.deleteOrganizations);
server.del( PATH + '/:id', domainInterface.deleteOrganization);

server.listen(8080, function() {
  console.log('%s listening at %s', server.name, server.url);
});

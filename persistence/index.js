'use strict';

const redis = require('redis');
const PromiseA = require('bluebird');
const client = redis.createClient();
const _ = require('lodash');
const crypto = require('crypto');

PromiseA.promisifyAll(redis.RedisClient.prototype);
PromiseA.promisifyAll(redis.Multi.prototype);

/**
 * In charge of store data.
 * @return {Object} PersistenceInterface
 */
module.exports = function() {
  let PersistenceInterface = {};

  /**
   * @return {Array} with all the available organization ids
   */
  function getKeys() {
    return client.keysAsync('*').then(function(keys) {
      return keys;
    });
  }

  /**
   * @param {Array} organizationIds organizations ids
   * @return {Array} result organizations
   */
  function getValues(organizationIds) {
    let result = [];
    return PromiseA.each(organizationIds, function(key) {
      return PersistenceInterface.retrieve(key).then(function(value) {
        result.push(value);
      });
    }).then(function() {
      return result;
    });
  }


  /**
   * @param {Object} org organization payload
   * @return {String} hash representing the organization
   */
  function makeHash(org) {
    return crypto
      .createHash('md5')
      .update(JSON.stringify(org), 'utf8')
      .digest('base64');
  }

  PersistenceInterface.createMultiple = function(newOrganizations) {
      let generatedHashes = [];
      let insertCommands = _.map(newOrganizations, function(organization) {
        generatedHashes.push(makeHash(organization));
        return ['set', makeHash(organization), JSON.stringify(_.omit(organization, 'organizationId'))];
      });
    return client.multi(insertCommands).execAsync().then(function(value) {
      return {'organizationIds': generatedHashes, 'status': _.uniq(value)};
    });
  };

  PersistenceInterface.getAll = function() {
    return getKeys().then(getValues);
  };

  PersistenceInterface.updateMultiple = function(newOrganizations) {
    let givenHashes = [];
    let updateCommands = _.map(newOrganizations, function(organization) {
      givenHashes.push(organization['organizationId']);
      return ['set', organization['organizationId'], JSON.stringify(_.omit(organization, 'organizationId'))];
    });
    return client.multi(updateCommands).execAsync().then(function(value) {
      return {'organizationIds': givenHashes, 'status': _.uniq(value)};
    });
  };

  PersistenceInterface.deleteMultiple = function(organizations) {
    let givenHashes = [];
    let deletCommands = _.map(organizations, function(organization) {
      givenHashes.push(organization['organizationId']);
      return ['del', organization['organizationId'], JSON.stringify(_.omit(organization, 'organizationId'))];
    });
    return client.multi(deletCommands).execAsync().then(function(value) {
      return {'organizationIds': givenHashes, 'status': _.uniq(value)};
    });
  };

  PersistenceInterface.create = function(newOrganization) {
    let generatedHash = crypto
      .createHash('md5')
      .update(JSON.stringify(newOrganization), 'utf8')
      .digest('base64');
    
    return client.setAsync(generatedHash, JSON.stringify(newOrganization)).then(function(value) {
        return {'organizationId': generatedHash, 'status': value};
    });
  };

  PersistenceInterface.update = function(id, organization) {
    return client.setAsync(id, _.omit(organization, 'organizationId')).then(function(value) {
      return {'organizationId': id, 'status': value};
    });
  };

  PersistenceInterface.retrieve = function(organizationId) {
    return client.getAsync(organizationId).then(function(res) {
      return JSON.parse(res);
    });
  };

  PersistenceInterface.delete = function(organizationId) {
    return client.delAsync(organizationId).then(function(res) {
      return JSON.parse(res);
    });
  };
  return PersistenceInterface;
};

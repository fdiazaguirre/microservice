/* eslint-disable padded-blocks */
'use strict';

const PersistenceInterface = require('../persistence');
const _ = require('lodash');
const persistenceInterface = new PersistenceInterface();
const SchemaValidator = require('./validator');
const validator = new SchemaValidator();

module.exports = function() {
  let DomainInterface = {};

  /**
   * @param {String} id organization identifier
   * @return {boolean} true when the organization exits false otherwise
   */
  function exists(id) {
    return persistenceInterface.retrieve(id).then(function(value) {
      return !_.isNull(value);
    });
  }

  /**
   * @param {Object} req Request
   * @param {Object} res Response
   * @return {boolean} true when payload conforms schema and key was found in the storage, false othwerwhise.
   */
  function isValidForUpdate(req, res) {
    return exists(req.params.id).then(function(hasEntry) {
      let validPayload = validator.isValid(req.body);
      if (validPayload === false || hasEntry === false) {
        sendValidationFeedback(validPayload, res, {valid: hasEntry, message: 'organizationId does not exist!'});
        return false;
      } else {
        return true;
      }
    });
  }

  /**
   * Checks if payload is compliance with domain schema.
   *
   * @param {Object} validationResult
   * @param {Object} res Response
   * @param {Object} otherValidations additional validations
   */
  function sendValidationFeedback(validationResult, res, otherValidations) {
    if (validationResult.valid === false || otherValidations && otherValidations.valid === false) {
      let description = validationResult.error
      && validationResult.error.details
      && validationResult.error.details[0]
      && validationResult.error.details[0].message || otherValidations.message;
      res.send({'Invalid organization': description});
    }
  }

  DomainInterface.getOrganization = function(req, res, next) {
    return persistenceInterface.retrieve(req.params.id).then(function(value) {
      res.send({data: value});
      next();
    });
  };

  DomainInterface.getOrganizations = function(req, res, next) {
    return persistenceInterface.getAll().then(function(values) {
      if (!_.isEmpty(values)) {
        let paginatedResponse = res.paginate.getPaginatedResponse(values, req.params.per_page);
        res.send(paginatedResponse);
      } else {
        res.send({data: []});
      }
      next();
    });
  };

  DomainInterface.createOrganization = function(req, res, next) {
    let validationResult = {};

    if (_.isArray(req.body)) {
      _.forEach(req.body, function(o) {
        validationResult = validator.isValid(o);
        if (validationResult.valid === false) {
          return false;
        }
      });

      if (validationResult.valid === false) {
        sendValidationFeedback(validationResult, res, undefined);
      }

      if (validationResult.valid === true) {
        return persistenceInterface.createMultiple(req.body).then(function(value) {
          res.send({data: value});
          next();
        });
      }
    } else {
      validationResult = validator.isValid(req.body);
      sendValidationFeedback(validationResult, res, undefined);

      if (validationResult.valid === true) {
        return persistenceInterface.create(req.body).then(function(value) {
          res.send({data: value});
          next();
        });
      }
    }
  };

  DomainInterface.updateOrganization = function(req, res, next) {
      return isValidForUpdate(req, res).then(function(isValid) {
        if (isValid === false) {
          next();
        }
        return persistenceInterface.update(req.params.id, req.body).then(function(value) {
          res.send({data: value});
          next();
        });
      });
  };

  DomainInterface.deleteOrganization = function(req, res, next) {
    return persistenceInterface.delete(req.params.id).then(function(value) {
      if (value === 0) {
        res.send({'Invalid organization': req.params.id + ' does not exist!'});
      } else {
        res.send({data: {organizationId: req.params.id, status: 'deleted'}});
      }
      next();
    });
  };

  DomainInterface.deleteOrganizations = function(req, res, next) {
    return persistenceInterface.deleteMultiple(req.body).then(function(value) {
      res.send({data: value});
      next();
    });
  };

  DomainInterface.updateOrganizations = function(req, res, next) {
    const payload = req.body;
    let validationResult = {};

    if (_.isArray(payload)) {
      _.forEach(payload, function(o) {
        validationResult = validator.isValid(o);
        if (validationResult.valid === false) {
          return false;
        }
      });

      if (validationResult.valid === false) {
        sendValidationFeedback(validationResult, res, undefined);
      }

      if (validationResult.valid === true) {
        return persistenceInterface.updateMultiple(payload).then(function(value) {
          res.send({data: value});
        });
      }
    }
    next();
  };

  return DomainInterface;
};

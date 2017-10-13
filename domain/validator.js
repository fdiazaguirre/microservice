'use strict';

const Joi = require('joi');
const _ = require('lodash');

const createSchema = Joi.object().keys({
  name: Joi.string().regex(/^[a-zA-Z0-9 ]{3,30}$/).required(),
  location: Joi.string(),
  policyId: Joi.string().required(),
});

const multipleUpdateSchema = Joi.object().keys({
  organizationId: Joi.string().regex(/^[a-zA-Z0-9 =]{24,64}/).required(),
  name: Joi.string().regex(/^[a-zA-Z0-9 ]{3,30}$/),
  location: Joi.string(),
  policyId: Joi.string().required(),
});


module.exports = function() {
  let SchemaValidator = {};

  SchemaValidator.isValid = function(newOrganization) {
    let result;
     if (_.includes(_.keys(newOrganization), 'organizationId')) {
        result = Joi.validate(newOrganization, multipleUpdateSchema);
     } else {
        result = Joi.validate(newOrganization, createSchema);
     }
    return {'valid': result.error === null, 'error': result.error};
  };

  return SchemaValidator;
};

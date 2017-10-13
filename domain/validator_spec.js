/* eslint-disable padded-blocks */
'use strict';

const path = require('path');
const chai = require('chai');
const expect = chai.expect;
const Validator = require(path.resolve(__dirname, 'validator.js'));

describe('Validator Suite', function() {
  let validator = new Validator();

  describe('Invalid organizations', function() {
    it('Should return false for empty object', function() {
      expect(validator.isValid({}).valid).to.be.false;
    });

    it('Should return false when policy is missing', function() {
      let invalidOrganization = {
        name: 'Gracie Humaita',
        location: 'lat:-22.90;long:43.17'};
      expect(validator.isValid(invalidOrganization).valid).to.be.false;
    });

    it('Should return false when name is missing', function() {
      let invalidOrganization = {
        location: 'lat:-22.90;long:43.17',
        policyId: '123'};
      expect(validator.isValid(invalidOrganization).valid).to.be.false;
    });

    it('Should return false when name is less than 3 characters', function() {
      let invalidOrganization = {
        name: 'g',
        policyId: '123'};
      expect(validator.isValid(invalidOrganization).valid).to.be.false;
    });

    it('Should return false when name is less than 3 characters', function() {
      let invalidOrganization = {
        organizationId: '1',
        name: 'Gracie Humaita',
        policyId: '123'};
      expect(validator.isValid(invalidOrganization).valid).to.be.false;
    });
  });

  describe('Valid organizations', function() {
    it('Should return true when required properties are passed', function() {
      let validNewOrganization = {
        name: 'Gracie Humaita',
        policyId: '123'};
      expect(validator.isValid(validNewOrganization).valid).to.be.true;
    });

    it('Should return true when required properties are passed', function() {
      let validExistentOrganization = {
        name: 'Gracie Humaita',
        location: 'lat:-22.90;long:43.17',
        policyId: '123'};
      expect(validator.isValid(validExistentOrganization).valid).to.be.true;
    });
  });
});

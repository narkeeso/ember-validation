var get = Ember.get, set = Ember.set, toType = Ember.Validation.toType;

/**
 The ObjectValidator stores a ValueValidator for each mapped attribute
 @class Ember.Validation.ObjectValidator
 */
Ember.Validation.ObjectValidator = Ember.Object.extend({

  validators: null,

  init: function() {
    this._super();
    set(this, 'validators', Ember.Map.create());
  },

  setPropertyValidator: function(property, validator) {
    get(this, 'validators').set(property, validator);
    return validator;
  },

  getPropertyValidator: function(property) {
    return get(this, 'validators').get(property);
  },

  hasPropertyValidator: function(property) {
    return get(this, 'validators').has(property);
  },

  /**
   validates the object with the validators
   option can be
   - nothing : validates all properties
   - false : validates until first error
   - true : same as nothing
   - property : validates specific property
   - array of properties : validates specific properties
   @method validate
   @param obj {Object} the object to validate
   @param option {bool/String/Object} see class description
   @return {Ember.Validation.ValidationResult}
   */
  validate: function(obj, option) {

    var result;
    var retVal = Ember.Validation.ValidationResult.create();

    var validateAll = true;

    if(toType(option)==='boolean'  ) {
      validateAll = option;
    }

    if(toType(option)==='string') {
      result = this.validateProperty(obj, option, retVal);
      retVal.setPropertyResult(option, result);
      return retVal;
    } else {
      var properties = [];
      if(toType(option)==='array') {
        properties = option;
      } else {
        var validators = get(this, 'validators');

        validators.forEach(function(property){
          properties.push(property);
        });
      }

      for (var i = 0; i < get(properties, 'length'); i++) {
        result = this.validateProperty(obj, properties[i]);
        retVal.setPropertyResult(properties[i], result);

        if(!get(result, 'isValid') && !validateAll) {
          break;
        }
      }

      return retVal;
    }
  },

  /**
   validates a single property of the passed object
   @method validateProperty
   @param obj {Object} the object to validate
   @param property {String} the property to validate
   @return {Ember.Validation.Result} Returns the validation result
   */
  validateProperty: function(obj, property) {

    if(!this.hasPropertyValidator(property)) {
      //todo warn?
      return Ember.Validation.Result.create();
    }

    var validators = get(this, 'validators');
    return validators.get(property).validate(get(obj, property), obj);
  }
});
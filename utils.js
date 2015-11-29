module.exports = {
  buildResp: function(success, message, params) {
    if(!success) {
      return this.buildErrResp(message);
    } else {
      var result = {
        success: true
      };
      if(params && params instanceof Array) {
        params.forEach(function(item, idx) {
          for(var key in item) {
            result[key] = item[key];
          }
        });
      }
      return result;
    }
  },
  buildErrResp: function(message) {
    return {
      success: false,
      message: message
    }
  }
};
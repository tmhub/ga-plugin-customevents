/* Universal module definition */

(function(factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD
    define(['jquery'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS
    module.exports = factory(require('jquery'));
  } else {
    // Browser globals
    factory(jQuery);
  }
}(function($) {

  "use strict";

  $.gaEvents = function() {

    var //$window = $(window),
      universalGA = false,
      classicGA = false,
      gaGlobal,
      standardEventHandler;

    if (typeof ga === "function") {
      universalGA = true;
      gaGlobal = 'ga';
    } else if (typeof __gaTracker === "function") {
      universalGA = true;
      gaGlobal = '__gaTracker';
    }

    if (typeof _gaq !== "undefined" && typeof _gaq.push === "function") {
      classicGA = true;
    }

    if (typeof dataLayer !== "undefined" && typeof dataLayer.push === "function" && !options.gtmOverride) {
      standardEventHandler = function(data) {
        dataLayer.push(data);
      };
    }

    $(document).on('click', '.btn-cart', function(e){
      console.log(e.target);
    });

  }

}));

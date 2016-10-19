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

  var universalGA = false,
    classicGA = false,
    gaGlobal,
    standardEventHandler;

  $.gaEvents = function(listenJsEvents) {

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

    if (typeof dataLayer !== "undefined" && typeof dataLayer.push === "function") {
      standardEventHandler = function(data) {
        dataLayer.push(data);
      };
    }

    function sendEvent(category, action, label, value) {

      if (standardEventHandler) {

        standardEventHandler({
          'event': 'Custom Event',
          'eventCategory': category,
          'eventAction': action,
          'eventLabel': label,
          'eventValue': value,
          'eventNonInteraction': true
        });

      } else {

        if (universalGA) {
          window[gaGlobal]('send', 'event', category, action, label, value, {'nonInteraction': true});
        }

        if (classicGA) {
          _gaq.push(['_trackEvent', category, action, label, value, true]);
        }

      }

    }

    for (var i = 0; i < listenJsEvents.length; i++) {
      var jsEvent = listenJsEvents[i];
      $(document).on(
        jsEvent.name,
        jsEvent.selector,
        jsEvent.handler,
        function(e){
          var handler = e.data;
          var gaEventData = false;
          if (handler) {
            gaEventData = handler(e.target);
          }
          if (gaEventData) {
            console.log(gaEventData); return;
            sendEvent(
              gaEventData.category,
              gaEventData.action,
              gaEventData.label,
              gaEventData.value
            );
          }
        }
      );
    }

  }

}));

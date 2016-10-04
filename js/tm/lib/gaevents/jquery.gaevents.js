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

  $.gaEvents = function(data) {

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

      console.log(arguments);
      return;

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

    function getProductName(element, parentSelector) {
      return $(element)
        .closest(parentSelector)
        .find('.product-name')
        .text();
    }

    function getProductPrice(element, parentSelector) {
      var price = $(element)
        .closest(parentSelector)
        .find('.special-price .price, .regular-price .price')
        .text();
        console.log(price);
      price = price.replace(/[^\d.-]/g, ''); // remove all chars except digits and dot
      return Math.round(parseFloat(price));
    }

    $(document).on('click', '.main-container .btn-cart', function(e){
      var target = $(e.target);
      var parent = target.closest('.main-container .btn-cart');
      if (parent.data('gaEventClickOff')) {
        return;
      }
      // set action name for ga event
      var actionName = parent.text();
      if (actionName.length < 2) {
        actionName = 'Add to Cart'
      }
      sendEvent(
        'Category View',
        actionName,
        getProductName(parent, '.item'),
        getProductPrice(parent, '.item')
      );
    });

    // suppress add to cart click event
    $('.product-essential .btn-cart').data('gaEventClickOff', true);

  }

}));

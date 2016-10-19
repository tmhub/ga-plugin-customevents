(function($){

    function getProductName(element, parentSelector) {
        var name = $(element).closest(parentSelector)
            .find(this.productNameSelector).text();
        return $.trim(name);
    }

    function getProductPrice(element, parentSelector) {
      var price = $(element)
        .closest(parentSelector)
        .find(this.priceSelector)
        .text();
      if (!price) { price = '0'; }
      price = price.replace(/[^\d.-]/g, ''); // remove all chars except digits and dot

      return Math.round(parseFloat(price));
    }

    if (typeof window.analitycs === 'undefined') {
        window.analitycs = {};
    }

    window.analitycs.addToCart = {

        init: function(mageController) {
            this.category = mageController;
            this.action = 'Add to Cart';
            this.priceSelector = '.special-price .price, .regular-price .price';
            this.productNameSelector = '.product-name';
        },

        sendGaEventClick: function(target){

            var button = $(target).closest('.btn-cart');
            if (button.data('gaEventButtonClickOff')) {
                return false;
            }

            return {
                category : this.category,
                action: button.text(),
                label: getProductName.call(this, button, '.item'),
                value: getProductPrice.call(this, button, '.item')
            }
        },

        sendGaEventSubmit: function(target){

            var productEssential = $(target).closest('.main-container, #ajaxpro-addcustomproduct-view')
                .find('.product-essential');
            return {
                category : this.category,
                action: productEssential.find('.btn-cart').text(),
                label: getProductName.call(this, productEssential, '.product-essential'),
                value: getProductPrice.call(this, productEssential, '.product-essential')
            }
        },

        wrapProductAddToCartSubmit: function() {
            // objects are passed by reference
            var atcForm = window.productAddToCartForm;
            if (typeof atcForm !== 'undefined' && !atcForm.wrappedByAnalitycs) {
                atcForm.wrappedByAnalitycs = true; // prevent multiple wrapping
                atcForm.submit = atcForm.submit.wrap(function(callOriginal, button, url) {
                    callOriginal(button, url);
                    if (this.validator.validate()) {
                        $j(this.form).trigger('gaevent:product:submitted');
                    }
                });
            }
        }

    };

})($j);

$j(function() {

    // prevent sending GA event on 'add to cart' on product view page
    $j('.product-essential .btn-cart').data('gaEventButtonClickOff', true);

    $j.gaEvents([
        {
            name: 'click',
            selector: '.btn-cart',
            handler: analitycs.addToCart.sendGaEventClick.bind(analitycs.addToCart)
        },
        {
            name: 'gaevent:product:submitted',
            selector: '',
            handler: analitycs.addToCart.sendGaEventSubmit.bind(analitycs.addToCart)
        }
    ]);

    analitycs.addToCart.wrapProductAddToCartSubmit();

});

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

            var productEssential = $(target).closest('.main-container')
                .find('.product-essential');

            return {
                category : this.category,
                action: productEssential.find('.btn-cart').text(),
                label: getProductName.call(this, productEssential, '.product-essential'),
                value: getProductPrice.call(this, productEssential, '.product-essential')
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

    if (typeof productAddToCartForm !== 'undefined') {
        // trigger event when add to cart submitted on product page
        productAddToCartForm.submit = productAddToCartForm.submit.wrap(
            function(callOriginal, button, url) {
                callOriginal(button, url);
                if (this.validator.validate()) {
                    $j(this.form).trigger('gaevent:product:submitted');

                }
            }
        );
    }


});

// after initalizing AjaxPro prevent sending GA event on click in product listing
document.observe("AjaxPro:addObservers:after", function(){
    $$('.btn-cart').each(function(el){
        var onClickValue = el.readAttribute('onclick');
        if (typeof onClickValue !== 'string') {
            onClickValue = '';
        }
        console.log(onClickValue);
        if (onClickValue.search('checkout/cart/add') === -1) {
            $j(el).data('gaEventButtonClickOff', true);
        } else {
            $j(el).data('gaEventButtonClickOff', false);
        }
    });
})

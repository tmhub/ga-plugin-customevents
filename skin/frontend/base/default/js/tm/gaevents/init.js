(function($){

    if (typeof window.analitycs === 'undefined') {
        window.analitycs = {

            init: function(mageController){
                this.mageController = mageController;
            }

        };
    }

    function getProductName(element, parentSelector) {
        var name = $(element).closest(parentSelector)
            .find(this.productNameSelector).first().text();
        // console.log($(element).closest(parentSelector)
        //     .find(this.productNameSelector));
        return $.trim(name);
    }

    function getProductPrice(element, parentSelector) {
        // find product price
        var parentElement = $(element).closest(parentSelector);
        var price = parentElement.find(this.priceSelector).text();
        if (!price) { price = '0'; }
        price = price.replace(/[^\d.-]/g, ''); // remove all chars except digits and dot

        return Math.round(parseFloat(price));
    }

    // add to cart events listening
    window.analitycs.addToCart = {

        init: function() {
            this.parent = window.analitycs;
            this.priceSelector = '.special-price .price, .regular-price .price';
            this.productNameSelector = '.product-name';
        },

        sendGaEventClick: function(target){

            var button = $(target).closest('.btn-cart');
            if (button.data('gaEventButtonClickOff')) {
                return false;
            }

            return {
                category : this.parent.mageController,
                action: button.text(),
                label: getProductName.call(this, button, '.item'),
                value: getProductPrice.call(this, button, '.item')
            }
        },

        sendGaEventSubmit: function(target){

            var productEssential = $(target).closest('.main-container, #ajaxpro-addcustomproduct-view')
                .find('.product-essential');
            return {
                category : this.parent.mageController,
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
    window.analitycs.addToCart.init();

    // add to compare events listening
    window.analitycs.addToCompare = {
        init: function() {
            this.parent = window.analitycs;
            this.priceSelector = '.special-price .price, .regular-price .price';
            this.productNameSelector = '.product-name';
        },

        sendGaEvent: function(target){

            var button = $(target);
            if (button.data('gaEventStop')) {
                return false;
            }

            return {
                category : this.parent.mageController,
                action: button.text(),
                label: getProductName.call(this, button, '.item, .product-essential'),
                value: getProductPrice.call(this, button, '.item, .product-essential')
            }
        }

    };

    window.analitycs.addToCompare.init();

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

    $j.gaEvents([
        {
            name: 'gaevent:product:addedtocompare',
            selector: '',
            handler: analitycs.addToCompare.sendGaEvent.bind(analitycs.addToCompare)
        }
    ]);

    $j('body').on('click', function(e){
        var url = $j(e.target).attr('href');
        if (typeof url !== 'undefined') {
            if (url.indexOf('catalog/product_compare/add') != -1) {
                // it is addto compare click
                $j(e.target).trigger('gaevent:product:addedtocompare');
            } else if (url.indexOf('wishlist/index/add') != -1) {
                // it is add to wishlist click
                $j(e.target).trigger('gaevent:product:addedtowishlist');
            }
        }
    })

});

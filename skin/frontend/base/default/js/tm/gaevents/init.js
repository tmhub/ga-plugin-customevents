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

        init: function(parent) {
            this.parent = parent;
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
            if (typeof productAddToCartForm !== 'undefined') {
                productAddToCartForm.submit = productAddToCartForm.submit.wrap(
                    function(callOriginal, button, url, gaEventTriggered = {value: false}) {
                        callOriginal(button, url, gaEventTriggered);
                        if (this.validator.validate() && !gaEventTriggered.value) {
                            // trigger event only ones to prevent duplicated calls
                            $j(this.form).trigger('gaevent:product:submitted');
                            gaEventTriggered.value = true;
                        }
                    }
                );
            }
        }

    };
    window.analitycs.addToCart.init(window.analitycs);

    // add to compare events listening
    window.analitycs.addToCompare = {
        init: function(parent) {
            this.parent = parent;
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
    window.analitycs.addToCompare.init(window.analitycs);

    // add to whishlist events listening
    window.analitycs.addToWishlist = {
        init: function(parent) {
            this.parent = parent;
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
    window.analitycs.addToWishlist.init(window.analitycs);

    // subscribe to newsletter event listening
    window.analitycs.newsletterSubscribe = {
        init: function(parent){
            this.parent = parent;
            this.buttonSelector = 'button';
            this.formSelector = '#newsletter-validate-detail';
        },

        sendGaEvent: function(target){

            var form = $(target).closest(this.formSelector);
            var email = $(form).find('[type=email]');
            var actionText = $(email).attr('title') ? $(email).attr('title') : $(target).text();

            return {
                category : this.parent.mageController,
                action: actionText,
                label: '',
                value: ''
            }
        }
    };
    window.analitycs.newsletterSubscribe.init(window.analitycs);

})($j);

$j(function() {

    // 1. HOOK EVENT ADD TO CART
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

    // 2. HOOK EVENT ADD TO COMPARE
    $j.gaEvents([
        {
            name: 'gaevent:product:addedtocompare',
            selector: '',
            handler: analitycs.addToCompare.sendGaEvent.bind(analitycs.addToCompare)
        }
    ]);

    // 3. HOOK EVENT ADD TO WISHLIST
    $j.gaEvents([
        {
            name: 'gaevent:product:addedtowishlist',
            selector: '',
            handler: analitycs.addToWishlist.sendGaEvent.bind(analitycs.addToWishlist)
        }
    ]);

    // 4. HOOK EVENT NEWSLETTER SUBSCRIBTION
    $j.gaEvents([
        {
            name: 'submit',
            selector: analitycs.newsletterSubscribe.formSelector,
            handler: analitycs.newsletterSubscribe.sendGaEvent.bind(analitycs.newsletterSubscribe)
        }
    ]);

    // TRIGER CUSTOM EVENTS FOR ADD TO COMPARE/WISHLIST (THEY HOOKED ABOVE)
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

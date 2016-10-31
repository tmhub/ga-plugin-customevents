(function($){

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

    window.analytics = {
        init: function(mageController, settings){
            this.mageController = mageController;
            this.settings = settings;
        }
    };

    // add to cart events listening
    window.analytics.addToCart = {

        init: function(parent) {
            this.parent = parent;
            this.priceSelector = '.special-price .price, .regular-price .price';
            this.productNameSelector = '.product-name';
            // listen event and send GA Event
            $.gaEvents([
                {
                    name: 'click',
                    selector: '.btn-cart',
                    handler: this.sendGaEventClick.bind(this)
                },
                {
                    name: 'gaevent:product:submitted',
                    selector: '',
                    handler: this.sendGaEventSubmit.bind(this)
                }
            ]);
            this.wrapProductAddToCartSubmit();
            // prevent sending GA event on 'add to cart' on product view page
            $('.product-essential .btn-cart').data('gaEventButtonClickOff', true);
        },

        sendGaEventClick: function(target){
            var button = $(target).closest('.btn-cart');
            if (button.data('gaEventButtonClickOff')) { return false; }
            return {
                category : this.parent.mageController,
                action: button.text(),
                label: getProductName.call(this, button, '.item'),
                value: getProductPrice.call(this, button, '.item')
            }
        },

        sendGaEventSubmit: function(target){
            var productEssential = $(target)
                .closest('.main-container, #ajaxpro-addcustomproduct-view')
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
                            $(this.form).trigger('gaevent:product:submitted');
                            gaEventTriggered.value = true;
                        }
                    }
                );
            }
        }

    };

    // add to compare events listening
    window.analytics.addToCompare = {

        init: function(parent) {
            this.parent = parent;
            this.priceSelector = '.special-price .price, .regular-price .price';
            this.productNameSelector = '.product-name';
            // listen event and send GA Event
            $.gaEvents([
                {
                    name: 'gaevent:product:addedtocompare',
                    selector: '',
                    handler: this.sendGaEvent.bind(this)
                }
            ]);
        },

        sendGaEvent: function(target){
            var button = $(target);
            if (button.data('gaEventStop')) { return false; }
            return {
                category : this.parent.mageController,
                action: button.text(),
                label: getProductName.call(this, button, '.item, .product-essential'),
                value: getProductPrice.call(this, button, '.item, .product-essential')
            }
        }

    };

    // add to whishlist events listening
    window.analytics.addToWishlist = {
        init: function(parent) {
            this.parent = parent;
            this.priceSelector = '.special-price .price, .regular-price .price';
            this.productNameSelector = '.product-name';
            // listen event and send GA Event
            $.gaEvents([
                {
                    name: 'gaevent:product:addedtowishlist',
                    selector: '',
                    handler: this.sendGaEvent.bind(this)
                }
            ]);
        },

        sendGaEvent: function(target){
            var button = $(target);
            if (button.data('gaEventStop')) { return false; }
            return {
                category : this.parent.mageController,
                action: button.text(),
                label: getProductName.call(this, button, '.item, .product-essential'),
                value: getProductPrice.call(this, button, '.item, .product-essential')
            }
        }

    };

    // subscribe to newsletter event listening
    window.analytics.newsletterSubscribe = {

        init: function(parent){
            this.parent = parent;
            this.actionText = 'Subscribe';
            this.labelText = 'Newsletter';
            this.formSelector = '#newsletter-validate-detail';
            // listen event and send GA Event
            $.gaEvents([
                {
                    name: 'submit',
                    selector: this.formSelector,
                    handler: this.sendGaEvent.bind(this)
                }
            ]);
        },

        sendGaEvent: function(target){
            return {
                category : this.parent.mageController,
                action: this.actionText,
                label: this.labelText
            }
        }

    };

    // contact us submit event listening
    window.analytics.contactUs = {

        init: function(parent){
            this.parent = parent;
            this.actionText = 'Submit';
            this.labelText = 'Contact Us';
            this.formSelector = '#contactForm';
            // listen event and send GA Event
            $.gaEvents([
                {
                    name: 'submit',
                    selector: this.formSelector,
                    handler: this.sendGaEvent.bind(this)
                }
            ]);
        },

        sendGaEvent: function(target){
            return {
                category : this.parent.mageController,
                action: this.actionText,
                label: this.labelText
            }
        }

    };

})($j);

$j(function() {

    // TRIGER CUSTOM EVENTS FOR ADD TO COMPARE/WISHLIST
    $j('body').on('click', function(e){
        var url = $j(e.target).attr('href');
        if (typeof url !== 'undefined') {
            if (url.indexOf('catalog/product_compare/add') != -1) {
                // it is addto compare click
                $j(e.target).trigger('gaevent:product:addedtocompare');
            } else if (url.indexOf('wishlist/index/add') != -1) {
                // it is add to wishlist click
                $j(e.target).trigger('gaevent:product:addedtowishlist');
            } else if (url.indexOf('/checkout/cart') != -1) {
                // trigger event when clicked on url to checkout cart
                $j(e.target).trigger('gaevent:checkout:cart');
            } else if (url.indexOf('/checkout') != -1) {
                // trigger event when clicked on url to onepage checkout
                $j(e.target).trigger('gaevent:checkout:onepage');
            } else if (url.indexOf('/firecheckout') != -1) {
                // trigger event when clicked on url to firecheckout
                $j(e.target).trigger('gaevent:checkout:onepage');
            }
        }
    });

    setLocation = setLocation.wrap(function(callOriginal, url){
        // trigger checkout event when location to checkout cart or page
        if (url.indexOf('/checkout/cart') != -1) {
            $j(document).trigger('gaevent:checkout:cart');
        } else if (url.indexOf('/checkout') != -1) {
            $j(document).trigger('gaevent:checkout:onepage');
        } else if (url.indexOf('/firecheckout') != -1) {
            $j(document).trigger('gaevent:checkout:onepage');
        };
        return callOriginal(url);
    });

    // INITIALIZE EVENTS LISTENERS
    $j.each(analytics.settings, function(key, value){
        if (value == '1') {
            analytics[key].init(analytics);
        } else {
            delete analytics[key];
        }
    });

});

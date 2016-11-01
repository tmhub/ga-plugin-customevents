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
        init: function(data){
            $.extend(this, data);
        },
        getController: function(){
            return this.mage.controller;
        },
        getBaseUrl: function(){
            return this.mage.baseUrl;
        },
        getEventsToListen: function(){
            return this.listen;
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
                category : this.parent.getController(),
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
                category : this.parent.getController(),
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
                category : this.parent.getController(),
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
                category : this.parent.getController(),
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
                category : this.parent.getController(),
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
                category : this.parent.getController(),
                action: this.actionText,
                label: this.labelText
            }
        }

    };

    // checkout events listening
    window.analytics.checkout = {

        init: function(parent){
            this.parent = parent;
            this.cart = {};
            this.actionText = {};
            this.actionText['gaevent:checkout:cart'] = 'View Cart';
            this.actionText['gaevent:checkout:onepage'] = 'Go to Checkout';
            // listen jQuery event and send GA Event
            $.gaEvents([
                {
                    name: 'gaevent:checkout:cart',
                    selector: '',
                    handler: this.sendGaEvent.bind(this)
                },
                {
                    name: 'gaevent:checkout:onepage',
                    selector: '',
                    handler: this.sendGaEvent.bind(this)
                }
            ]);
            this.getCartTotals();
        },

        sendGaEvent: function(target, eventName){
            if (!this.cart.count) {
                // no items in cart send no event
                return false;
            }
            var labelText = (this.cart.count < 2) ? this.cart.count+' item'
                    : this.cart.count+' items';
            return {
                category : this.parent.getController(),
                action: this.actionText[eventName],
                label: labelText,
                value: Math.round(parseFloat(this.cart.total))
            }
        },

        getCartTotals: function(){
            $.ajax({
                url: this.parent.getBaseUrl() + "gaevents/get/cart",
                success: function(result){
                    this.cart = result;
                }.bind(this)
            });
        }

    }

})($j);

$j(function() {

    // TRIGER CUSTOM EVENTS FOR ADD TO COMPARE/WISHLIST
    var selector = 'a, button.btn-checkout';
    $j('body').on('click', selector, function(e){
        var url = $j(this).attr('href');
        if (typeof url !== 'undefined' && !$j(this).hasClass('skip-link')) {
            // A-element clicked; check despination
            if (url.indexOf('catalog/product_compare/add') != -1) {
                // it is addto compare click
                $j(this).trigger('gaevent:product:addedtocompare');
            } else if (url.indexOf('wishlist/index/add') != -1) {
                // it is add to wishlist click
                $j(this).trigger('gaevent:product:addedtowishlist');
            } else if (url.indexOf('/checkout/cart') != -1) {
                // trigger event when clicked on url to checkout cart
                $j(this).trigger('gaevent:checkout:cart');
            } else if (url.indexOf('/checkout') != -1) {
                // trigger event when clicked on url to onepage checkout
                $j(this).trigger('gaevent:checkout:onepage');
            } else if (url.indexOf('/firecheckout') != -1) {
                // trigger event when clicked on url to firecheckout
                $j(this).trigger('gaevent:checkout:onepage');
            }
        } else if ($j(this).hasClass('btn-checkout')) {
            var onclick = $j(this).attr('onclick');
            if (onclick.indexOf('setLocation(') == -1) {
                // only if onclick has no setLocation call
                // trigger event when clicked on button to onepage checkout
                $j(this).trigger('gaevent:checkout:onepage');
            }
        };
    });

    setLocation = setLocation.wrap(function(callOriginal, url){
        // skip add to cart event
        if (url.indexOf('/checkout/cart/add') == -1) {
            // trigger checkout event when location to checkout cart or page
            if (url.indexOf('/checkout/cart') != -1) {
                $j(document).trigger('gaevent:checkout:cart');
            } else if (url.indexOf('/checkout') != -1) {
                $j(document).trigger('gaevent:checkout:onepage');
            } else if (url.indexOf('/firecheckout') != -1) {
                $j(document).trigger('gaevent:checkout:onepage');
            };
        };
        return callOriginal(url);
    });

    // INITIALIZE EVENTS LISTENERS
    $j.each(analytics.getEventsToListen(), function(key, value){
        if (value == '1') {
            analytics[key].init(analytics);
        } else {
            delete analytics[key];
        }
    });

});

(function($){

    function getProductName(element, parentSelector) {
        var name = $(element).closest(parentSelector)
            .find(this.productNameSelector).first().text();
        return $.trim(name);
    };

    function getProductPrice(element, parentSelector) {
        // find product price
        var parentElement = $(element).closest(parentSelector);
        var price = parentElement.find(this.priceSelector).text();
        if (!price) { price = '0'; }
        price = price.replace(/[^\d.-]/g, ''); // remove all chars except digits and dot

        return Math.round(parseFloat(price));
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

        sendGaEventClick: function(event){
            var button = $(event.target).closest('.btn-cart');
            if ($(button).data('gaEventButtonClickOff')) { return false; }
            return {
                category : this.parent.getController(),
                action: $(button).text(),
                label: getProductName.call(this, button, '.item'),
                value: getProductPrice.call(this, button, '.item')
            }
        },

        sendGaEventSubmit: function(event){
            var productEssential = $(event.target)
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

        init: function (parent) {
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

        sendGaEvent: function (event) {
            if ($(event.target).data('gaEventStop')) { return false; }
            return {
                category : this.parent.getController(),
                action: $(event.target).text(),
                label: getProductName.call(this, event.target, '.item, .product-essential'),
                value: getProductPrice.call(this, event.target, '.item, .product-essential')
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

        sendGaEvent: function (event) {
            if ($(event.target).data('gaEventStop')) { return false; }
            return {
                category : this.parent.getController(),
                action: $(event.target).text(),
                label: getProductName.call(this, event.target, '.item, .product-essential'),
                value: getProductPrice.call(this, event.target, '.item, .product-essential')
            }
        }

    };

})($j);

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

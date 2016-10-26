//
// integrate GA Events with Ajax Pro extension
//
document.observe("AjaxPro:addObservers:after", function(){

    if (typeof window.analytics === 'undefined') {
        console.warn('Seems like GA Plugin Events disabled...');
        return;
    }

    // after initalizing AjaxPro prevent sending GA event on click in product listing
    $$('.btn-cart').each(function(el){
        if (typeof $j(el).data('gaEventButtonClickOff') !== 'undefined' ) {
            // do not set attribute if it is already set
            return;
        }
        var onClickValue = el.readAttribute('onclick');
        if (typeof onClickValue !== 'string') {
            onClickValue = '';
        }
        if (onClickValue.search('checkout/cart/add') === -1) {
            $j(el).data('gaEventButtonClickOff', true);
        } else {
            $j(el).data('gaEventButtonClickOff', false);
        }
    });

    // wrap product add to cart form on product listing after popup appeared
    analytics.addToCart.wrapProductAddToCartSubmit();

});

document.observe("AjaxPro:click:stop", function(event){

    if (typeof window.analytics === 'undefined') {
        console.warn('Seems like GA Plugin Events disabled...');
        return;
    }

    var element = Event.element(event.memo);
    var url = $j(element).attr('href');

    if (typeof url !== 'undefined') {
        if (url.indexOf('catalog/product_compare/add') != -1) {
            // it is addto compare click
            $j(element).trigger('gaevent:product:addedtocompare');
        } else if (url.indexOf('wishlist/index/add') != -1) {
            // it is add to wishlist click
            $j(element).trigger('gaevent:product:addedtowishlist');
        }
    }

});

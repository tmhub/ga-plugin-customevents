//
// integrate GA Events with Ajax Pro extension
//
document.observe("AjaxPro:addObservers:after", function(){

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
    analitycs.addToCart.wrapProductAddToCartSubmit();

});

document.observe("AjaxPro:click:stop", function(event){
    // send custom event if add to compare clicked
    var element = Event.element(event.memo);
    if (element.hasClassName('link-compare')) {
        $j(element).trigger('gaevent:product:addedtocompare');
    }
});

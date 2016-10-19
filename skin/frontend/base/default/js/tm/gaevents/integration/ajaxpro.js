// integrate GA Events with Ajax Pro extension
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

    analitycs.addToCart.wrapProductAddToCartSubmit();
});

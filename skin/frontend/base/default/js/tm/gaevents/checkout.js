(function($){

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

        sendGaEvent: function(event){
            if (!this.cart.count) {
                // no items in cart send no event
                return false;
            }
            var labelText = (this.cart.count < 2) ? this.cart.count+' item'
                    : this.cart.count+' items';
            return {
                category : this.parent.getController(),
                action: this.actionText[event.type],
                label: labelText,
                value: Math.round(parseFloat(this.cart.total))
            }
        },

        getCartTotals: function(){
            if (typeof this.parent === 'undefined') { return; }
            if (!this.parent.getBaseUrl()) { return; }
            $.ajax({
                url: this.parent.getBaseUrl() + "gaevents/get/cart",
                success: function(result){
                    this.cart = result;
                }.bind(this)
            });
        }

    };

})($j);

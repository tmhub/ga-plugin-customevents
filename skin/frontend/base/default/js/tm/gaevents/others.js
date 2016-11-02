(function($){

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

        sendGaEvent: function(event){
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

        sendGaEvent: function(event){
            return {
                category : this.parent.getController(),
                action: this.actionText,
                label: this.labelText
            }
        }

    };

})($j);

// analytics object definition
(function($){

    window.analytics = {
        init: function(data){
            $.extend(this, data);
        },
        getController: function(){
            return this.mage.controller;
        },
        getBaseUrl: function(){
            return (typeof this.mage.baseUrl !== 'undefined' )
                ? this.mage.baseUrl
                : false;
        },
        getEventsToListen: function(){
            return this.listen;
        }
    };

})($j);

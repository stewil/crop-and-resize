(function(){
    "use strict";

    module.exports = FileInput();

    function FileInput(){

        var _eventsQueue = require('../events-queue/events-queue.js'),
            _settings    = require('../settings/settings.js'),
            _subscribers = [],
            _this        = {};

        /*========================================================================
            PUBLIC
        ========================================================================*/

        init();
        _this.onFileChange = storeSubscriber;

        return _this;
        /*========================================================================
            PRIVATE
        ========================================================================*/

        function init(){
            _eventsQueue.subscribe('change', _settings.fileInput, onFileInputChange);
        }

        function storeSubscriber(fn){
            _subscribers.push(fn);
        }

        function notifySubscribers(file){
            var totalSubscribers= _subscribers.length;
            while(totalSubscribers--){
                if(_subscribers[totalSubscribers] && typeof _subscribers[totalSubscribers] === 'function'){
                    _subscribers[totalSubscribers](file);
                }
            }
        }

        function onFileInputChange(e){
            var files       = this.files;

            for(var file in files){
                if(files[file] instanceof Blob){
                    return notifySubscribers(files[file]);
                }
            }
        }
    }
})();
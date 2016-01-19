(function(){
    "use strict";

    module.exports = FileInput;

    function FileInput(){

        var _eventsQueue = require('../events-queue/events-queue.js');

        var _subscribers = [];

        /*========================================================================
            PUBLIC
        ========================================================================*/

        this.fileUpload              = {};
        this.fileUpload.onFileChange = storeSubscriber;

        /*========================================================================
            PRIVATE
        ========================================================================*/

        _eventsQueue.subscribe('change', this.settings.fileInput, onFileInputChange);

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
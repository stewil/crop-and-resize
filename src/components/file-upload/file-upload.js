(function(){
    "use strict";

    module.exports = FileInput;

    function FileInput(inputElement){

        var _subscribers    = [];

        /*========================================================================
            PUBLIC
        ========================================================================*/

        this.fileInput              = {};
        this.fileInput.onFileChange = storeSubscriber;

        /*========================================================================
            PRIVATE
        ========================================================================*/

        this.eventsQueue.subscribe('change', this.settings.fileInput, onFileInputChange);

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
                if(typeof files[file] === 'object' && files[file].type.match('image.*')){
                    return onFileChosen(files[file]);
                }
            }
        }

        function onFileChosen(file){
            var reader = new FileReader();
            reader.onload = onReaderLoad;
            reader.readAsDataURL(file);
            function onReaderLoad(e){
                notifySubscribers(e.target.result);
            }
        }
    }
})();
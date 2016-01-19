(function(){
    module.exports = DragDropDependencies;

    function DragDropDependencies(){

        var _eventsQueue    = require('../events-queue/events-queue.js');

        var _cropResize     = this,
            _subscribers    = [],
            focusClassName  = 'drag-over';

        /*========================================================================
            PUBLIC
        ========================================================================*/

        this.dragDrop = {};
        this.dragDrop.onFileChange = onFileChange;

        /*========================================================================
            PRIVATE
        ========================================================================*/

        if(this.settings.dropArea){
            _eventsQueue.subscribe('drop',      this.settings.dropArea, onDrop);
            _eventsQueue.subscribe('dragover',  this.settings.dropArea, onDragOver);
            _eventsQueue.subscribe('dragleave', this.settings.dropArea, onDragLeave);
            _eventsQueue.subscribe('dragenter', this.settings.dropArea, onDragEnter);
        }

        function onFileChange(fn){
            _subscribers.push(fn);
        }

        function onDrop(evt){
            if(!_cropResize.cropWindow.isHeld){
                evt.preventDefault();

                var data             = evt.dataTransfer.files,
                    totalSubscribers = _subscribers.length;

                if(data[0] instanceof Blob){
                    while(totalSubscribers--){
                        if(_subscribers[totalSubscribers] && typeof _subscribers[totalSubscribers] === 'function'){
                            _subscribers[totalSubscribers](data[0]);
                        }
                    }
                }
            }
        }

        function onDragOver(evt) {
            if(!_cropResize.cropWindow.isHeld){
                evt.preventDefault();
                evt.dataTransfer.dropEffect = 'copy';
            }
        }

        function onDragEnter(evt){
            _cropResize.settings.dropArea.classList.add(focusClassName);
        }

        function onDragLeave(evt){
            _cropResize.settings.dropArea.classList.remove(focusClassName);
        }

    }
})();
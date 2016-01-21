(function(){
    module.exports = DragDropDependencies();

    function DragDropDependencies(){

        var _eventsQueue   = require('../events-queue/events-queue.js'),
            _settings      = require('../settings/settings.js'),
            _cropWindow    = require('../crop-window/crop-window.js'),
            _subscribers   = [],
            _this          = {},
            focusClassName = 'drag-over';

        /*========================================================================
            PUBLIC
        ========================================================================*/
        
        _this.onFileChange = onFileChange;
        init();
        
        return _this;
        
        /*========================================================================
            PRIVATE
        ========================================================================*/

        function init(){
            if(_settings.dropArea){
                _eventsQueue.subscribe('drop',      _settings.dropArea, onDrop);
                _eventsQueue.subscribe('dragover',  _settings.dropArea, onDragOver);
                _eventsQueue.subscribe('dragleave', _settings.dropArea, onDragLeave);
                _eventsQueue.subscribe('dragenter', _settings.dropArea, onDragEnter);
            }
        }

        function onFileChange(fn){
            _subscribers.push(fn);
        }

        function onDrop(evt){
            if(!_cropWindow.isHeld){
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
            if(!_cropWindow.isHeld){
                evt.preventDefault();
                evt.dataTransfer.dropEffect = 'copy';
            }
        }

        function onDragEnter(evt){
            _settings.dropArea.classList.add(focusClassName);
        }

        function onDragLeave(evt){
            _settings.dropArea.classList.remove(focusClassName);
        }

    }
})();
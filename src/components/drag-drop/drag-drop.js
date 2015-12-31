(function(){
    module.exports = DragDropDependencies;

    function DragDropDependencies(dragDropTarget){

        var _subscribers    = [],
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
            this.eventsQueue.subscribe('drop',      this.settings.dropArea, onDrop);
            this.eventsQueue.subscribe('dragover',  this.settings.dropArea, onDragOver);
            this.eventsQueue.subscribe('dragleave', this.settings.dropArea, onDragLeave);
            this.eventsQueue.subscribe('dragenter', this.settings.dropArea, onDragEnter);
        }

        function onFileChange(fn){
            _subscribers.push(fn);
        }

        function onDrop(evt){
            evt.stopPropagation();
            evt.preventDefault();

            var data             = evt.dataTransfer.files,
                totalSubscribers = _subscribers.length;

            while(totalSubscribers--){
                if(_subscribers[totalSubscribers] && typeof _subscribers[totalSubscribers] === 'function'){
                    _subscribers[totalSubscribers](data[totalSubscribers]);
                }
            }

        }

        function onDragOver(evt) {
            evt.stopPropagation();
            evt.preventDefault();
            evt.dataTransfer.dropEffect = 'copy';
        }

        function onDragEnter(evt){
            dragDropTarget.classList.add(focusClassName);
        }

        function onDragLeave(evt){
            dragDropTarget.classList.remove(focusClassName);
        }

    }
})();
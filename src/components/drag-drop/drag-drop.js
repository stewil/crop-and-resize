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

        this.eventsQueue.subscribe('drop',      dragDropTarget, onDrop);
        this.eventsQueue.subscribe('dragover',  dragDropTarget, onDragOver);
        this.eventsQueue.subscribe('dragleave', dragDropTarget, onDragLeave);
        this.eventsQueue.subscribe('dragenter', dragDropTarget, onDragEnter);

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
(function(){
    module.exports = DragDropDependencies;

    function DragDropDependencies(_eventQueues, dragDropTarget){

        var _subscribers    = [],
            focusClassName  = 'drag-over';

        _eventQueues.subscribe('drop',      dragDropTarget, onDrop);
        _eventQueues.subscribe('dragover',  dragDropTarget, onDragOver);
        _eventQueues.subscribe('dragleave', dragDropTarget, onDragLeave);
        _eventQueues.subscribe('dragenter', dragDropTarget, onDragEnter);

        return {
            onFileChange:onFileChange
        };

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
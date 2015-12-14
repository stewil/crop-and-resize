(function(){
    module.exports = DragDropDependencies;

    function DragDropDependencies(_eventQueues, dragDropTarget){

        var _subscribers = [];

        _eventQueues.subscribe('drop',      dragDropTarget, onDrop);
        _eventQueues.subscribe('dragover',  dragDropTarget, onDragOver);

        return {
            onDropComplete:onDropComplete
        };

        function onDropComplete(fn){
            _subscribers.push(fn);
        }

        function onDrop(evt){
            evt.stopPropagation();
            evt.preventDefault();

            var data             = evt.dataTransfer.files,
                totalSubscribers = _subscribers.length;

            while(totalSubscribers--){
                _subscribers[totalSubscribers](data[0]);
            }

        }

        function onDragOver(evt) {
            evt.stopPropagation();
            evt.preventDefault();
            evt.dataTransfer.dropEffect = 'copy';
        }

    }
})();
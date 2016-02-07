(function(){

    module.exports = MouseEvents(
        require('../events-queue/events-queue.js'),
        require('../throttle/throttle.js')
    );

    function MouseEvents(_eventsQueue, _throttle){

        /*----------------------------------------------------------------------
            PRIVATE VARIABLES
         ----------------------------------------------------------------------*/
        var _root              = {},
            _dragSubscribers   = [],
            _onDownSubscribers = [],
            _onUpSubscribers   = [],
            _isHeld            = false,
            _isMoving          = false,
            _isDragging        = false,
            _mouseMoveData     = {},
            _startEvent;

        /*----------------------------------------------------------------------
            PUBLIC METHODS
        ----------------------------------------------------------------------*/

        _root.isHeld  = isHeld;
        _root.onDrag  = subscribeToDrag;
        _root.onDown  = subscribeToDown;
        _root.onUp    = subscribeToUp;

        /*----------------------------------------------------------------------
            INIT
        ----------------------------------------------------------------------*/

        init();
        return _root;

        /*----------------------------------------------------------------------
            PRIVATE METHODS
         ----------------------------------------------------------------------*/

        function init(){
            _eventsQueue.subscribe("mousedown", window, mouseDownHandler);
            _eventsQueue.subscribe("mouseup",   window, mouseUpHandler);
            _eventsQueue.subscribe("mousemove", window, onMouseMoveHandler);
            _eventsQueue.subscribe("dragstart", window, onDragStartHandler);
            _eventsQueue.subscribe("dragend",   window, onDragEndHandler);
            _eventsQueue.subscribe("drag",      window, _throttle(onDragHandler, 100));
        }

        function subscribeToDrag(fn){
            _dragSubscribers.push(fn);
        }

        function subscribeToDown(fn){
            _onDownSubscribers.push(fn);
        }

        function subscribeToUp(fn){
            _onUpSubscribers.push(fn);
        }

        function notifyDragSubscribers(){
            for(var i = 0; i < _dragSubscribers.length; i++){
                _dragSubscribers[i](_mouseMoveData)
            }
        }

        function notifyDownSubscribers(e){
            for(var i = 0; i < _onDownSubscribers.length; i++){
                _onDownSubscribers[i](e);
            }
        }

        function notifyUpSubscribers(e){
            for(var i = 0; i < _onUpSubscribers.length; i++){
                _onUpSubscribers[i](e);
            }
        }

        function isHeld(){
            return _isHeld;
        }

        function mouseDownHandler(e){
            onDown(e);
            _isHeld    = true;
            _isMoving  = true
        }

        function onDragStartHandler(e){
            onDown(e);
            _isHeld     = true;
            _isDragging = true;
        }

        function onDown(e){
            if(!_startEvent){
                _startEvent = e;
                notifyDownSubscribers(e);
            }
        }

        function mouseUpHandler(e){
            _isMoving = false;
            if(!_isDragging){
                onUp(e);
            }
        }

        function onDragEndHandler(e){
            _isDragging = false;
            if(!_isMoving){
                onUp(e);
            }
        }

        function onUp(e){
            _startEvent = null;
            _isHeld     = false;
            notifyUpSubscribers(e);
        }

        function onDragHandler(e){
            onMove(e);
        }

        function onMouseMoveHandler(e){
            if(!_isDragging){
                onMove(e);
            }
        }

        function onMove(e){
            if(_isHeld){
                updateMouseMoveData(_startEvent, e);
                notifyDragSubscribers(e);
            }
        }

        function updateMouseMoveData(startData, eventData){

            var newMouseMoveData = {};

            startData = startData || {};
            eventData = eventData || {};

            newMouseMoveData['x']       = eventData.x - startData.x;
            newMouseMoveData['y']       = eventData.y - startData.y;
            newMouseMoveData['clientX'] = eventData.clientX - startData.clientX;
            newMouseMoveData['clientY'] = eventData.clientY - startData.clientY;

            _mouseMoveData = newMouseMoveData;
        }
    }
})();
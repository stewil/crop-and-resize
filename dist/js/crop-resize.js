(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function(document, window){

    window['CropResize'] = CropResize;

    function CropResize(element, attributes){

        this.remove = remove;
        this.images = {};

        //CLASSES
        var _eventQueues    = require('./classes/events-queue.js')(),
            dragDrop        = require('./classes/drag-drop.js')(_eventQueues, attributes['dragDropTarget']),
            cropWindow      = require('./classes/crop-window.js')(element, _eventQueues, createImgInstance),
            bindCanvas      = require('./classes/canvas.js')(_eventQueues),
            fileInput       = require('./classes/file-input.js')(_eventQueues, element);

        init();

        function init(){
            fileInput.onFileChange(onFileProcessed);
            dragDrop.onFileChange(onFileProcessed);
        }

        function onFileProcessed(file){

            var parent      =   element.parentElement,
                canvas      =   document.createElement('canvas');

            if(attributes['target']){
                attributes['target'].appendChild(canvas)
            }else{
                parent.insertBefore(canvas, element);
            }

            bindCanvas(canvas, file).onChange(function(canvasData){
                console.log(canvasData);
                cropWindow((attributes['target'] || parent), canvasData.canvas, canvasData.context);
            });
        }

        function remove(){
            _eventQueues.removeAll();
        }

        function createImgInstance(croppedImageData, croppedImageElement, target, width, height){
            var buffer = document.createElement('canvas'),
                bufferCtx = buffer.getContext("2d");

            buffer.width    =   width;
            buffer.height   =   height;
            bufferCtx.putImageData(croppedImageData, 0, 0);

            croppedImageElement.src = buffer.toDataURL('image/png');

            if(target && !target.contains(croppedImageElement)){
                target.appendChild(croppedImageElement);
            }
            return croppedImageElement;
        }

        function bytesToSize(bytes) {
            var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
            if (bytes == 0) return '0 Byte';
            var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
            return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
        }

    }

})(document, window);
},{"./classes/canvas.js":2,"./classes/crop-window.js":3,"./classes/drag-drop.js":4,"./classes/events-queue.js":5,"./classes/file-input.js":6}],2:[function(require,module,exports){
(function() {
    module.exports = CanvasDependencies;

    function CanvasDependencies(_eventQueues) {
        
        var _onChangeQueue  =   [],
            _image          =   new Image(),
            _source         =   {},
            _canvas         =   {},
            _canvasElement,
            _context;

        _image.onload       =   onCanvasSrcLoad;
        _eventQueues.subscribe('resize', window, cacheCanvasDimensions);

        return function(canvasElement, file){
            _canvasElement  =   canvasElement;
            _context        =   _canvasElement.getContext('2d');
            _image.src      =   file;
            return {
                onChange:storeOnChange
            };
        };

        function onCanvasSrcLoad(e){
            _source['width']  = this.width;
            _source['height'] = this.height;

            _canvas['width']  = _canvasElement.width;
            _canvas['height'] = _canvasElement.height;

            var canvasParams = measureContext();

            _context.clearRect(0, 0, _canvas.width, _canvas.height);
            _context.drawImage(_image,
                canvasParams.sx,
                canvasParams.sy,
                canvasParams.sWidth,
                canvasParams.sHeight,
                canvasParams.dx,
                canvasParams.dy,
                canvasParams.dWidth,
                canvasParams.dHeight
            );
            cacheCanvasDimensions();
            notify();
        }

        function storeOnChange(fn){
            _onChangeQueue.push(fn);
        }
        
        function notify(){
            var totalSubscribers= _onChangeQueue.length;
            while(totalSubscribers--){
                if(_onChangeQueue[totalSubscribers] && typeof _onChangeQueue[totalSubscribers] === 'function'){
                    _onChangeQueue[totalSubscribers]({
                        source:_source,
                        canvas:_canvas,
                        context:_context
                    });
                }
            }
        }
        
        function cacheCanvasDimensions(){
            if(_canvasElement){
                var canvasBounding = _canvasElement.getBoundingClientRect();

                _canvas['top']      = canvasBounding.top;
                _canvas['left']     = canvasBounding.left;
                _canvas['cWidth']   = _canvasElement.clientWidth;
                _canvas['cHeight']  = _canvasElement.clientHeight;
            }
        }

        function measureContext(){
            var hRatio      =   _canvas.width  / _source.width,
                vRatio      =   _canvas.height  / _source.height,
                ratio       =   Math.min ( hRatio, vRatio);

            return {
                sx:         0,
                sy:         0,
                sWidth:     _source.width,
                sHeight:    _source.height,
                dx:         (_canvas.width - _source.height * ratio ) / 2,
                dy:         (_canvas.height - _source.height * ratio ) / 2,
                dWidth:     _source.width * ratio,
                dHeight:    _source.height * ratio
            }
        }

        return function bindCanvas() {
            var self = this,
                canvas = document.createElement('canvas');

            self['canvas']          =   {};
            self.canvas['element']  =   canvas;
            self.canvas['context']  =   self.canvas.element.getContext('2d');

            var parent      =   _element.parentElement,
                image       =   new Image();

            image.onload    =   onCanvasImageLoad;
            image.src       =   self.original.url;



            /*function cacheCanvasDimensions(e){
                var canvasBounding = canvas.getBoundingClientRect();

                self.canvas['top']      = canvasBounding.top;
                self.canvas['left']     = canvasBounding.left;
                self.canvas['left']     = canvasBounding.left;
                self.canvas['cWidth']   = canvas.clientWidth;
                self.canvas['cHeight']   = canvas.clientHeight;
            }*/

            function onCanvasImageLoad(){
                self.original['width']  =   this.width;
                self.original['height'] =   this.height;

                self.canvas['width']    =   self['canvas'].element.width;
                self.canvas['height']   =   self['canvas'].element.height;

                var canvasParams = measurements(self.original, self.canvas);


                //TODO:This information should be passed into the function
                /*if(attributes['target']){
                    attributes['target'].appendChild(self.canvas.element)
                }else{
                    parent.insertBefore(self.canvas.element, _element);
                }*/

                self.canvas.context.clearRect(0, 0, self.canvas['width'], self.canvas['height']);
                self.canvas.context.drawImage(image,
                    canvasParams.sx,
                    canvasParams.sy,
                    canvasParams.sWidth,
                    canvasParams.sHeight,
                    canvasParams.dx,
                    canvasParams.dy,
                    canvasParams.dWidth,
                    canvasParams.dHeight
                );

                cropWindow((attributes['target'] || parent), self.canvas);
                cacheCanvasDimensions();

                function measurements(image, canvas){
                    var hRatio      =   canvas.width  / image.width,
                        vRatio      =   canvas.height  / image.height,
                        ratio       =   Math.min ( hRatio, vRatio);

                    return {
                        sx:         0,
                        sy:         0,
                        sWidth:     image.width,
                        sHeight:    image.height,
                        dx:         (canvas['width'] - image['width'] * ratio ) / 2,
                        dy:         (canvas['height'] - image['height'] * ratio ) / 2,
                        dWidth:     image.width * ratio,
                        dHeight:    image.height * ratio
                    }
                }

            }
        }
    }
})();
},{}],3:[function(require,module,exports){
(function(){
    module.exports = CropWindowDependencies;

    function CropWindowDependencies(_element, _eventQueues, createImgInstance){
        return function(target, canvas, context){

            var _translate          =   {},
                _focusElement,
                croppedImage        =   document.createElement('img'),
                isHeld              =   false,
                mouseStart          =   {},
                cropWindowElement   =   document.createElement('div'),
                _handles            =   Handles(),
                baseWidth,
                baseHeight;

            _eventQueues.subscribe('mousemove', window, onCropMove);
            _eventQueues.subscribe('mousedown', window, onCropMouseDown);
            _eventQueues.subscribe('mouseup',   window, onCropMouseUp);

            createCropWindow();

            function createCropWindow(){
                cropWindowElement.className = 'cr-crop-window';

                for(var i = 0; i < _handles.length; i++){
                    (function(){
                        var cropHandle = document.createElement('div');
                        cropHandle.className = "cr-crop-handle cr-" + _handles[i].class;
                        _handles[i].element = cropHandle;
                        cropWindowElement.appendChild(cropHandle);
                    })();
                }

                target.appendChild(cropWindowElement);

                baseHeight = cropWindowElement.clientHeight;
                baseWidth = cropWindowElement.clientWidth;
            }

            function Handles(){

                return [
                    handleObject('handle-top-left'),
                    handleObject('handle-top-center'),
                    handleObject('handle-top-right'),
                    handleObject('handle-right-middle'),
                    handleObject('handle-bottom-right'),
                    handleObject('handle-bottom-center'),
                    handleObject('handle-bottom-left'),
                    handleObject('handle-left-middle'),
                    handleObject('center-point')
                ];

                function handleObject(className){
                    return {
                        "class":className
                    }
                }
            }

            function onCropMove(e){
                if(isHeld){

                    var maxLeft         = cropWindowElement.offsetLeft * -1,
                        maxTop          = cropWindowElement.offsetTop * -1,
                        maxRight        = cropWindowElement.offsetLeft - (cropWindowElement.clientWidth - baseWidth),
                        maxBottom       = cropWindowElement.offsetTop - (cropWindowElement.clientHeight - baseHeight),
                        canvasWidth     = canvas.cWidth,
                        canvasHeight    = canvas.cHeight,
                        newX            = (_translate.x + Number(e.x - mouseStart.x)),
                        newY            = (_translate.y + Number(e.y - mouseStart.y)),
                        maxHeight,
                        maxWidth;

                    if(newX < maxLeft){
                        newX = maxLeft;
                    }
                    if(newX > maxRight){
                        newX = maxRight;
                    }
                    if(newY < maxTop){
                        newY = maxTop;
                    }
                    if(newY > maxBottom){
                        newY = maxBottom;
                    }

                    if(_focusElement === cropWindowElement){
                        cropWindowElement.style.transform = "translate(" + newX + "px, " + newY + "px)";
                    }else{
                        if(_focusElement.class.match(/top-left/g)){
                            cropWindowElement.style.transform = "translate(" + newX + "px, " + newY + "px)";
                            cropWindowElement.style.width = _translate.width - (e.x - mouseStart.x);
                            cropWindowElement.style.height = _translate.height - (e.y - mouseStart.y);
                        }else{
                            if(_focusElement.class.match(/top/g)){
                                cropWindowElement.style.transform = "translate(" + _translate.x + "px, " + newY + "px)";
                                cropWindowElement.style.height = _translate.height - (e.y - mouseStart.y);
                            }
                            if(_focusElement.class.match(/bottom/g)){
                                maxHeight = canvasHeight - cropWindowElement.offsetTop;
                                cropWindowElement.style.height = Math.min(_translate.height + (e.y - mouseStart.y), maxHeight);
                            }
                            if(_focusElement.class.match(/right/g)){
                                maxWidth = canvasWidth - cropWindowElement.offsetLeft;
                                cropWindowElement.style.width = Math.min(_translate.width + (e.x - mouseStart.x), maxWidth);
                            }
                            if(_focusElement.class.match(/left/g)){
                                cropWindowElement.style.transform = "translate(" + newX + "px, " + _translate.y + "px)";
                                cropWindowElement.style.width = _translate.width - (e.x - mouseStart.x);
                            }
                        }

                    }

                    generatePreviewDimensions();
                }
            }

            function generatePreviewDimensions(){
                var canvasWidth         =   canvas.cWidth,
                    canvasHeight        =   canvas.cHeight,
                    heightPercent       =   cropWindowElement.clientHeight / canvasHeight,
                    widthPercent        =   cropWindowElement.clientWidth / canvasWidth,
                    leftPercent         =   (cropWindowElement.getBoundingClientRect().left - canvas.left) / canvasWidth,
                    topPercent          =   (cropWindowElement.getBoundingClientRect().top - canvas.top) / canvasHeight,
                    newWidth            =   canvas.width * widthPercent,
                    newHeight           =   canvas.height * heightPercent,
                    newImgData          =   context.getImageData(
                                                canvas.width * leftPercent,
                                                canvas.height * topPercent,
                                                newWidth,
                                                newHeight);

                createImgInstance(newImgData, croppedImage, _element.parentNode, newWidth, newHeight);
            }

            function onCropMouseDown(e){
                if(e.target.className.match("-crop-")){

                    var transform = (cropWindowElement.style['transform' || 'webkitTransform' || 'mozTransform'] || "").match(/(\d+)|(-\d+)/g) || [];

                    isHeld                  =   true;
                    mouseStart['x']         =   e.x;
                    mouseStart['y']         =   e.y;
                    _translate['x']         =   Number(transform[0] || 0);
                    _translate['y']         =   Number(transform[1] || 0);
                    _translate['width']     =   cropWindowElement.clientWidth;
                    _translate['height']    =   cropWindowElement.clientHeight;

                    _focusElement = e.target === cropWindowElement ? '' : '';

                    if(e.target === cropWindowElement || e.target.className.match(/center-point/gi)){
                        _focusElement = cropWindowElement;
                    }else{
                        for(var i = 0; i < _handles.length; i++){
                            if(e.target === _handles[i].element){
                                _focusElement = _handles[i];
                                break;
                            }
                        }
                    }
                }
            }

            function onCropMouseUp(e){
                isHeld = false;
                _focusElement = null;
            }

        }
    }
})();
},{}],4:[function(require,module,exports){
(function(){
    module.exports = DragDropDependencies;

    function DragDropDependencies(_eventQueues, dragDropTarget){

        var _subscribers = [];

        _eventQueues.subscribe('drop',      dragDropTarget, onDrop);
        _eventQueues.subscribe('dragover',  dragDropTarget, onDragOver);

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

    }
})();
},{}],5:[function(require,module,exports){
(function(){
    module.exports = EventsQueueDependencies;

    function EventsQueueDependencies(){

        var _queue = [];

        return {
            subscribe   :subscribe,
            removeAll   :removeAll
        };


        function subscribe(eventName, element, subscriberFn){

            var knownQueueItem;

            for(var i = 0; i < _queue.length; i++){
                if(_queue[i].eventName === eventName && _queue[i].element === element){
                    _queue[i].events.push(subscriberFn);
                    knownQueueItem = _queue[i];
                    break;
                }
            }
            return (knownQueueItem || new EventObject(eventName, element, subscriberFn))['publicEvents'];
        }

        function EventObject(eventName, element, subscriberFn){

            var queueObject = {
                events      : [subscriberFn],
                element     : element,
                eventName   : eventName,
                publicEvents:{
                    unSubscribe:unSubscribe
                }
            };

            _queue.push(queueObject);

            element.addEventListener(eventName, onEvent);

            return queueObject;

            function onEvent(e){
                for(var i = 0; i < queueObject.events.length; i++){
                    queueObject.events[i].call(this, e);
                }
            }

            function unSubscribe(){

                var functionIdx = queueObject.events.indexOf(subscriberFn);

                if(functionIdx > -1 && queueObject){
                    queueObject.events.splice(functionIdx, 1);
                }

                if(queueObject.events.length <= 0){
                    element.removeEventListener(eventName, subscriberFn);
                    _queue.splice(_queue.indexOf(queueObject), 1);
                }
            }
        }

        function removeAll(){
            var l = _queue.length;
            while(l--){
                _queue[l].events = [];
                _queue[l].publicEvents.unSubscribe();
            }
        }

    }
})();
},{}],6:[function(require,module,exports){
(function(){
    "use strict";

    module.exports = FileInput;

    function FileInput(_eventQueues, inputElement){

        var _subscribers = [];

        _eventQueues.subscribe('change', inputElement, onFileInputChange);

        return {
            onFileChange:storeSubscriber
        };

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
},{}]},{},[1]);

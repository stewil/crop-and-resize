(function e(t, n, r) {
    function s(o, u) {
        if (!n[o]) {
            if (!t[o]) {
                var a = typeof require == "function" && require;
                if (!u && a) return a(o, !0);
                if (i) return i(o, !0);
                var f = new Error("Cannot find module '" + o + "'");
                throw f.code = "MODULE_NOT_FOUND", f
            }
            var l = n[o] = {
                exports: {}
            };
            t[o][0].call(l.exports, function(e) {
                var n = t[o][1][e];
                return s(n ? n : e)
            }, l, l.exports, e, t, n, r)
        }
        return n[o].exports
    }
    var i = typeof require == "function" && require;
    for (var o = 0; o < r.length; o++) s(r[o]);
    return s
})({
    1: [function(require, module, exports) {
        (function(document, window) {

            window['CropResize'] = CropResize;

            function CropResize(cropArea, attributes) {

                var _application = {};

                /*========================================================================
                    PUBLIC
                ========================================================================*/
                _application.destroy = destroy;
                _application.getInfo = getInfo;

                /*========================================================================
                    PRIVATE
                ========================================================================*/
                var _settings = require('./components/settings/settings.js');

                _settings.bindSettings(cropArea, attributes);
                var _eventsQueue = require('./components/events-queue/events-queue.js'),
                    _information = require('./components/information/information.js'),
                    _dragDrop = require('./components/drag-drop/drag-drop.js'),
                    _cropWindow = require('./components/crop-window/crop-window.js'),
                    _cropArea = require('./components/crop-area/crop-area.js'),
                    _fileUpload = require('./components/file-upload/file-upload.js');

                _fileUpload.onFileChange(onFileProcessed);
                _dragDrop.onFileChange(onFileProcessed);
                _cropArea.onChange(updateCropWindow);

                return _application;

                function updateCropWindow(canvasData) {
                    _cropWindow.init();
                    _cropWindow.updateContext(canvasData);
                }

                function onFileProcessed(file) {
                    _information.resetData();
                    _information.updateProperty('originalImage', file);
                    _information.updateProperty('croppedImage', {
                        type: file.type,
                        name: file.name
                    });
                    _cropArea.changeFile(file);
                }

                function getInfo() {
                    _information.updateDataFor('croppedImage');

                    return _information.getImageData();
                }

                function destroy() {
                    _eventsQueue.removeAll();
                    _application = null;
                }
            }

        })(document, window);
    }, {
        "./components/crop-area/crop-area.js": 2,
        "./components/crop-window/crop-window.js": 3,
        "./components/drag-drop/drag-drop.js": 4,
        "./components/events-queue/events-queue.js": 5,
        "./components/file-upload/file-upload.js": 6,
        "./components/information/information.js": 7,
        "./components/settings/settings.js": 10
    }],
    2: [function(require, module, exports) {
        (function() {
            module.exports = CropArea();

            function CropArea() {

                var _eventsQueue = require('../events-queue/events-queue.js'),
                    _utils = require('../utils/utils.js'),
                    _settings = require('../settings/settings.js'),
                    _information = require('../information/information.js'),
                    _this = {},
                    _hasInit = false,
                    _onChangeQueue = [],
                    _image = new Image(),
                    _canvasElement,
                    _source,
                    _canvas,
                    _context;

                /*========================================================================
                    PUBLIC
                ========================================================================*/

                _this.changeFile = changeFile;
                _this.onChange = storeOnChange;

                return _this;

                /*========================================================================
                    PRIVATE
                ========================================================================*/

                function init() {
                    createCanvasElement();
                    bindListeners();
                    _hasInit = true;
                }

                function changeFile(file) {
                    if (!_hasInit) {
                        init();
                    }
                    _utils.fileToBase64(file, function(src) {
                        _information.updateProperty('originalImage', {
                            src: src,
                            file: _utils.base64toBlob(src)
                        });
                        _image.src = src;
                    });
                }

                function bindListeners() {
                    _image.onload = onCanvasSrcLoad;
                    _eventsQueue.subscribe('resize', window, cacheCanvasDimensions);
                }

                function createCanvasElement() {

                    var cropArea = _settings.cropArea,
                        tagName;

                    if (cropArea) {
                        tagName = cropArea.tagName.toLocaleLowerCase();

                        if (_settings.cropArea && !_utils.isClosedElement(_settings.cropArea)) {
                            if (tagName !== "canvas") {
                                _canvasElement = document.createElement('canvas');
                                cropArea.appendChild(_canvasElement);
                            } else {
                                _canvasElement = _settings.cropArea;
                            }

                            _context = _canvasElement.getContext('2d');
                        }
                    }
                }

                function onCanvasSrcLoad(e) {

                    var canvasParams;

                    _information.updateProperty('originalImage', {
                        width: this.width,
                        height: this.height
                    });

                    //Without a set size on the canvas the image data context with render at it's default dimensions of 300x150.
                    //CSS will then scale the scaled down image data up to the size that it calculates for the DOM.
                    _canvasElement.width = _canvasElement.offsetWidth;
                    _canvasElement.height = _canvasElement.offsetHeight;

                    _source = {};
                    _canvas = {};

                    _source['width'] = this.width;
                    _source['height'] = this.height;

                    _canvas['width'] = _canvasElement.width;
                    _canvas['height'] = _canvasElement.height;

                    canvasParams = measureContext();

                    _canvas['widthRatio'] = (canvasParams.asObject.dWidth / _canvas['width']);
                    _canvas['heightRatio'] = (canvasParams.asObject.dHeight / _canvas['height']);

                    _context.clearRect(0, 0, _canvas.width, _canvas.height);

                    canvasParams.asArray.unshift(_image);
                    _context.drawImage.apply(_context, canvasParams.asArray);
                    cacheCanvasDimensions();
                    notify(canvasParams);
                }

                function storeOnChange(fn) {
                    _onChangeQueue.push(fn);
                }

                function notify(canvasParams) {
                    var totalSubscribers = _onChangeQueue.length;
                    while (totalSubscribers--) {
                        if (_onChangeQueue[totalSubscribers] && typeof _onChangeQueue[totalSubscribers] === 'function') {
                            _onChangeQueue[totalSubscribers]({
                                source: _source,
                                canvas: _canvas,
                                context: _context,
                                canvasParams: canvasParams
                            });
                        }
                    }
                }

                function cacheCanvasDimensions() {
                    if (_canvasElement && _canvas) {
                        var canvasBounding = _canvasElement.getBoundingClientRect();
                        _canvas['top'] = canvasBounding.top;
                        _canvas['left'] = canvasBounding.left;
                        _canvas['cWidth'] = _canvasElement.offsetWidth;
                        _canvas['cHeight'] = _canvasElement.offsetHeight;
                    }
                }

                function measureContext() {
                    var hRatio = _canvas.width / _source.width,
                        vRatio = _canvas.height / _source.height,
                        ratio = Math.min(hRatio, vRatio),
                        paramsAsObject = {
                            sx: 0,
                            sy: 0,
                            sWidth: _source.width,
                            sHeight: _source.height,
                            dx: (_canvas.width - _source.width * ratio) / 2,
                            dy: (_canvas.height - _source.height * ratio) / 2,
                            dWidth: _source.width * ratio,
                            dHeight: _source.height * ratio
                        };
                    return {
                        asObject: paramsAsObject,
                        asArray: Object.keys(paramsAsObject).map(function(key) {
                            return paramsAsObject[key]
                        })
                    }
                }
            }
        })();
    }, {
        "../events-queue/events-queue.js": 5,
        "../information/information.js": 7,
        "../settings/settings.js": 10,
        "../utils/utils.js": 12
    }],
    3: [function(require, module, exports) {
        (function() {
            module.exports = CropWindowDependencies();

            function CropWindowDependencies() {

                var _settings = require('../settings/settings.js'),
                    _preview = require('../preview/preview.js'),
                    _mouseEvents = require('../mouse-events/mouse-events.js'),
                    _this = {},
                    _hasInit = false,
                    _translate = {},
                    _handles = Handles(),
                    _source,
                    _focusElement,
                    _canvasParams,
                    cropWindowElement = document.createElement('div'),
                    baseWidth,
                    baseHeight,
                    canvas,
                    context;

                /*========================================================================
                    PUBLIC
                ========================================================================*/
                _this.init = createCropWindow;
                _this.updateContext = updateContext;
                _this.isHeld = false;

                return _this;
                /*========================================================================
                    PRIVATE
                ========================================================================*/

                function updateContext(cropData) {
                    canvas = cropData.canvas;
                    context = cropData.context;
                    _source = cropData.source;
                    _canvasParams = cropData.canvasParams;
                    cropWindowElement.setAttribute('style', '');
                }

                function createCropWindow() {
                    if (!_hasInit) {
                        _mouseEvents.onDrag(onCropMove);
                        _mouseEvents.onDown(onCropMouseDown);
                        _mouseEvents.onUp(onCropMouseUp);

                        cropWindowElement.className = 'cr-crop-window';

                        for (var i = 0; i < _handles.length; i++) {
                            (function() {
                                var cropHandle = document.createElement('div');
                                cropHandle.className = "cr-crop-handle cr-" + _handles[i].class;
                                _handles[i].element = cropHandle;
                                cropWindowElement.appendChild(cropHandle);
                            })();
                        }

                        _settings.cropArea.appendChild(cropWindowElement);

                        baseWidth = cropWindowElement.clientWidth;
                        baseHeight = cropWindowElement.clientHeight;
                        cropWindowElement.setAttribute('draggable', 'false');

                        //We choose to set the ratio to the smallest size it could be at the give ratio.
                        if (_settings.setRatio) {
                            if (_settings.setRatio.hRatio > _settings.setRatio.wRatio) {
                                baseHeight = (cropWindowElement.clientWidth * _settings.setRatio.wRatio);
                            } else {
                                baseWidth = (cropWindowElement.clientHeight * _settings.setRatio.hRatio);
                            }
                        }

                        //TODO:Center this and save measurements for reset

                        cropWindowElement.style.height = baseHeight + "px";
                        cropWindowElement.style.width = baseWidth + "px";

                        _hasInit = true;
                    }
                }

                function onCropMove(mouseMoveData, force) {
                    if (_this.isHeld || force) {
                        var widthOffset = canvas.cWidth - (canvas.cWidth * canvas.widthRatio),
                            heightOffset = canvas.cHeight - (canvas.cHeight * canvas.heightRatio),
                            maxLeft = (cropWindowElement.offsetLeft * -1) + (widthOffset / 2),
                            maxTop = (cropWindowElement.offsetTop * -1) + (heightOffset / 2),
                            maxRight = (cropWindowElement.offsetLeft - (cropWindowElement.clientWidth - baseWidth)) - (widthOffset / 2),
                            maxBottom = (cropWindowElement.offsetTop - (cropWindowElement.clientHeight - baseHeight)) - (heightOffset / 2),
                            canvasWidth = canvas.cWidth,
                            canvasHeight = canvas.cHeight,
                            newX = (_translate.x + mouseMoveData.x),
                            newY = (_translate.y + mouseMoveData.y),
                            newWidth = cropWindowElement.offsetWidth,
                            newHeight = cropWindowElement.offsetHeight,
                            maxHeight,
                            maxWidth;

                        if (newX < maxLeft) {
                            newX = maxLeft;
                        }
                        if (newX > maxRight) {
                            newX = maxRight;
                        }
                        if (newY < maxTop) {
                            newY = maxTop;
                        }
                        if (newY > maxBottom) {
                            newY = maxBottom;
                        }

                        if (_focusElement === cropWindowElement || force) {
                            applyTransform(_translate.scaleX, _translate.skewX, _translate.skewY, _translate.scaleY, newX, newY);
                        } else {

                            if (_focusElement.class.match(/left/g)) {
                                maxWidth = (canvasWidth - (canvasWidth - (_translate.width + (cropWindowElement.offsetLeft + _translate.x)))) - (widthOffset / 2);
                            }
                            if (_focusElement.class.match(/right/g)) {
                                maxWidth = (canvasWidth - (cropWindowElement.offsetLeft + _translate.x)) - (widthOffset / 2);
                                newWidth = Math.min(_translate.width + mouseMoveData.x, maxWidth);
                            }
                            if (_focusElement.class.match(/bottom/g)) {
                                maxHeight = (canvasHeight - (cropWindowElement.offsetTop + _translate.y)) - (heightOffset / 2);
                                newHeight = Math.min((_translate.height + mouseMoveData.y), maxHeight);
                            }
                            if (_focusElement.class.match(/top/g)) {
                                maxHeight = (canvasHeight - (canvasHeight - (_translate.height + (cropWindowElement.offsetTop + _translate.y)))) - (heightOffset / 2);
                            }
                            if (_focusElement.class.match(/top-left/g)) {
                                newWidth = Math.min(_translate.width - mouseMoveData.x, maxWidth);
                                newHeight = Math.min((_translate.height - mouseMoveData.y), maxHeight);
                            } else if (_focusElement.class.match(/top/g)) {
                                newHeight = Math.min((_translate.height - mouseMoveData.y), maxHeight);
                                newX = _translate.x;
                            } else if (_focusElement.class.match(/left/g)) {
                                newWidth = Math.min(_translate.width - mouseMoveData.x, maxWidth);
                                newY = _translate.y;
                            }

                            if (newWidth > 0 && newHeight > 0) {
                                cropWindowElement.style.width = newWidth;
                                cropWindowElement.style.height = newHeight;
                                if (_focusElement.class.match(/left|top/g)) {
                                    applyTransform(_translate.scaleX, _translate.skewX, _translate.skewY, _translate.scaleY, newX, newY);
                                }
                            }
                        }
                        generatePreviewDimensions();
                    }
                }

                function applyTransform(scaleX, skewX, skewY, scaleY, x, y) {
                    cropWindowElement.style['transform' || 'webkitTransform' || 'mozTransform'] = "matrix(" + scaleX + "," + skewX + "," + skewY + "," + scaleY + "," + x + ", " + y + ")";
                }

                function generatePreviewDimensions() {
                    var canvasWidth = canvas.cWidth,
                        canvasHeight = canvas.cHeight,
                        heightPercent = cropWindowElement.clientHeight / canvasHeight,
                        widthPercent = cropWindowElement.clientWidth / canvasWidth,
                        leftPercent = (cropWindowElement.getBoundingClientRect().left - canvas.left) / canvasWidth,
                        topPercent = (cropWindowElement.getBoundingClientRect().top - canvas.top) / canvasHeight,
                        newWidth = canvas.width * widthPercent,
                        newHeight = canvas.height * heightPercent,
                        newX = canvas.width * leftPercent,
                        newY = canvas.height * topPercent,
                        newImgData;

                    if (newX > 0 && newY > 0 && newWidth > 0 && newHeight > 0) {
                        newImgData = context.getImageData(
                            newX,
                            newY,
                            newWidth,
                            newHeight);
                        _preview.createImgInstance(newImgData, newWidth, newHeight);
                    }
                }

                function onCropMouseDown(e) {
                    if (e.target.className.match("-crop-")) {

                        var transform = (window.getComputedStyle(cropWindowElement)['transform' || 'webkitTransform' || 'mozTransform'].match(/-?\d+(?:\.\d+)?/g)) || [];

                        _this.isHeld = true;
                        _translate['scaleX'] = Number(transform[0] || 1);
                        _translate['skewX'] = Number(transform[1] || 0);
                        _translate['skewY'] = Number(transform[2] || 0);
                        _translate['scaleY'] = Number(transform[3] || 1);
                        _translate['x'] = Number(transform[4] || 0);
                        _translate['y'] = Number(transform[5] || 0);
                        _translate['width'] = cropWindowElement.offsetWidth;
                        _translate['height'] = cropWindowElement.offsetHeight;
                        _focusElement = null;

                        if (e.target === cropWindowElement || e.target.className.match(/center-point/gi)) {
                            _focusElement = cropWindowElement;
                        } else {
                            for (var i = 0; i < _handles.length; i++) {
                                if (e.target === _handles[i].element) {
                                    _focusElement = _handles[i];
                                    break;
                                }
                            }
                        }
                    }
                }

                function onCropMouseUp(e) {
                    _this.isHeld = false;
                    _focusElement = null;
                }

                function Handles() {
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

                    function handleObject(className) {
                        return {
                            "class": className
                        }
                    }
                }
            }
        })();
    }, {
        "../mouse-events/mouse-events.js": 8,
        "../preview/preview.js": 9,
        "../settings/settings.js": 10
    }],
    4: [function(require, module, exports) {
        (function() {
            module.exports = DragDropDependencies();

            function DragDropDependencies() {

                var _eventsQueue = require('../events-queue/events-queue.js'),
                    _settings = require('../settings/settings.js'),
                    _cropWindow = require('../crop-window/crop-window.js'),
                    _subscribers = [],
                    _this = {},
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

                function init() {
                    if (_settings.dropArea) {
                        _eventsQueue.subscribe('drop', _settings.dropArea, onDrop);
                        _eventsQueue.subscribe('dragover', _settings.dropArea, onDragOver);
                        _eventsQueue.subscribe('dragleave', _settings.dropArea, onDragLeave);
                        _eventsQueue.subscribe('dragenter', _settings.dropArea, onDragEnter);
                    }
                }

                function onFileChange(fn) {
                    _subscribers.push(fn);
                }

                function onDrop(e) {
                    e.preventDefault();

                    var data = e.dataTransfer.files,
                        totalSubscribers = _subscribers.length;

                    if (data[0] instanceof Blob) {
                        while (totalSubscribers--) {
                            if (_subscribers[totalSubscribers] && typeof _subscribers[totalSubscribers] === 'function') {
                                _subscribers[totalSubscribers](data[0]);
                            }
                        }
                    }
                }

                function onDragOver(e) {
                    if (!_cropWindow.isHeld) {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = 'copy';
                    }
                }

                function onDragEnter(e) {
                    if (!_cropWindow.isHeld) {
                        _settings.dropArea.classList.add(focusClassName);
                    }
                }

                function onDragLeave(e) {
                    if (!_cropWindow.isHeld) {
                        _settings.dropArea.classList.remove(focusClassName);
                    }
                }

            }
        })();
    }, {
        "../crop-window/crop-window.js": 3,
        "../events-queue/events-queue.js": 5,
        "../settings/settings.js": 10
    }],
    5: [function(require, module, exports) {
        (function() {
            module.exports = EventsQueue();

            function EventsQueue() {

                var _queue = [],
                    _eventsQueue = {};

                /*========================================================================
                    PUBLIC
                ========================================================================*/
                _eventsQueue.subscribe = subscribe;
                _eventsQueue.removeAll = removeAll;
                _eventsQueue.triggerEvent = triggerEvent;

                return _eventsQueue;

                /*========================================================================
                    PRIVATE
                ========================================================================*/

                function subscribe(eventName, element, subscriberFn) {
                    var knownQueueItem;
                    for (var i = 0; i < _queue.length; i++) {
                        if (_queue[i].eventName === eventName && _queue[i].element === element) {
                            _queue[i].events.push(subscriberFn);
                            knownQueueItem = _queue[i];
                            break;
                        }
                    }
                    return (knownQueueItem || new EventObject(eventName, element, subscriberFn))['publicEvents'];
                }

                function triggerEvent(eventName, element) {
                    var l = _queue.length;
                    while (l--) {
                        if (_queue[l].element === element && _queue[l].eventName === eventName) {
                            _queue[l].publicEvents.trigger();
                            return;
                        }
                    }
                }

                function EventObject(eventName, element, subscriberFn) {

                    var queueObject = {
                            events: [subscriberFn],
                            element: element,
                            eventName: eventName,
                            publicEvents: {
                                unSubscribe: unSubscribe,
                                trigger: trigger
                            }
                        },
                        customEvent = document.createEvent('Event');

                    customEvent.initEvent(eventName, true, true);
                    element.addEventListener(eventName, onEvent);
                    _queue.push(queueObject);

                    return queueObject;

                    function onEvent(e) {
                        for (var i = 0; i < queueObject.events.length; i++) {
                            queueObject.events[i].call(this, e);
                        }
                    }

                    function trigger() {
                        element.dispatchEvent(customEvent);
                    }

                    function unSubscribe() {

                        var functionIdx = queueObject.events.indexOf(subscriberFn);

                        if (functionIdx > -1 && queueObject) {
                            queueObject.events.splice(functionIdx, 1);
                        }

                        if (queueObject.events.length <= 0) {
                            element.removeEventListener(eventName, onEvent);
                            _queue.splice(_queue.indexOf(queueObject), 1);
                        }
                    }
                }

                function removeAll() {
                    var l = _queue.length;
                    while (l--) {
                        _queue[l].publicEvents.unSubscribe();
                    }
                }
            }
        })();
    }, {}],
    6: [function(require, module, exports) {
        (function() {
            "use strict";

            module.exports = FileInput();

            function FileInput() {

                var _eventsQueue = require('../events-queue/events-queue.js'),
                    _settings = require('../settings/settings.js'),
                    _subscribers = [],
                    _this = {};

                /*========================================================================
                    PUBLIC
                ========================================================================*/

                init();
                _this.onFileChange = storeSubscriber;

                return _this;
                /*========================================================================
                    PRIVATE
                ========================================================================*/

                function init() {
                    _eventsQueue.subscribe('change', _settings.fileInput, onFileInputChange);
                }

                function storeSubscriber(fn) {
                    _subscribers.push(fn);
                }

                function notifySubscribers(file) {
                    var totalSubscribers = _subscribers.length;
                    while (totalSubscribers--) {
                        if (_subscribers[totalSubscribers] && typeof _subscribers[totalSubscribers] === 'function') {
                            _subscribers[totalSubscribers](file);
                        }
                    }
                }

                function onFileInputChange(e) {
                    var files = this.files;

                    for (var file in files) {
                        if (files[file] instanceof Blob) {
                            return notifySubscribers(files[file]);
                        }
                    }
                }
            }
        })();
    }, {
        "../events-queue/events-queue.js": 5,
        "../settings/settings.js": 10
    }],
    7: [function(require, module, exports) {
        (function() {
            "use strict";

            module.exports = Information();

            function Information() {

                var _this = {},
                    _utils = require('../utils/utils.js'),
                    _data = {
                        croppedImage: imageInfoObject(),
                        originalImage: imageInfoObject()
                    };

                _this.getImageData = getImageData;
                _this.updateDataFor = updateDataFor;
                _this.updateProperty = updateProperty;
                _this.resetData = resetData;

                return _this;

                function getImageData() {
                    return {
                        croppedImage: _data.croppedImage,
                        originalImage: _data.originalImage
                    }
                }

                function updateDataFor(property) {
                    var data = _data[property];
                    if (data && data.src !== "") {
                        data.file = _utils.base64toBlob(data.src);
                    }
                }

                function resetData() {
                    _data = {
                        croppedImage: imageInfoObject(),
                        originalImage: imageInfoObject()
                    };
                }

                function updateProperty(property, values) {
                    if (_data[property]) {
                        for (var key in _data[property]) {
                            if (values[key]) {
                                _data[property][key] = values[key];
                            }
                        }
                    }
                }

                function imageInfoObject() {
                    return {
                        src: "",
                        file: null,
                        size: 0,
                        type: "",
                        name: "",
                        width: 0,
                        height: 0
                    }
                }
            }
        })();
    }, {
        "../utils/utils.js": 12
    }],
    8: [function(require, module, exports) {
        (function() {

            module.exports = MouseEvents(
                require('../events-queue/events-queue.js'),
                require('../throttle/throttle.js')
            );

            function MouseEvents(_eventsQueue, _throttle) {

                /*----------------------------------------------------------------------
                    PRIVATE VARIABLES
                 ----------------------------------------------------------------------*/
                var _root = {},
                    _dragSubscribers = [],
                    _onDownSubscribers = [],
                    _onUpSubscribers = [],
                    _isHeld = false,
                    _isMoving = false,
                    _isDragging = false,
                    _mouseMoveData = {},
                    _startEvent;

                /*----------------------------------------------------------------------
                    PUBLIC METHODS
                ----------------------------------------------------------------------*/

                _root.isHeld = isHeld;
                _root.onDrag = subscribeToDrag;
                _root.onDown = subscribeToDown;
                _root.onUp = subscribeToUp;

                /*----------------------------------------------------------------------
                    INIT
                ----------------------------------------------------------------------*/

                init();
                return _root;

                /*----------------------------------------------------------------------
                    PRIVATE METHODS
                 ----------------------------------------------------------------------*/

                function init() {
                    _eventsQueue.subscribe("mousedown", window, mouseDownHandler);
                    _eventsQueue.subscribe("mouseup", window, mouseUpHandler);
                    _eventsQueue.subscribe("mousemove", window, onMouseMoveHandler);
                    _eventsQueue.subscribe("dragstart", window, onDragStartHandler);
                    _eventsQueue.subscribe("dragend", window, onDragEndHandler);
                    _eventsQueue.subscribe("drag", window, _throttle(onDragHandler, 50));
                }

                function subscribeToDrag(fn) {
                    _dragSubscribers.push(fn);
                }

                function subscribeToDown(fn) {
                    _onDownSubscribers.push(fn);
                }

                function subscribeToUp(fn) {
                    _onUpSubscribers.push(fn);
                }

                function notifyDragSubscribers() {
                    for (var i = 0; i < _dragSubscribers.length; i++) {
                        _dragSubscribers[i](_mouseMoveData)
                    }
                }

                function notifyDownSubscribers(e) {
                    for (var i = 0; i < _onDownSubscribers.length; i++) {
                        _onDownSubscribers[i](e);
                    }
                }

                function notifyUpSubscribers(e) {
                    for (var i = 0; i < _onUpSubscribers.length; i++) {
                        _onUpSubscribers[i](e);
                    }
                }

                function isHeld() {
                    return _isHeld;
                }

                function mouseDownHandler(e) {
                    onDown(e);
                    _isHeld = true;
                    _isMoving = true
                }

                function onDragStartHandler(e) {
                    onDown(e);
                    _isHeld = true;
                    _isDragging = true;
                }

                function onDown(e) {
                    if (!_startEvent) {
                        _startEvent = e;
                        notifyDownSubscribers(e);
                    }
                }

                function mouseUpHandler(e) {
                    _isMoving = false;
                    if (!_isDragging) {
                        onUp(e);
                    }
                }

                function onDragEndHandler(e) {
                    _isMoving = false;
                    _isDragging = false;
                    onUp(e);
                }

                function onUp(e) {
                    _startEvent = null;
                    _isHeld = false;
                    notifyUpSubscribers(e);
                }

                function onDragHandler(e) {
                    onMove(e);
                }

                function onMouseMoveHandler(e) {
                    if (!_isDragging) {
                        onMove(e);
                    }
                }

                function onMove(e) {
                    if (_isHeld) {
                        updateMouseMoveData(_startEvent, e);
                        notifyDragSubscribers(e);
                    }
                }

                function updateMouseMoveData(startData, eventData) {
                    if (eventData.x !== 0) {
                        _mouseMoveData = {
                            x: eventData.x - startData.x,
                            y: eventData.y - startData.y
                        }
                    }
                }
            }
        })();
    }, {
        "../events-queue/events-queue.js": 5,
        "../throttle/throttle.js": 11
    }],
    9: [function(require, module, exports) {
        (function() {
            "use strict";

            module.exports = Preview();

            function Preview() {

                var _this = {},
                    _utils = require('../utils/utils.js'),
                    _settings = require('../settings/settings.js'),
                    _information = require('../information/information.js');

                _this.createImgInstance = createImgInstance;

                return _this;

                function createImgInstance(croppedImageData, width, height) {
                    var buffer = document.createElement('canvas'),
                        bufferCtx = buffer.getContext("2d"),
                        src;

                    buffer.width = width;
                    buffer.height = height;
                    bufferCtx.putImageData(croppedImageData, 0, 0);

                    src = buffer.toDataURL('image/png', 1);

                    if (src) {
                        _information.updateProperty('croppedImage', {
                            src: src,
                            width: width,
                            height: height
                        });

                        if (_settings.previewElement) {
                            if (_settings.previewElement.tagName.toLowerCase() === 'img') {
                                _settings.previewElement.src = src;
                            } else if (!_utils.isClosedElement(_settings.previewElement)) {
                                _settings.previewElement.style.backgroundImage = "url('" + src + "')";
                            }
                        }
                    }

                }
            }
        })();
    }, {
        "../information/information.js": 7,
        "../settings/settings.js": 10,
        "../utils/utils.js": 12
    }],
    10: [function(require, module, exports) {
        (function() {
            module.exports = Settings();

            function Settings() {

                var body = document.querySelector('body'),
                    _utils = require('../utils/utils.js'),
                    _this = {
                        fileInput: null,
                        cropArea: null,
                        croppedImage: {},
                        dropArea: null,
                        previewElement: null,
                        setRatio: null
                    };

                _this.bindSettings = bindSettings;

                return _this;

                function bindSettings(cropArea, userSettings) {
                    /**
                     * cropArea or fileInput must be available.
                     */
                    if (!userSettings.fileInput && !userSettings.dropArea) {
                        throw new TypeError("CropResize is unable to operate without a 'fileInput' or 'dropArea' element.");
                    }

                    /**
                     * cropArea value validation.

                    */
                    if (_utils.ifValue(cropArea).isElement && document.querySelector('body').contains(cropArea)) {
                        if (!_utils.isClosedElement(cropArea)) {
                            _this.cropArea = cropArea;
                        } else {
                            throw new TypeError("Unable to add child element canvas to element type '" + cropArea.tagName + "'.");
                        }
                    } else {
                        throw new TypeError("Invalid 'cropArea' element supplied to cropResize. Please ensure element is available in the DOM.");
                    }

                    /**
                     * fileInput value validation.
                     */
                    if (userSettings.fileInput) {
                        if (_utils.ifValue(userSettings.fileInput).isElement && body.contains(userSettings.fileInput) && userSettings.fileInput.tagName.toLowerCase() === 'input' && userSettings.fileInput.type === 'file') {
                            _this.fileInput = userSettings.fileInput;
                        } else {
                            throw new TypeError("Invalid 'fileInput' element supplied to cropResize. Please ensure element is available in the DOM.");
                        }
                    }

                    /**
                     * dropArea value validation.
                     */
                    if (userSettings.dropArea) {
                        if (_utils.ifValue(userSettings.dropArea).isElement && body.contains(userSettings.dropArea)) {
                            _this.dropArea = userSettings.dropArea;
                        } else if (userSettings.dropArea === true) {
                            _this.dropArea = userSettings.cropArea;
                        } else {
                            throw new TypeError("Unable to assign parameter " + userSettings.dropArea + " to 'dropArea'. Please ensure value is an element available in the DOM.");
                        }
                    }

                    /**
                     * previewElement value validation.
                     */
                    if (userSettings.previewElement && _utils.ifValue(userSettings.previewElement).isElement && body.contains(userSettings.previewElement)) {
                        _this.previewElement = userSettings.previewElement;
                    }

                    /**
                     * Ratio value validation.
                     */
                    if (userSettings.setRatio) {
                        if (Object.prototype.toString.call(userSettings.setRatio) === '[object Array]') {
                            if (userSettings.setRatio.length >= 2 && typeof userSettings.setRatio[0] === 'number' && typeof userSettings.setRatio[1] === 'number') {
                                _this.setRatio = ratioArrayToObject(userSettings.setRatio);
                            } else {
                                throw new TypeError("'setRatio' requires and array with two valid number values.");
                            }
                        } else if (typeof userSettings.setRatio === "string" && (/\d+/gi.test(userSettings.setRatio))) {
                            _this.setRatio = ratioArrayToObject(userSettings.setRatio.match(/\d+/gi));
                        } else {
                            throw new TypeError("'setRatio' must be a string containing two numbers separated by any non digit value.");
                        }
                    }
                }

                function ratioArrayToObject(ratios) {
                    return {
                        hRatio: ratios[0] / ratios[1],
                        wRatio: ratios[1] / ratios[0]
                    };
                }
            }
        })();
    }, {
        "../utils/utils.js": 12
    }],
    11: [function(require, module, exports) {
        (function() {
            module.exports = Throttle;

            function Throttle(callback, time) {
                var wait = false,
                    timeout;

                return function(e) {
                    if (!wait) {
                        callback(e);
                        wait = true;
                        timeout = setTimeout(function() {
                            wait = false;
                        }, time);
                    }
                }
            }
        })();
    }, {}],
    12: [function(require, module, exports) {
        (function() {
            module.exports = utils();

            function utils() {

                var utils = {};

                utils.bytesToSize = bytesToSize;
                utils.base64toBlob = base64toBlob;
                utils.ifValue = ifValue;
                utils.isClosedElement = isClosedElement;
                utils.fileToBase64 = fileToBase64;

                this.utils = utils;

                return utils;

                function bytesToSize(bytes) {
                    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
                    if (bytes == 0) return '0 Byte';
                    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
                    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
                }

                function fileToBase64(file, fn) {
                    var reader = new FileReader();
                    reader.onload = onReaderLoad;
                    reader.readAsDataURL(file);

                    function onReaderLoad(e) {
                        fn(e.target.result);
                    }
                }

                function base64toBlob(base64String) {
                    var blobBin = atob(base64String.split(',')[1]),
                        array = [];

                    for (var i = 0; i < blobBin.length; i++) {
                        array.push(blobBin.charCodeAt(i));
                    }

                    return new Blob([new Uint8Array(array)], {
                        type: 'image/png'
                    });
                }

                function ifValue(value) {

                    return {
                        isElement: isElement()
                    };

                    function isElement() {
                        return typeof HTMLElement === "object" ? value instanceof HTMLElement : value && typeof value === "object" && value !== null && value.nodeType === 1 && typeof value.nodeName === "string";
                    }
                }

                function isClosedElement(element) {
                    var closedElements = [
                            'area',
                            'base',
                            'br',
                            'col',
                            'command',
                            'embed',
                            'hr',
                            'img',
                            'input',
                            'keygen',
                            'link',
                            'meta',
                            'param',
                            'source',
                            'track',
                            'wbr'
                        ],
                        closedRegex = new RegExp("^" + closedElements.join("$|^") + "$", 'gi');

                    return (closedRegex.test(element.tagName));
                }
            }

        })();
    }, {}]
}, {}, [1]);
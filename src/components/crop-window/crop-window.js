(function(){
    module.exports = CropWindowDependencies();

    function CropWindowDependencies(){

        var _eventsQueue      = require('../events-queue/events-queue'),
            _settings         = require('../settings/settings.js'),
            _preview          = require('../preview/preview.js'),
            _this             = {},
            _hasInit          = false,
            _translate        = {},
            cropWindowElement = document.createElement('div'),
            mouseStart        = {},
            _handles          = Handles(),
            _focusElement,
            baseWidth,
            baseHeight,
            canvas,
            context;

        /*========================================================================
            PUBLIC
        ========================================================================*/
        _this.init          = createCropWindow;
        _this.updateContext = updateContext;
        _this.isHeld        = false;

        return _this;
        /*========================================================================
            PRIVATE
        ========================================================================*/

        function updateContext(cropData){
            canvas  = cropData.canvas;
            context = cropData.context;
            onCropMove({
                x:0,
                y:0
            }, true);
        }

        function createCropWindow(){

            if(!_hasInit){

                _eventsQueue.subscribe('mousemove', window, onCropMove);
                _eventsQueue.subscribe('mousedown', window, onCropMouseDown);
                _eventsQueue.subscribe('mouseup',   window, onCropMouseUp);

                cropWindowElement.className = 'cr-crop-window';
                cropWindowElement.setAttribute('draggable', 'false');

                for(var i = 0; i < _handles.length; i++){
                    (function(){
                        var cropHandle = document.createElement('div');
                        cropHandle.className    = "cr-crop-handle cr-" + _handles[i].class;
                        _handles[i].element     = cropHandle;
                        cropWindowElement.appendChild(cropHandle);
                    })();
                }

                _settings.cropArea.appendChild(cropWindowElement);

                baseWidth   = cropWindowElement.clientWidth;
                baseHeight  = cropWindowElement.clientHeight;

                //We choose to set the ratio to the smallest size it could be at the give ratio.
                if(_settings.setRatio){
                    if(_settings.setRatio.hRatio > _settings.setRatio.wRatio){
                        baseHeight = (cropWindowElement.clientWidth * _settings.setRatio.wRatio);
                    }else{
                        baseWidth  = (cropWindowElement.clientHeight * _settings.setRatio.hRatio);
                    }
                }

                //TODO:Center this and save measurements for reset

                cropWindowElement.style.height = baseHeight + "px";
                cropWindowElement.style.width  = baseWidth + "px";

                _hasInit    = true;
            }
        }

        function onCropMove(e, force){

            if(_this.isHeld || force){

                var widthOffset     = canvas.cWidth - (canvas.cWidth * canvas.widthRatio),
                    heightOffset    = canvas.cHeight - (canvas.cHeight * canvas.heightRatio),
                    maxLeft         = (cropWindowElement.offsetLeft * -1) + (widthOffset / 2),
                    maxTop          = (cropWindowElement.offsetTop * -1) + (heightOffset / 2),
                    maxRight        = (cropWindowElement.offsetLeft - (cropWindowElement.clientWidth - baseWidth)) - (widthOffset / 2),
                    maxBottom       = (cropWindowElement.offsetTop - (cropWindowElement.clientHeight - baseHeight)) - (heightOffset / 2),
                    canvasWidth     = canvas.cWidth,
                    canvasHeight    = canvas.cHeight,
                    newX            = (_translate.x + Number(e.x - mouseStart.x)),
                    newY            = (_translate.y + Number(e.y - mouseStart.y)),
                    newWidth        = cropWindowElement.offsetWidth,
                    newHeight       = cropWindowElement.offsetHeight,
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

                if(_focusElement === cropWindowElement || force){
                    cropWindowElement.style.transform = "translate(" + newX + "px, " + newY + "px)";
                }else{

                    if(_focusElement.class.match(/left/g)){
                        maxWidth    = (canvasWidth - (canvasWidth - (_translate.width + (cropWindowElement.offsetLeft + _translate.x)))) - (widthOffset / 2);
                    }
                    if(_focusElement.class.match(/right/g)){
                        maxWidth    = (canvasWidth - (cropWindowElement.offsetLeft + _translate.x)) - (widthOffset / 2);
                        newWidth    = Math.min(_translate.width + (e.x - mouseStart.x), maxWidth);
                    }
                    if(_focusElement.class.match(/bottom/g)){
                        maxHeight   = (canvasHeight - (cropWindowElement.offsetTop + _translate.y)) - (heightOffset /2);
                        newHeight   = Math.min((_translate.height + (e.y - mouseStart.y)), maxHeight);
                    }
                    if(_focusElement.class.match(/top/g)){
                        maxHeight   = (canvasHeight - (canvasHeight - (_translate.height + (cropWindowElement.offsetTop + _translate.y)))) - (heightOffset /2);
                    }
                    if(_focusElement.class.match(/top-left/g)){
                        newWidth    = Math.min(_translate.width - (e.x - mouseStart.x), maxWidth);
                        newHeight   = Math.min((_translate.height - (e.y - mouseStart.y)), maxHeight);
                    }else if(_focusElement.class.match(/top/g)){
                        newHeight   = Math.min((_translate.height - (e.y - mouseStart.y)), maxHeight);
                        newX        = _translate.x;
                    }else if(_focusElement.class.match(/left/g)){
                        newWidth    = Math.min(_translate.width - (e.x - mouseStart.x), maxWidth);
                        newY        = _translate.y;
                    }

                    if(newWidth > 0 && newHeight > 0){
                        cropWindowElement.style.width  = newWidth;
                        cropWindowElement.style.height = newHeight;
                        if(_focusElement.class.match(/left|top/g)){
                            cropWindowElement.style.transform = "translate(" + newX + "px, " + newY + "px)";
                        }
                    }

                }
                generatePreviewDimensions();
            }
        }

        function generatePreviewDimensions(){
            var canvasWidth   = canvas.cWidth,
                canvasHeight  = canvas.cHeight,
                heightPercent = cropWindowElement.clientHeight / canvasHeight,
                widthPercent  = cropWindowElement.clientWidth / canvasWidth,
                leftPercent   = (cropWindowElement.getBoundingClientRect().left - canvas.left) / canvasWidth,
                topPercent    = (cropWindowElement.getBoundingClientRect().top - canvas.top) / canvasHeight,
                newWidth      = canvas.width * widthPercent,
                newHeight     = canvas.height * heightPercent,
                newX          = canvas.width * leftPercent,
                newY          = canvas.height * topPercent,
                newImgData;

            if(newX > 0 && newY > 0 && newWidth > 0 && newHeight > 0){
                newImgData = context.getImageData(
                    newX,
                    newY,
                    newWidth,
                    newHeight);
                _preview.createImgInstance(newImgData, newWidth, newHeight);
            }
        }

        function onCropMouseDown(e){
            if(e.target.className.match("-crop-")){

                var transform = (cropWindowElement.style['transform' || 'webkitTransform' || 'mozTransform'] || "").match(/(\d+)|(-\d+)/g) || [];

                _this.isHeld         = true;
                mouseStart['x']      = e.x;
                mouseStart['y']      = e.y;
                _translate['x']      = Number(transform[0] || 0);
                _translate['y']      = Number(transform[1] || 0);
                _translate['width']  = cropWindowElement.offsetWidth;
                _translate['height'] = cropWindowElement.offsetHeight;
                _focusElement        = null;

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
            _this.isHeld = false;
            _focusElement   = null;
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
    }
})();
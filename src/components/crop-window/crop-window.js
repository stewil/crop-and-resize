(function(){
    module.exports = CropWindowDependencies;

    function CropWindowDependencies(){

        var _cropResize         = this,
            _hasInit            = false,
            _translate          = {},
            _focusElement,
            isHeld              = false,
            mouseStart          = {},
            cropWindowElement   = document.createElement('div'),
            _handles            = Handles(),
            _setRatio           = getSetRatio(),
            baseWidth,
            baseHeight,
            canvas,
            context;

        /*========================================================================
            PUBLIC
        ========================================================================*/
        this.cropWindow               = {};
        this.cropWindow.init          = createCropWindow;
        this.cropWindow.updateContext = updateContext;

        /*========================================================================
            PRIVATE
        ========================================================================*/

        function getSetRatio(){
            var setRatio =  _cropResize.settings['setRatio'] ?  _cropResize.settings['setRatio'].match(/\d+/gi) : null;

            if(setRatio && setRatio.length > 1){
                return {
                    hRatio:setRatio[0] / setRatio[1],
                    wRatio:setRatio[1] / setRatio[0]
                }
            }
        }

        function updateContext(cropData){
            canvas  = cropData.canvas;
            context = cropData.context;
        }

        function createCropWindow(){

            if(!_hasInit){

                _cropResize.eventsQueue.subscribe('mousemove', window, onCropMove);
                _cropResize.eventsQueue.subscribe('mousedown', window, onCropMouseDown);
                _cropResize.eventsQueue.subscribe('mouseup',   window, onCropMouseUp);

                cropWindowElement.className = 'cr-crop-window';

                for(var i = 0; i < _handles.length; i++){
                    (function(){
                        var cropHandle = document.createElement('div');
                        cropHandle.className    = "cr-crop-handle cr-" + _handles[i].class;
                        _handles[i].element     = cropHandle;
                        cropWindowElement.appendChild(cropHandle);
                    })();
                }

                _cropResize.settings.cropArea.appendChild(cropWindowElement);

                baseHeight  = cropWindowElement.clientHeight;
                baseWidth   = cropWindowElement.clientWidth;
                _hasInit    = true;
            }
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
                        applyCalculations('width', (_translate.width - (e.x - mouseStart.x)));
                        applyCalculations('height', (_translate.height - (e.y - mouseStart.y)), function(){
                            cropWindowElement.style.transform = "translate(" + newX + "px, " + newY + "px)";
                        });
                    }else{
                        if(_focusElement.class.match(/top/g)){
                            applyCalculations('height', (_translate.height - (e.y - mouseStart.y)), function(){
                                cropWindowElement.style.transform = "translate(" + _translate.x + "px, " + newY + "px)";
                            });
                        }
                        if(_focusElement.class.match(/bottom/g)){
                            maxHeight = canvasHeight - cropWindowElement.offsetTop;
                            applyCalculations('height', (Math.min(_translate.height + (e.y - mouseStart.y), maxHeight)));
                        }
                        if(_focusElement.class.match(/right/g)){
                            maxWidth = canvasWidth - cropWindowElement.offsetLeft;
                            applyCalculations('width', (Math.min(_translate.width + (e.x - mouseStart.x), maxWidth)))
                        }
                        if(_focusElement.class.match(/left/g)){
                            applyCalculations('width', (_translate.width - (e.x - mouseStart.x)), function(){
                                cropWindowElement.style.transform = "translate(" + newX + "px, " + _translate.y + "px)";
                            });
                        }
                    }
                }
                generatePreviewDimensions();
            }

            function applyCalculations(key, value, fn){
                if(value > 0){
                    cropWindowElement.style[key] = value;
                    if(fn){
                        fn();
                    }
                }
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
                _cropResize.preview.createImgInstance(newImgData, newWidth, newHeight);
            }
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

                _focusElement = null;

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
            isHeld          = false;
            _focusElement   = null;
        }
    }
})();
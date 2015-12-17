(function(){
    module.exports = CropWindowDependencies;

    function CropWindowDependencies(_element, _eventQueues, createImgInstance, target){

        var _hasInit = false,
            _translate          =   {},
            _focusElement,
            croppedImage        =   document.createElement('img'),
            isHeld              =   false,
            mouseStart          =   {},
            cropWindowElement   =   document.createElement('div'),
            _handles            =   Handles(),
            baseWidth,
            baseHeight,
            canvas,
            context;

        return {
            init    :createCropWindow,
            updateContext  :updateContext
        };

        function updateContext(cropData){
            canvas = cropData.canvas;
            context = cropData.context;
        }


        function createCropWindow(){

            if(!_hasInit){

                _eventQueues.subscribe('mousemove', window, onCropMove);
                _eventQueues.subscribe('mousedown', window, onCropMouseDown);
                _eventQueues.subscribe('mouseup',   window, onCropMouseUp);

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

        return function(target, canvas, context){

        }
    }
})();
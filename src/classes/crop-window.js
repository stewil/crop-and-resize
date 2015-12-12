(function(){
    module.exports = CropWindowDependencies;

    function CropWindowDependencies(_element, _eventQueues, createImgInstance){
        return function(target, canvas, croppedSrc){

            var _translate          =   {},
                _focusElement,
                croppedImage        =   document.createElement('img'),
                isHeld              =   false,
                mouseStart          =   {},
                cropWindowElement   =   document.createElement('div'),
                _handles            =   Handles();

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

                    //TODO:Add Boundaries
                    //TODO:Add functionality for handles clicked
                    //TODO:Keep previous translate
                    var newX = (_translate.x + Number(e.x - mouseStart.x)),
                        newY = (_translate.y + Number(e.y - mouseStart.y));

                    var canvasBoundingRect = canvas.element.getBoundingClientRect(),
                        canvasWidth     =   canvas.element.clientWidth,
                        canvasHeight    =   canvas.element.clientHeight;

                    var maxLeft     = cropWindowElement.offsetLeft*-1,
                        maxTop      = cropWindowElement.offsetTop * -1,
                        maxRight    = cropWindowElement.offsetLeft,
                        maxBottom   = cropWindowElement.offsetTop;

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

                    }

                    var heightPercent   =   cropWindowElement.clientHeight / canvasHeight,
                        widthPercent    =   cropWindowElement.clientWidth / canvasWidth,
                        leftPercent = (cropWindowElement.getBoundingClientRect().left - canvasBoundingRect.left) / canvasWidth,
                        topPercent = (cropWindowElement.getBoundingClientRect().top - canvasBoundingRect.top) / canvasHeight;

                    var newWidth = canvas.width * widthPercent,
                        newHeight = canvas.height * heightPercent;

                    var newImgData = canvas.context.getImageData(
                        canvas.width * leftPercent,
                        canvas.height * topPercent,
                        newWidth,
                        newHeight);

                    createImgInstance(newImgData, croppedImage, _element.parentNode, newWidth, newHeight);
                }
            }

            function onCropMouseDown(e){
                if(e.target.className.match("-crop-")){

                    var transform = (cropWindowElement.style['transform' || 'webkitTransform' || 'mozTransform'] || "").match(/(\d+)|(-\d+)/g) || [];

                    isHeld              =   true;
                    mouseStart['x']     =   e.x;
                    mouseStart['y']     =   e.y;
                    _translate['x']     =   Number(transform[0] || 0);
                    _translate['y']     =   Number(transform[1] || 0);

                    _focusElement = e.target === cropWindowElement ? '' : '';

                    if(e.target === cropWindowElement){
                        _focusElement = cropWindowElement;
                    }else{
                        for(var i = 0; i < _handles.length; i++){
                            if(e.target === _handles[i].element){

                                _focusElement = _handles[i].element;
                                console.log("YOu clicked a handle!");
                                console.log(_focusElement);
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
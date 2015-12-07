(function(){
    module.exports = CropWindowDependencies;

    function CropWindowDependencies(_element, _eventQueues, createImgInstance){
        return function(target, canvas, croppedSrc){

            var croppedImage = document.createElement('img');

            var isHeld              = false,
                mouseStart          = {},
                cropWindowElement   = document.createElement('div'),
                childNames = [
                    'handle-top-left',
                    'handle-top-center',
                    'handle-top-right',
                    'handle-right-middle',
                    'handle-bottom-right',
                    'handle-bottom-center',
                    'handle-bottom-left',
                    'handle-left-middle',
                    'center-point'
                ];

            cropWindowElement.className = 'cr-crop-window';

            for(var i = 0; i < childNames.length; i++){
                (function(){
                    var cropHandle = document.createElement('div');
                    cropHandle.className = "cr-crop-handle cr-" + childNames[i];
                    cropWindowElement.appendChild(cropHandle);
                })();
            }

            target.appendChild(cropWindowElement);

            _eventQueues.subscribe('mousemove', window, onCropMove);
            _eventQueues.subscribe('mousedown', window, onCropMouseDown);
            _eventQueues.subscribe('mouseup', window, onCropMouseUp);

            function onCropMove(e){
                if(isHeld){

                    //TODO:Add Boundaries
                    //TODO:Add functionality for handles clicked
                    //TODO:Keep previous translate
                    cropWindowElement.style.transform = "translate(" + ((e.x - mouseStart.x)) + "px, " + ((e.y - mouseStart.y)) + "px)";

                    var canvasBoundingRect = canvas.element.getBoundingClientRect(),
                        canvasWidth     =   canvas.element.clientWidth,
                        canvasHeight    =   canvas.element.clientHeight;

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
                    isHeld = true;
                    mouseStart['x'] = e.x;
                    mouseStart['y'] = e.y;
                }
            }

            function onCropMouseUp(e){
                isHeld = false;
            }

        }
    }
})();
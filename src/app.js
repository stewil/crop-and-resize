(function(document, window){

    window['CropResize'] = CropResize;

    function CropResize(element, attributes){

        this.remove = remove;
        this.images = {};

        //CLASSES
        var _eventQueues    = require('./components/events-queue/events-queue.js')(),
            dragDrop        = require('./components/drag-drop/drag-drop.js')(_eventQueues, attributes['dragDropTarget']),
            cropWindow      = require('./components/crop-window/crop-window.js')(element, _eventQueues, createImgInstance, attributes['target']),
            bindCanvas      = require('./components/canvas/canvas.js')(_eventQueues),
            fileInput       = require('./components/file-input/file-input.js')(_eventQueues, element);

        //
        var _canvas;

        init();

        function init(){
            fileInput.onFileChange(onFileProcessed);
            dragDrop.onFileChange(onFileProcessed);
        }

        function onFileProcessed(file){
            if(!_canvas){

                var parent      =   element.parentElement,
                    canvas      =   document.createElement('canvas');

                if(attributes['target']){
                    attributes['target'].appendChild(canvas)
                }else{
                    parent.insertBefore(canvas, element);
                }

                _canvas = bindCanvas(canvas, file);
                _canvas.onChange(function(canvasData){
                    cropWindow.init();
                    cropWindow.updateContext(canvasData);
                });
            }else{
                _canvas.changeFile(file);
            }
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

            attributes['previewElement'].src = buffer.toDataURL('image/png');

            if(target && !target.contains(croppedImageElement)){
                target.appendChild(croppedImageElement);
            }
            return croppedImageElement;
        }



    }

})(document, window);
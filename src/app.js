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
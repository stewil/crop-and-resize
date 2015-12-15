(function(document, window){

    window['CropResize'] = CropResize;

    function CropResize(element, attributes){

        this.remove = remove;
        this.images = {};

        //CLASSES
        var _eventQueues    = require('./classes/events-queue.js')(),
            dragDrop        = require('./classes/drag-drop.js')(_eventQueues, attributes['dragDropTarget']),
            cropWindow      = require('./classes/crop-window.js')(element, _eventQueues, createImgInstance),
            bindCanvas      = require('./classes/canvas.js')(element, _eventQueues, attributes, cropWindow),
            fileInput       = require('./classes/file-input.js')(_eventQueues, element);

        init();

        function init(){
            fileInput.onFileChange(onFileProcessed);
            dragDrop.onFileChange(onFileProcessed);
        }

        function onFileProcessed(file){
            var fileHandler = {};

            fileHandler.original    = {};
            fileHandler.cropped     = {};

            fileHandler.original['url'] = file;
            fileHandler.original['size'] = bytesToSize(file.size);

            bindCanvas.call(fileHandler);
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
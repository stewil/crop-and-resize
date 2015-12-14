(function(document, window){

    window['CropResize'] = CropResize;

    function CropResize(element, attributes){

        var _cropResize         = this;

        this.remove = remove;
        this.images = {};

        //CLASSES
        var _eventQueues    = require('./classes/events-queue.js')(),
            dragDrop        = require('./classes/drag-drop.js')(_eventQueues, attributes['dragDropTarget']),
            cropWindow      = require('./classes/crop-window.js')(element, _eventQueues, createImgInstance),
            bindCanvas      = require('./classes/canvas.js')(element, _eventQueues, attributes, cropWindow);

        init();

        function init(){
            _eventQueues.subscribe('change', element, onFileInputChange);
            dragDrop.onDropComplete(FileHandler);
        }

        function remove(){
            _eventQueues.removeAll();
        }

        function onFileInputChange(e, scope){
            var files       = this.files;

            for(var file in files){
                return FileHandler(files[file]);
            }
        }

        function FileHandler(file){

            var fileHandler = {};

            fileHandler.original    = {};
            fileHandler.cropped     = {};

            if(typeof file === 'object' && file.type.match('image.*')){
                var reader = new FileReader();

                reader.onload = onReaderLoad;

                reader.readAsDataURL(file);

                function onReaderLoad(e){
                    fileHandler.original['url'] = e.target.result;
                    fileHandler.original['size'] = bytesToSize(file.size);
                    bindCanvas.call(fileHandler);
                }
            }
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
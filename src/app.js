(function(document, window){

    window['CropResize'] = CropResize;

    function CropResize(element, attributes){

        var _canvas,
            _cropResize = {};

        //CLASSES
        var _eventQueues    = require('./components/events-queue/events-queue.js')(),
            dragDrop        = require('./components/drag-drop/drag-drop.js')(_eventQueues, attributes['dragDropTarget']),
            cropWindow      = require('./components/crop-window/crop-window.js')(element, _eventQueues, createImgInstance, attributes['target']),
            bindCanvas      = require('./components/canvas/canvas.js')(_eventQueues),
            fileInput       = require('./components/file-input/file-input.js')(_eventQueues, element),
            utils           = require('./components/utils/utils.js')();

        //PUBLIC METHODS
        _cropResize['remove'] = remove;
        _cropResize['croppedImage'] = {};

        init();

        return _cropResize;

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
            var buffer          =   document.createElement('canvas'),
                bufferCtx       =   buffer.getContext("2d"),
                croppedImage    =   _cropResize.croppedImage,
                src;

            buffer.width    =   width;
            buffer.height   =   height;
            bufferCtx.putImageData(croppedImageData, 0, 0);

            src = buffer.toDataURL('image/png', 1);
            attributes['previewElement'].src = src;

            croppedImage['file']        = utils.base64toBlob(src);
            croppedImage['fileSize']    = utils.bytesToSize(croppedImage.file.size);

            if(target && !target.contains(croppedImageElement)){
                target.appendChild(croppedImageElement);
            }
            return croppedImageElement;
        }
    }

})(document, window);
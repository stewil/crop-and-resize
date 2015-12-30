(function(document, window){

    window['CropResize'] = CropResize;

    function CropResize(element, attributes){

        var _canvas,
            _croppedImage   = {},
            _cropResize     = {
                settings:{
                    cropArea       : null,
                    croppedImage   : {},
                    dropArea       : null,
                    previewElement : null,
                    setRatio       : null
                }
            };

        /*========================================================================
            PUBLIC
        ========================================================================*/
        this.remove     = remove;
        this.getInfo    = getInfo;

        /*========================================================================
            PRIVATE
        ========================================================================*/
        require('./components/preview/preview.js').call(_cropResize);
        require('./components/events-queue/events-queue.js').call(_cropResize);
        require('./components/drag-drop/drag-drop.js').call(_cropResize, attributes['dragDropTarget']);
        require('./components/crop-window/crop-window.js').call(_cropResize, element, createImgInstance, attributes);
        require('./components/crop-area/crop-area.js').call(_cropResize);
        require('./components/file-input/file-input.js').call(_cropResize, element);
        require('./components/utils/utils.js').call(_cropResize);

        init();

        function init(){
            _cropResize.fileInput.onFileChange(onFileProcessed);
            _cropResize.dragDrop.onFileChange(onFileProcessed);
        }

        function getInfo(){

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

                _canvas = _cropResize.cropArea.init(canvas, file);
                _canvas.onChange(function(canvasData){
                    _cropResize.cropWindow.init();
                    _cropResize.cropWindow.updateContext(canvasData);
                });
            }else{
                _canvas.changeFile(file);
            }
        }

        function remove(){
            _cropResize.eventsQueue.removeAll();
        }

        function createImgInstance(croppedImageData, croppedImageElement, target, width, height){
            var buffer          =   document.createElement('canvas'),
                bufferCtx       =   buffer.getContext("2d"),
                src;

            buffer.width    =   width;
            buffer.height   =   height;
            bufferCtx.putImageData(croppedImageData, 0, 0);

            src = buffer.toDataURL('image/png', 1);

            attributes['previewElement'].src = src;

            _croppedImage['file']        = _cropResize.utils.base64toBlob(src);
            _croppedImage['fileSize']    = _cropResize.utils.bytesToSize(_croppedImage.file.size);

            if(target && !target.contains(croppedImageElement)){
                target.appendChild(croppedImageElement);
            }
            return croppedImageElement;
        }
    }

})(document, window);
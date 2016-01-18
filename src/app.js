(function(document, window){

    window['CropResize'] = CropResize;

    function CropResize(cropArea, attributes){

        var _canvas,
            _cropResize = {},
            _application = {};

        /*========================================================================
            PUBLIC
        ========================================================================*/
        _application.destroy = destroy;
        _application.getInfo = getInfo;

        /*========================================================================
            PRIVATE
        ========================================================================*/
        require('./components/utils/utils.js').call(_cropResize);
        var settings = require('./components/settings/settings.js').call(_cropResize, cropArea, attributes);
        require('./components/information/information.js').call(_cropResize);
        require('./components/preview/preview.js').call(_cropResize, settings);
        require('./components/events-queue/events-queue.js').call(_cropResize);
        require('./components/drag-drop/drag-drop.js').call(_cropResize);
        require('./components/crop-window/crop-window.js').call(_cropResize);
        require('./components/crop-area/crop-area.js').call(_cropResize);
        require('./components/file-upload/file-upload.js').call(_cropResize);

        _cropResize.fileUpload.onFileChange(onFileProcessed);
        _cropResize.dragDrop.onFileChange(onFileProcessed);

        return _application;

        function onFileProcessed(file){

            if(_canvas){
                _canvas.changeFile(file);
            }else{
                _canvas = _cropResize.cropArea.init(file);
                _canvas.onChange(function(canvasData){
                    _cropResize.cropWindow.init();
                    _cropResize.cropWindow.updateContext(canvasData);
                });
            }
        }

        function getInfo(){

            var croppedImage            = _cropResize.information.croppedImage,
                originalImage           = _cropResize.information.originalImage;

            if(croppedImage && croppedImage.src){
                croppedImage['file']        = _cropResize.utils.base64toBlob(croppedImage.src);
                croppedImage['fileSize']    = _cropResize.utils.base64toBlob(croppedImage.file);
            }

            return _cropResize.information;
        }

        function destroy(){
            _cropResize.eventsQueue.removeAll();
            _application = null;
        }
    }

})(document, window);
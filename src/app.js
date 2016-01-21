(function(document, window){

    window['CropResize'] = CropResize;

    function CropResize(cropArea, attributes){

        var _canvas,
            _application = {};

        /*========================================================================
            PUBLIC
        ========================================================================*/
        _application.destroy = destroy;
        _application.getInfo = getInfo;

        /*========================================================================
            PRIVATE
        ========================================================================*/
        var _settings        = require('./components/settings/settings.js');

        _settings.bindSettings(cropArea, attributes);
        var _eventsQueue    = require('./components/events-queue/events-queue.js'),
            _utils          = require('./components/utils/utils.js'),
            _information    = require('./components/information/information.js'),
            _dragDrop       = require('./components/drag-drop/drag-drop.js'),
            _cropWindow     = require('./components/crop-window/crop-window.js'),
            _cropArea       = require('./components/crop-area/crop-area.js'),
            _fileUpload     = require('./components/file-upload/file-upload.js');


        _fileUpload.onFileChange(onFileProcessed);
        _dragDrop.onFileChange(onFileProcessed);

        return _application;

        function onFileProcessed(file){

            if(_canvas){
                _canvas.changeFile(file);
            }else{
                _canvas = _cropArea.init(file);
                _canvas.onChange(function(canvasData){
                    _cropWindow.init();
                    _cropWindow.updateContext(canvasData);
                });
            }
        }

        function getInfo(){

            var croppedImage             = _information.croppedImage,
                originalImage            = _information.originalImage;

            if(croppedImage && croppedImage.src){
                croppedImage['file']     = _utils.base64toBlob(croppedImage.src);
                croppedImage['fileSize'] = _utils.base64toBlob(croppedImage.file);
            }

            return _information;
        }

        function destroy(){
            _eventsQueue.removeAll();
            _application = null;
        }
    }

})(document, window);
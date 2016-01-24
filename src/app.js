(function(document, window){

    window['CropResize'] = CropResize;

    function CropResize(cropArea, attributes){

        var _application = {};

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
            _information    = require('./components/information/information.js'),
            _dragDrop       = require('./components/drag-drop/drag-drop.js'),
            _cropWindow     = require('./components/crop-window/crop-window.js'),
            _cropArea       = require('./components/crop-area/crop-area.js'),
            _fileUpload     = require('./components/file-upload/file-upload.js');

        _fileUpload.onFileChange(onFileProcessed);
        _dragDrop.onFileChange(onFileProcessed);
        _cropArea.onChange(updateCropWindow);

        return _application;

        function updateCropWindow(canvasData){
            _cropWindow.init();
            _cropWindow.updateContext(canvasData);
        }

        function onFileProcessed(file){
            _information.resetData();
            _information.updateProperty('originalImage', file);
            _information.updateProperty('croppedImage', {
                type:file.type,
                name:file.name
            });
            _cropArea.changeFile(file);
        }

        function getInfo(){
            _information.updateDataFor('croppedImage');

            return _information.getImageData();
        }

        function destroy(){
            _eventsQueue.removeAll();
            _application = null;
        }
    }

})(document, window);
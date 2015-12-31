(function(document, window){

    window['CropResize'] = CropResize;

    function CropResize(fileInput, cropArea, attributes){

        var _canvas,
            _cropResize = {};

        /*========================================================================
            PUBLIC
        ========================================================================*/
        this.remove     = remove;
        this.getInfo    = getInfo;

        /*========================================================================
            PRIVATE
        ========================================================================*/
        require('./components/utils/utils.js').call(_cropResize);
        require('./components/settings/settings.js').call(_cropResize, fileInput, cropArea, attributes);
        require('./components/preview/preview.js').call(_cropResize);
        require('./components/events-queue/events-queue.js').call(_cropResize);
        require('./components/drag-drop/drag-drop.js').call(_cropResize);
        require('./components/crop-window/crop-window.js').call(_cropResize);
        require('./components/crop-area/crop-area.js').call(_cropResize);
        require('./components/file-upload/file-upload.js').call(_cropResize);

        _cropResize.fileInput.onFileChange(onFileProcessed);
        _cropResize.dragDrop.onFileChange(onFileProcessed);

        function onFileProcessed(file){
            if(_canvas){
                _canvas.changeFile(file);
            }else{

                var cropArea    = _cropResize.settings.cropArea,
                    tagName     = cropArea ? cropArea.tagName : "undefined",
                    canvasElement;

                if(cropArea && !_cropResize.utils.isClosedElement(cropArea)){

                    if(cropArea && cropArea.tagName.toLowerCase() === "canvas"){
                        canvasElement = cropArea;
                    }else {
                        canvasElement = document.createElement('canvas');
                        cropArea.appendChild(canvasElement);
                    }

                    _canvas = _cropResize.cropArea.init(canvasElement, file);
                    _canvas.onChange(function(canvasData){
                        _cropResize.cropWindow.init();
                        _cropResize.cropWindow.updateContext(canvasData);
                    });

                }else{
                    throw "Unable to add child element canvas to element type '" + tagName + "'."
                }
            }
        }

        function getInfo(){

        }

        function remove(){
            _cropResize.eventsQueue.removeAll();
        }
    }

})(document, window);
(function(){
    "use strict";

    module.exports = Preview;

    function Preview(_settings){

        var _cropResize = this,
            _utils      = require('../utils/utils.js')();

        this.preview                    = {};
        this.preview.createImgInstance  = createImgInstance;

        function createImgInstance(croppedImageData, width, height){
            var buffer          =   document.createElement('canvas'),
                bufferCtx       =   buffer.getContext("2d"),
                src;

            buffer.width        =   width;
            buffer.height       =   height;
            bufferCtx.putImageData(croppedImageData, 0, 0);

            src = buffer.toDataURL('image/png', 1);

            _cropResize.information.croppedImage.src    = src;
            _cropResize.information.croppedImage.width  = width;
            _cropResize.information.croppedImage.height = height;

            if(_settings.previewElement){
                if(_settings.previewElement.tagName.toLowerCase() === 'img'){
                    _settings.previewElement.src = src;
                }else if(!_utils.isClosedElement(_settings.previewElement)){
                    _settings.previewElement.style.backgroundImage  = "url('" + src + "')";
                }
            }
        }
    }
})();
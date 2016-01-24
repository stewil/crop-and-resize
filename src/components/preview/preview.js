(function(){
    "use strict";

    module.exports = Preview();

    function Preview(){

        var _this = {},
            _utils       = require('../utils/utils.js'),
            _settings    = require('../settings/settings.js'),
            _information = require('../information/information.js');

        _this.createImgInstance  = createImgInstance;

        return _this;

        function createImgInstance(croppedImageData, width, height){
            var buffer          =   document.createElement('canvas'),
                bufferCtx       =   buffer.getContext("2d"),
                src;

            buffer.width        =   width;
            buffer.height       =   height;
            bufferCtx.putImageData(croppedImageData, 0, 0);

            src = buffer.toDataURL('image/png', 1);

            if(src){
                _information.updateProperty('croppedImage', {
                    src    :src,
                    width  :width,
                    height :height
                });

                if(_settings.previewElement){
                    if(_settings.previewElement.tagName.toLowerCase() === 'img'){
                        _settings.previewElement.src = src;
                    }else if(!_utils.isClosedElement(_settings.previewElement)){
                        _settings.previewElement.style.backgroundImage  = "url('" + src + "')";
                    }
                }
            }

        }
    }
})();
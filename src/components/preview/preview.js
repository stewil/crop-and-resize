(function(){
    "use strict";

    module.exports = Preview;

    function Preview(){

        var _cropResize = this;

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

            if(_cropResize.settings.previewElement){
                _cropResize.settings.previewElement.src = src;
            }
        }
    }
})();
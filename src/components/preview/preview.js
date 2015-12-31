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
                //target = _cropResize.settings.fileInput.parentNode,
                src;


            buffer.width    =   width;
            buffer.height   =   height;
            bufferCtx.putImageData(croppedImageData, 0, 0);

            src = buffer.toDataURL('image/png', 1);
            _cropResize.settings.previewElement.src = src;

            //attributes['previewElement'].src = src;
            //_cropResize.set

            /*_croppedImage['file']        = _cropResize.utils.base64toBlob(src);
            _croppedImage['fileSize']    = _cropResize.utils.bytesToSize(_croppedImage.file.size);*/

        }
    }
})();
(function(){
    module.exports = utils;

    function utils(){

        var utils = {};

        utils.bytesToSize   = bytesToSize;
        utils.base64toBlob  = base64toBlob;

        this.utils = utils;

        return utils;

        function bytesToSize(bytes) {
            var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
            if (bytes == 0) return '0 Byte';
            var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
            return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
        }

        function base64toBlob(base64String){
            var blobBin =   atob(base64String.split(',')[1]),
                array   =   [];

            for(var i = 0; i < blobBin.length; i++) {
                array.push(blobBin.charCodeAt(i));
            }

            return new Blob([new Uint8Array(array)], {type: 'image/png'});
        }
    }

})();
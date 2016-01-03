(function() {
    module.exports = CanvasDependencies;

    function CanvasDependencies() {
        
        var _cropResize     = this,
            _onChangeQueue  = [],
            _image          = new Image(),
            _source,
            _canvas,
            _canvasElement,
            _context;

        /*========================================================================
            PUBLIC
        ========================================================================*/
        this.cropArea       = {};
        this.cropArea.init  = init;

        /*========================================================================
            PRIVATE
        ========================================================================*/

        _image.onload       =   onCanvasSrcLoad;

        this.eventsQueue.subscribe('resize', window, cacheCanvasDimensions);

        function init(canvasElement, file){
            _canvasElement  =   canvasElement;
            _context        =   _canvasElement.getContext('2d');
            _cropResize.utils.fileToBase64(file, function (src) {
                _image.src  =   src;
            });
            return {
                onChange:storeOnChange,
                changeFile:changeFile
            };
        }

        function changeFile(file){
            _cropResize.utils.fileToBase64(file, function (src) {
                _image.src = src;
            });
        }

        function onCanvasSrcLoad(e){

            _source           = {};
            _canvas           = {};

            _source['width']  = this.width;
            _source['height'] = this.height;

            _canvas['width']  = _canvasElement.width;
            _canvas['height'] = _canvasElement.height;

            var canvasParams  = measureContext();

            _context.clearRect(0, 0, _canvas.width, _canvas.height);
            _context.drawImage(_image,
                canvasParams.sx,
                canvasParams.sy,
                canvasParams.sWidth,
                canvasParams.sHeight,
                canvasParams.dx,
                canvasParams.dy,
                canvasParams.dWidth,
                canvasParams.dHeight
            );
            cacheCanvasDimensions();
            notify();
        }

        function storeOnChange(fn){
            _onChangeQueue.push(fn);
        }
        
        function notify(){
            var totalSubscribers= _onChangeQueue.length;
            while(totalSubscribers--){
                if(_onChangeQueue[totalSubscribers] && typeof _onChangeQueue[totalSubscribers] === 'function'){
                    _onChangeQueue[totalSubscribers]({
                        source:_source,
                        canvas:_canvas,
                        context:_context
                    });
                }
            }
        }
        
        function cacheCanvasDimensions(){
            if(_canvasElement){
                var canvasBounding = _canvasElement.getBoundingClientRect();

                _canvas['top']      = canvasBounding.top;
                _canvas['left']     = canvasBounding.left;
                _canvas['cWidth']   = _canvasElement.offsetWidth;
                _canvas['cHeight']  = _canvasElement.offsetHeight;
            }
        }

        function measureContext(){
            var hRatio      =   _canvas.width  / _source.width,
                vRatio      =   _canvas.height  / _source.height,
                ratio       =   Math.min( hRatio, vRatio);

            return {
                sx:         0,
                sy:         0,
                sWidth:     _source.width,
                sHeight:    _source.height,
                dx:         (_canvas.width - _source.width * ratio ) / 2,
                dy:         (_canvas.height - _source.height * ratio ) / 2,
                dWidth:     _source.width * ratio,
                dHeight:    _source.height * ratio
            }
        }
    }
})();
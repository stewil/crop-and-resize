(function() {
    module.exports = CanvasDependencies;

    function CanvasDependencies(_eventQueues) {
        
        var _onChangeQueue  =   [],
            _image          =   new Image(),
            _source         =   {},
            _canvas         =   {},
            _canvasElement,
            _context;

        _image.onload       =   onCanvasSrcLoad;
        _eventQueues.subscribe('resize', window, cacheCanvasDimensions);

        return function(canvasElement, file){
            _canvasElement  =   canvasElement;
            _context        =   _canvasElement.getContext('2d');
            _image.src      =   file;
            return {
                onChange:storeOnChange
            };
        };

        function onCanvasSrcLoad(e){
            _source['width']  = this.width;
            _source['height'] = this.height;

            _canvas['width']  = _canvasElement.width;
            _canvas['height'] = _canvasElement.height;

            var canvasParams = measureContext();

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
                _canvas['cWidth']   = _canvasElement.clientWidth;
                _canvas['cHeight']  = _canvasElement.clientHeight;
            }
        }

        function measureContext(){
            var hRatio      =   _canvas.width  / _source.width,
                vRatio      =   _canvas.height  / _source.height,
                ratio       =   Math.min ( hRatio, vRatio);

            return {
                sx:         0,
                sy:         0,
                sWidth:     _source.width,
                sHeight:    _source.height,
                dx:         (_canvas.width - _source.height * ratio ) / 2,
                dy:         (_canvas.height - _source.height * ratio ) / 2,
                dWidth:     _source.width * ratio,
                dHeight:    _source.height * ratio
            }
        }

        return function bindCanvas() {
            var self = this,
                canvas = document.createElement('canvas');

            self['canvas']          =   {};
            self.canvas['element']  =   canvas;
            self.canvas['context']  =   self.canvas.element.getContext('2d');

            var parent      =   _element.parentElement,
                image       =   new Image();

            image.onload    =   onCanvasImageLoad;
            image.src       =   self.original.url;



            /*function cacheCanvasDimensions(e){
                var canvasBounding = canvas.getBoundingClientRect();

                self.canvas['top']      = canvasBounding.top;
                self.canvas['left']     = canvasBounding.left;
                self.canvas['left']     = canvasBounding.left;
                self.canvas['cWidth']   = canvas.clientWidth;
                self.canvas['cHeight']   = canvas.clientHeight;
            }*/

            function onCanvasImageLoad(){
                self.original['width']  =   this.width;
                self.original['height'] =   this.height;

                self.canvas['width']    =   self['canvas'].element.width;
                self.canvas['height']   =   self['canvas'].element.height;

                var canvasParams = measurements(self.original, self.canvas);


                //TODO:This information should be passed into the function
                /*if(attributes['target']){
                    attributes['target'].appendChild(self.canvas.element)
                }else{
                    parent.insertBefore(self.canvas.element, _element);
                }*/

                self.canvas.context.clearRect(0, 0, self.canvas['width'], self.canvas['height']);
                self.canvas.context.drawImage(image,
                    canvasParams.sx,
                    canvasParams.sy,
                    canvasParams.sWidth,
                    canvasParams.sHeight,
                    canvasParams.dx,
                    canvasParams.dy,
                    canvasParams.dWidth,
                    canvasParams.dHeight
                );

                cropWindow((attributes['target'] || parent), self.canvas);
                cacheCanvasDimensions();

                function measurements(image, canvas){
                    var hRatio      =   canvas.width  / image.width,
                        vRatio      =   canvas.height  / image.height,
                        ratio       =   Math.min ( hRatio, vRatio);

                    return {
                        sx:         0,
                        sy:         0,
                        sWidth:     image.width,
                        sHeight:    image.height,
                        dx:         (canvas['width'] - image['width'] * ratio ) / 2,
                        dy:         (canvas['height'] - image['height'] * ratio ) / 2,
                        dWidth:     image.width * ratio,
                        dHeight:    image.height * ratio
                    }
                }

            }
        }
    }
})();
(function(){
    module.exports = EventsQueueDependencies;

    function EventsQueueDependencies(){

        var _queue = [];

        return {
            subscribe:subscribe,
            unSubscribe:unSubscribe,
            removeAll:removeAll
        };


        function subscribe(eventName, element, fn){
            for(var i = 0; i < _queue.length; i++){
                if(_queue[i].event === event && _queue[i].element === element){
                    _queue[i].events.push(fn);
                    return;
                }
            }
            new EventObject(eventName, element, fn);
        }

        function EventObject(eventName, element, fn){

            var queueObject = {
                events:[fn],
                element:element,
                fn:fn
            };

            _queue.push(queueObject);

            element.addEventListener(eventName, onEvent);

            function onEvent(e){
                for(var i = 0; i < queueObject.events.length; i++){
                    queueObject.events[i].call(this, e);
                }
            }
        }

        function unSubscribe(eventName, element, fn){

        }

        function removeAll(){

        }

    }
})();
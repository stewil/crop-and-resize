(function(){
    module.exports = EventsQueue();

    function EventsQueue(){

        var _queue       = [],
            _eventsQueue = {};

        /*========================================================================
            PUBLIC
        ========================================================================*/
        _eventsQueue.subscribe     = subscribe;
        _eventsQueue.removeAll     = removeAll;
        _eventsQueue.triggerEvent  = triggerEvent;

        return _eventsQueue;

        /*========================================================================
            PRIVATE
        ========================================================================*/

        function subscribe(eventName, element, subscriberFn){
            var knownQueueItem;
            for(var i = 0; i < _queue.length; i++){
                if(_queue[i].eventName === eventName && _queue[i].element === element){
                    _queue[i].events.push(subscriberFn);
                    knownQueueItem = _queue[i];
                    break;
                }
            }
            return (knownQueueItem || new EventObject(eventName, element, subscriberFn))['publicEvents'];
        }

        function triggerEvent(eventName, element){
            var l = _queue.length;
            while(l--){
                if(_queue[l].element === element && _queue[l].eventName === eventName){
                    _queue[l].publicEvents.trigger();
                    return;
                }
            }
        }

        function EventObject(eventName, element, subscriberFn){

            var queueObject = {
                events      : [subscriberFn],
                element     : element,
                eventName   : eventName,
                    publicEvents:{
                        unSubscribe : unSubscribe,
                        trigger     : trigger
                    }
                },
                customEvent = document.createEvent('Event');

            customEvent.initEvent(eventName, true, true);
            element.addEventListener(eventName, onEvent);
            _queue.push(queueObject);

            return queueObject;

            function onEvent(e){
                for(var i = 0; i < queueObject.events.length; i++){
                    queueObject.events[i].call(this, e);
                }
            }

            function trigger(){
                element.dispatchEvent(customEvent);
            }

            function unSubscribe(){

                var functionIdx = queueObject.events.indexOf(subscriberFn);

                if(functionIdx > -1 && queueObject){
                    queueObject.events.splice(functionIdx, 1);
                }

                if(queueObject.events.length <= 0){
                    element.removeEventListener(eventName, onEvent);
                    _queue.splice(_queue.indexOf(queueObject), 1);
                }
            }
        }

        function removeAll(){
            var l = _queue.length;
            while(l--){
                _queue[l].publicEvents.unSubscribe();
            }
        }
    }
})();
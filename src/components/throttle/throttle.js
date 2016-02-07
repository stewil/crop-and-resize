(function(){
    module.exports = Throttle;

    function Throttle(callback, time){
        var wait = false,
            timeout;

        return function(e){
            if(!wait){
                callback(e);
                wait = true;
                timeout = setTimeout(function(){
                    wait = false;
                }, time);
            }
        }
    }
})();
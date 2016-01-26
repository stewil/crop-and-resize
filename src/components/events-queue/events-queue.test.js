(function(){

	var subscriber;
	
	function testEventsQueueFunction(){
		return true;
	}

	describe("Events Module", function(){

		it("will successfully store a function and returns a 'subscriber' object", function(){
			subscriber = eventsQueueModule.subsribe('scroll', window, testEventsQueueFunction);
			expect(subsriber).toContain('unSubscribe');
		});

		it("will correctly execute stored function", function(){});

		it("will correctly remove stored function", function(){});
	})
})();
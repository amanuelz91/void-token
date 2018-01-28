contract('Crowdsale', function(accounts) {

    describe('Setup', function(){
        it('should have token address setup'});

        it('should have correct starttime'});
        it('should have correct endtime'});

        it('should have correct rate'});

        it('should have wallet set'});

        it('should have hard cap set'});

        it('should have weiRised set to 0'});
        it('should set token contract'});
    });

    describe('Purchase', function(){
        it('should allow to buy tokens and transfer ether to wallet'});
    });

    describe('Fail cases', function(){
        before('new preICO', async () => {
            // set new contracts
        });

        it('should have token address setup'});

        it('should have rate', async () => {
            // set big enough rate so you can buy out all tokens for this crowdsale
            // and see how contract will act then
        });

        it('should have wallet set'});

        it('should have hard cap set'});

        it('should not allow to set token again'});

        it('should not allow to buy token after sale ended'});

        it('should not allow to exceed hard cap'});

        it('should not allow to buy token before start date'});

        it('should not allow to buy token after end date'});

        
    });
});

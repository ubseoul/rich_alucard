(function(){
 function balance(){return RAState.get().life.resources.money;}
 function spend(amount){amount=Math.max(0,Number(amount)||0);if(amount>balance())return false;RAState.patch('life.resources.money',balance()-amount);try{window.RAAudio?.sfx?.('CASH_OUT');}catch(e){}return true;}
 function add(amount){RAState.patch('life.resources.money',balance()+Math.max(0,Number(amount)||0));try{window.RAAudio?.sfx?.('CASH_IN');}catch(e){}return balance();}
 window.RABudget={balance,spend,add};
})();

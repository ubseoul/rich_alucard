(function(){
 function balance(){return RAState.get().rich.budget;}
 function spend(amount){amount=Math.max(0,Number(amount)||0);if(amount>balance())return false;RAState.patch('rich.budget',balance()-amount);return true;}
 function add(amount){RAState.patch('rich.budget',balance()+Math.max(0,Number(amount)||0));return balance();}
 window.RABudget={balance,spend,add};
})();

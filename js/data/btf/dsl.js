(function(){
 // Tiny authoring helpers so adventure files stay readable. Every Rich line is [VP] unless marked canon.
 const R=(text,opts={})=>['rich',text,{vp:true,...opts}];      // RICH LINE — VOICE PASS REQUIRED
 const RC=(text,opts={})=>['rich',text,{canon:true,...opts}];  // approved/canon Rich line
 const S=(who,text,opts={})=>[who,text,opts];
 const N=(text,opts={})=>[null,text,opts];
 const E=(who,text,opts={})=>[who,text,{entrance:who,...opts}]; // held entrance beat
 window.RAContent={R,RC,S,N,E};
})();

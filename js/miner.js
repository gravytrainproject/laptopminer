var pk;

setTimeout(function(){
	var node = window.localStorage['node_url'];
	var miner = window.localStorage['miner_account'];
	var permission_name = window.localStorage['permission_name'];
    var interval = window.localStorage['mining_interval'];
	var expiration = window.localStorage['expiration_interval'];
	var blocks_behind = window.localStorage['blocks_behind'];

	if(node != null){
		document.getElementById("endpoint_input").value = node;
	}
	
	if(miner != null){
		document.getElementById("miner_account_input").value = miner;
	}
	
	if(permission_name != null){
		document.getElementById("permission_input").value = permission_name;
	}
	
	if(interval != null){
		document.getElementById("interval_input").value = interval;
	}
	
	if(expiration != null){
		document.getElementById("expiration_input").value = expiration;
	}
	
	if(blocks_behind != null){
		document.getElementById("blocks_behind_input").value = blocks_behind;
	}
}, 1);

function connect(){
    console.log("sheeeeet");
	
	// pop up pk entry modal
	
	show_pk_entry_modal();

}

function show_pk_entry_modal(){

    if(document.getElementById("loginbutton").value == "Login"){
		document.getElementById("loader_wrapper").style.visibility = "visible";
	}else{
		pk = "";
		document.getElementById("pk_input").value = "";
		halt_mining();
		login_toggle();
	}


}

function close_pk_modal(){
    pk = document.getElementById("pk_input").value;
	document.getElementById("loader_wrapper").style.visibility = "hidden";
	
	logout_toggle();

}

function logout_toggle(){
	document.getElementById("loginbutton").style.background = "rgba(220,20,20,0.5)";
	document.getElementById("loginbutton").style.color = "rgba(220,220,220,1.0)";
	document.getElementById("loginbutton").value = "Logout";
}

function login_toggle(){
	document.getElementById("loginbutton").style.background = "rgba(9,199,164,0.8)";
	document.getElementById("loginbutton").style.color = "rgba(20,20,20,1)";
	document.getElementById("loginbutton").value = "Login";
}

function logout(){
	console.log("logging out");
	scatterJS.logout();
}

var mining_interval_var;

var rpc, signatureProvider, api;

function begin_mining(){

    if(pk == "" || pk == null){
		alert("Please enter valid EOS Private Key for Miner Account");
		return;
	}

    var interval = Number(document.getElementById("interval_input").value);

	var node_url = document.getElementById("endpoint_input").value;

	rpc = new eosjs_jsonrpc.JsonRpc(node_url);

	signatureProvider = new eosjs_jssig.JsSignatureProvider([pk]);
	  
	api = new eosjs_api.Api({ rpc, signatureProvider });

    document.getElementById("minebutton").style.background = "rgba(220,20,20,0.5)";
	document.getElementById("minebutton").style.color = "rgba(220,220,220,1)";
	document.getElementById("minebutton").value = "Halt Mining";
	document.getElementById("minebutton").onclick = halt_mining;
	
	disable_inputs();

    mine();
	mining_interval_var = setInterval(mine, interval);

}

function halt_mining(){
	
	clearInterval(mining_interval_var);
	
	document.getElementById("minebutton").style.background = "rgba(9,199,164,0.8)";
	document.getElementById("minebutton").style.color = "rgba(20,20,20,1)";
	document.getElementById("minebutton").value = "Start Mining";
	document.getElementById("minebutton").onclick = begin_mining;
	
	enable_inputs();
}

function mine(){

	var miner = document.getElementById("miner_account_input").value;
	var permission_name = document.getElementById("permission_input").value;

	(async () => {
    try {
      const result = await api.transact({
        actions: [{
            account: 'gravyhftdefi',
            name: 'mine',
            authorization: [{
                actor: miner,
                permission: permission_name,
            }],
            data: {
                miner: miner,
                rando: (Math.random() * 1000).toFixed(0),
                symbol: '8,GRV'
            },
        }]
      }, {
        blocksBehind: 3,
        expireSeconds: 30,
      }).then(res => {
		console.log("success!!!");
		var action_count = document.getElementById("mine_action_count").innerHTML;
		console.log(action_count);
		action_count = Number(action_count) + 1;
		document.getElementById("mine_action_count").innerHTML = action_count.toFixed(0);
		var traces = res['processed']['action_traces'][0]['inline_traces'];
		traces.forEach(function(trace){
			var action = trace.act;
			if(action.account == "gravyhftdefi"){
				if(action.name == "transfer"){
					var act_data = action.data;
					if(act_data.from == "gravyhftdefi" && act_data.to == miner){
						var grv_mined = Number(act_data.quantity.split(" ")[0]);
						var current_grv_mined = Number(document.getElementById("grv_mined_count").innerHTML);
						current_grv_mined += grv_mined;
						document.getElementById("grv_mined_count").innerHTML = current_grv_mined.toFixed(8);
						console.log("mined " + act_data.quantity);
					}
				}
			}
		});
		//console.log();
	  });
	} catch (e) {
        var action_count = document.getElementById("mine_error_count").innerHTML;
	    action_count = Number(action_count) + 1;
	    document.getElementById("mine_error_count").innerHTML = action_count.toFixed(0);
        if (e instanceof eosjs_jsonrpc.RpcError)
	       console.log(e);
    }
  })();
	
}

/*
	if(node != null){
		document.getElementById("endpoint_input").value = node;
	}
	
	if(miner != null){
		document.getElementById("miner_account_input").value = miner;
	}
	
	if(permission_name != null){
		document.getElementById("permission_input").value = permission_name;
	}
	
	if(interval != null){
		document.getElementById("interval_input").value = interval;
	}
	
	if(expiration != null){
		document.getElementById("expiration_input").value = expiration;
	}
	
	if(blocks_behind != null){
		document.getElementById("blocks_behind_input").value = blocks_behind;
	}
*/

function disable_inputs(){
	document.getElementById("endpoint_input").disabled = true;
	document.getElementById("miner_account_input").disabled = true;
	document.getElementById("permission_input").disabled = true;
	document.getElementById("interval_input").disabled = true;
	document.getElementById("expiration_input").disabled = true;
	document.getElementById("blocks_behind_input").disabled = true;
}


function enable_inputs(){
	document.getElementById("endpoint_input").disabled = false;
	document.getElementById("miner_account_input").disabled = false;
	document.getElementById("permission_input").disabled = false;
	document.getElementById("interval_input").disabled = false;
	document.getElementById("expiration_input").disabled = false;
	document.getElementById("blocks_behind_input").disabled = false;
}

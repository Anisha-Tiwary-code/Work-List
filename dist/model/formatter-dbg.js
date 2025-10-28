sap.ui.define(["sap/m/Text"], function (Text) {
	"use strict";
	return {
		dateFormat: function(oEve){
			if (oEve != undefined) {
			var dt= new Date(oEve);
			var day = String(dt.getDate()).padStart(2, '0');
			var month = String(dt.getMonth()+1).padStart(2, '0');
    		var output =  day + '-'+ month + "-" + dt.getFullYear();
			return output;
			}
		},
	};
});
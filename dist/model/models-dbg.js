sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/ui/Device",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/core/ValueState"
], 
    /**
     * provide app-view type models (as in the first "V" in MVVC)
     * 
     * @param {typeof sap.ui.model.json.JSONModel} JSONModel
     * @param {typeof sap.ui.Device} Device
     * 
     * @returns {Function} createDeviceModel() for providing runtime info for the device the UI5 app is running on
     */
    function (JSONModel, Device,ODataModel,ValueState) {
        "use strict";

        return {
            createDeviceModel: function () {
                var oModel = new JSONModel(Device);
                oModel.setDefaultBindingMode("OneWay");
                return oModel;
        },
        createfilterModel: function () {
			var filModel = new JSONModel();
			var filItem = {
				"Plant":"",
				"WorkCenter":"",
				"CRTD":false,
				"REL":false,
				"TECO":false,
				"StartDateTo":"7",
				"StartDateFrom":"-7"
				
			};
			filModel.setData(filItem);
			filModel.setDefaultBindingMode("TwoWay");
			return filModel;
		},
        createColumnModel: function () {
			var oColModel = new JSONModel();
			var colItem = {
				"workcenter": {
					"cols": [{
							"label": "{i18n>lblWorkCenter}",
							"template": "Arbpl"
						}, {
							"label": "{i18n>lblDescription}",
							"template": "Ktext"
						}, {
							"label": "{i18n>lblPlant}",
							"template": "Werks"
						}
					]
				}
			};
			oColModel.setData(colItem);
			oColModel.setDefaultBindingMode("TwoWay");
			return oColModel;
		},
        createVHKeyModel: function () {
			var omModel = new JSONModel();
			var mItem = {
				"Title": "",
				"key": "",
				"descriptionKey": ""
			};
			omModel.setData(mItem);
			omModel.setDefaultBindingMode("TwoWay");
			return omModel;
		},
		createValueHelpModel: function () {
			var oVHModel = new JSONModel();
			var vhItem = {
				"WorkCenter": []
			};
			oVHModel.setData(vhItem);
			oVHModel.setDefaultBindingMode("TwoWay");
			return oVHModel;
		},
		createTableModel: function () {
			var omModel = new JSONModel();
			var mItem = [];
			omModel.setData({
				"TableSet": mItem
			});
			omModel.setDefaultBindingMode("TwoWay");
			return omModel;
		},
		/*	Method: createAppModeModel
		 *	Description/Usage: Initiating local JSONModel for app mode (display or edit or create)
		 */
		 createAppModeModel: function () {
			var omModel = new JSONModel();
			var mItem = {
				"vsStatusErrorText":"",
				"vsStatus": ValueState.None,
				"vsPlantErrorText":"",
				"vsPlant": ValueState.None,
				"vsWorkCenter1ErrorText":"",
				"vsWorkCenter1": ValueState.None,
				"vsWorkCenterErrorText":"",
				"vsWorkCenter": ValueState.None
			};
			omModel.setData(mItem);
			omModel.setDefaultBindingMode("TwoWay");
			return omModel;
		},
		createSearchableColumnsModel: function () {
			var i18nModel = new sap.ui.model.resource.ResourceModel( {bundleName: "com.reckitt.zpeworklist.i18n.i18n" } );
			var oVHModel = new JSONModel();
			var vhItem = {
				"columns": [{"cell":i18nModel.getResourceBundle().getText("lblOrder"),
							 "key":"Aufnr",status:true}, //Code Added By Komal Nilakhe on 07082024
							 {"cell":i18nModel.getResourceBundle().getText("lblMaterial"),
							 "key":"Matnr",status:true},
							 {"cell":i18nModel.getResourceBundle().getText("lblDescription"),
							 "key":"Maktx",status:true},
							 {"cell":i18nModel.getResourceBundle().getText("lblBatch"),
							 "key":"Charg",status:true},
							 {"cell":i18nModel.getResourceBundle().getText("lblWorkCenter"),
							 "key":"Arbpl",status:true},
							 {"cell":i18nModel.getResourceBundle().getText("lblOperation"),
							 "key":"Vornr",status:true},
							 {"cell":i18nModel.getResourceBundle().getText("lblQty"),
							 "key":"Mgvrg",status:true},
							 {"cell":i18nModel.getResourceBundle().getText("lblYield"),
							 "key":"Lmnga",status:true},
							 {"cell":i18nModel.getResourceBundle().getText("lblUoM"),
							 "key":"Meinh",status:true},
							 {"cell":i18nModel.getResourceBundle().getText("lblLSD"),
							 "key":"LatStartDate",status:true},
							 {"cell":i18nModel.getResourceBundle().getText("lblLST"),
							 "key":"LatStartTime",status:true},
							 {"cell":i18nModel.getResourceBundle().getText("lblSystemStatus"),
							 "key":"SysStatus",status:true}]
			};
			oVHModel.setData(vhItem);
			oVHModel.setDefaultBindingMode("TwoWay");
			return oVHModel;
		},

    };
});
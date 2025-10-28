sap.ui.define([
    "./BaseController",
    "sap/ui/core/mvc/Controller",
    "sap/ui/comp/smartvariants/PersonalizableInfo",
    "sap/ui/table/TablePersoController",
    "../utils/DemoPersoService",
    "../custom/customVariant",
    "sap/m/MessageBox",
    "sap/ui/core/BusyIndicator",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/Dialog",
    "com/reckitt/zpeworklist/model/formatter",

],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (BaseController, Controller, PersonalizableInfo, TablePersoController, DemoPersoService, customVariant, MessageBox, BusyIndicator, Filter, FilterOperator, Dialog,formatter) {
        "use strict";
        
        return BaseController.extend("com.reckitt.zpeworklist.controller.WorkToList", {
            formatter: formatter,
            _oSmartVariantManagement: null,
            _oTPC: null,
            _customVariant: null,
            onInit: function () {
                this._oSmartVariantManagement = this.byId("pageVariantId1");
                this.getUserParameters();
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.attachRouteMatched(this._onObjectMatched, this);
            },
            /*	Method: _onObjectMatched
         *	Description/Usage: if pattern matches it will save the hash and load work to list
         **/
            _onObjectMatched: function (oEvent) {
                var sHashChanger = new sap.ui.core.routing.HashChanger();
                var sHash = sHashChanger.getHash();
                if (sHash !== "undefined" && sHash !== "") {
                    var sAppStateKeys = /(?:sap-iapp-state=)([^&=]+)/.exec(sHash);
                    if (sAppStateKeys !== null) {
                        var sAppStateKey = sAppStateKeys[1];
                        sap.ushell.Container
                            .getService("CrossApplicationNavigation")
                            .getAppState(this.getOwnerComponent(), sAppStateKey)
                            .done(function (oSavedAppState) { 
                                this.getView().getModel("filterModel").setData(oSavedAppState.getData());
                                var oTokens = this.getView().getModel("filterModel");
                                this.getView().byId("idWorkCenter").setTokens([]);
                                if ( oTokens.getProperty("/tokens") != undefined) {
                                    for (let i = 0; i < oTokens.getProperty("/tokens").length; i++) {
                                        // For each result create new token and append it to the input field.
                                        // Token instance
                                        var oWCToken = new sap.m.Token({
                                            text: oTokens.getProperty("/tokens")[i],
                                            key: oTokens.getProperty("/tokens")[i]
                                        });
                                        // Add created token to the storage type field
                                        this.byId("idWorkCenter").addToken(oWCToken);
                                    }
                                }
                                this.getView().getModel("filterModel").refresh();
                                this.onSearch();
                            }.bind(this));
                    }
                }

            },
            onBeforeRendering: function () {
                if (this.getView().byId("customVariant") !== undefined) {
                    this.getView().byId("customVariant").destroy();
                }
                this._customVariant = new customVariant(this.createId("customVariant"), { persistencyKey: "commanKey" });
               // this.getWorkCenterSHSet();//code added by Komal Nilakhe on 09/08/2024
            },
            onAfterRendering: function () {

                var oPersInfo = new PersonalizableInfo({
                    keyName: "persistencyKey",
                    type: "table"
                });
                oPersInfo.setControl(this._customVariant);
                this._oSmartVariantManagement.addPersonalizableControl(oPersInfo);

                this._oSmartVariantManagement.initialise(function () {
                    this._oSmartVariantManagement.currentVariantSetModified(false);
                }.bind(this), this._customVariant);

                this._customVariant.registerFetchData(this.onVariantFetchData.bind(this));
                this._customVariant.registerApplyData(this.onVariantApplyData.bind(this));
            },
            onVariantFetchData: function () {

                var that = this;
                var wc = this.byId("idWorkCenter").getTokens();
                var wts = [];
                wc.forEach(function (obj) {
                    wts.push(obj.getKey());
                });
                return {
                    "InputValue1": {
                        Plant: this.byId("idPlant").getValue(),
                        WorkCenter: wts,
                        StartDateTo: this.byId("idStartDateTo").getValue(),
                        StartDateFrom: this.byId("idStartDateFrom").getValue(),
                        CRTD: this.byId("cb1").getProperty("selected"),
                        REL: this.byId("cb2").getProperty("selected"),
                        TECO: this.byId("cb3").getProperty("selected")
                    }
                };
            },
            onVariantApplyData: function (oData) {
                this.byId("cb1").setProperty("selected", oData.InputValue1.CRTD);
                this.byId("cb2").setProperty("selected", oData.InputValue1.REL);
                this.byId("cb3").setProperty("selected", oData.InputValue1.TECO);
                this.byId("idStartDateFrom").setValue(oData.InputValue1.StartDateFrom);
                // this.byId("idWorkCenter").setValue(oData.InputValue1.WorkCenter);
                this.byId("idStartDateTo").setValue(oData.InputValue1.StartDateTo);
                this.byId("idPlant").setValue(oData.InputValue1.Plant);
                this.byId("idWorkCenter").setTokens([]);
                if (oData.InputValue1.WorkCenter != undefined) {
                    for (let i = 0; i < oData.InputValue1.WorkCenter.length; i++) {
                        // For each result create new token and append it to the input field.
                        // Token instance
                        var stToken = new sap.m.Token({
                            text: oData.InputValue1.WorkCenter[i],
                            key: oData.InputValue1.WorkCenter[i]
                        });
                        // Add created token to the storage type field
                        this.byId("idWorkCenter").addToken(stToken);
                    }
                }
            },
            onVHWorkCenter: function (oEvent) {
                var control = oEvent.getSource();
                var oRes = this.getOwnerComponent().getModel("i18n").getResourceBundle();
                this.getOwnerComponent().getModel("VHKeyModel").setProperty("/Title", oRes.getText("lblWorkCenter"));
                this.getOwnerComponent().getModel("VHKeyModel").setProperty("/key", "Arbpl");
                this.getOwnerComponent().getModel("VHKeyModel").setProperty("/descriptionKey", "Ktext");
                var columns = this.getOwnerComponent().getModel("ColumnModel").getObject("/workcenter");
                var data = this.getOwnerComponent().getModel("CommonValueHelpModel").getObject("/WorkCenter");
                var entityset = "WorkCenterSHSet";
                this.fnValueHelpDialog(control, entityset, columns, data);
            },
            handleVaraintModification: function (bModified) {
                this._oSmartVariantManagement.currentVariantSetModified(bModified);
            },
            onlivechange: function (oEvent) {

                var num = this.getView().byId(oEvent.oSource.getId().split("WorkToList--")[1]);
                if (num.getValue().length > 2) {
                    if (num.getValue().slice(0, 1) === "+" || num.getValue().slice(0, 1) === "-") {
                        num.setValue(num.getValue().slice(0, 3));
                    }
                    else {
                        num.setValue(num.getValue().slice(0, 2));
                    }
                }
            },
            onSearch: function () {
                this.getOwnerComponent().getModel("TableModel").setData([]);
                if (this.fnValidateHeader() === true) {
                    BusyIndicator.show(0);
                    var aFilter = this.fnFilterValues();
                    var that = this;
                    var oWorkListModel = this.getOwnerComponent().getModel("oDataWorkListModel");
                    oWorkListModel.read("/OrderInfoOperSet", {
                        filters: aFilter,
                        success: $.proxy(function (oData, oResponse) {
                            if (oResponse.statusCode === 200 || oResponse.statusCode === "200") {
                                if (oData.results.length > 0) {
                                    var serviceData = oData.results;
                                    that.getOwnerComponent().getModel("TableModel").setData(serviceData);
                                    BusyIndicator.hide();
                                }
                                else {
                                    var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
                                    MessageBox.warning(oResourceBundle.getText("lblNoDataFound"));
                                    BusyIndicator.hide();
                                }
                            }
                            BusyIndicator.hide();
                        }, this),
                        error: $.proxy(function (oError) {
                            var response = oError.message;
                            MessageToast.show(response);
                            BusyIndicator.hide();
                        }, this)
                    });
                }
            },
            onSearchableColumns: function () {
                if (!this.FilterDialog) {

                    this.FilterDialog = sap.ui.xmlfragment("com.reckitt.zpeworklist.view.Fragments.searchableColumns", this);
                    this.getView().addDependent(this.FilterDialog);
                }

                this.FilterDialog.open();

            },
            onLiveTableSearch: function (oEvent) {
                var sQuery = oEvent.getSource().getValue();
                var filters = [];
                var oSeltedColumModel = this.getOwnerComponent().getModel("SearchableColumnsModel");
                oSeltedColumModel.getProperty("/columns").forEach(function (oItme, index) {
                    if (oItme.status === true) {
                        filters.push(new Filter(oItme.key, FilterOperator.Contains, sQuery));
                    }
                });
                var oFilter = new Filter({ filters });
                var oBinding = oEvent.getSource().getParent().getParent().getBinding("items");
                oBinding.filter(oFilter);
            },
            onchangePlant: function () {
                var value = this.getView().byId("idPlant");
                value.setValue(value.getValue().toUpperCase());

            },
            onPlantChange: function (oEvent) {
                var value = this.getView().byId("idPlant");
                value.setValue(value.getValue().toUpperCase());
                this.getWorkCenterSHSet();
            },
            /*	Method: onSelectItem
         *	Description/Usage: navigate to Display/Release order screen when worklist  item is selected from list.
         */
            onSelectItem: function (oEvent) {
                var selRef = oEvent.getSource().getSelectedContextPaths()[0];
                var selObject = this.getView().getModel("TableModel").getObject(selRef);
                var Aufnr = selObject.Aufnr;
                var oWCRef = this.getView().byId("idWorkCenter").getTokens();
                var oWC = [];
                oWCRef.forEach(function (obj) {
                    oWC.push(obj.getKey());
                });
                this.getView().getModel("filterModel").setProperty("/tokens", oWC);
                var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
                var oAppState = oCrossAppNavigator.createEmptyAppState(this.getOwnerComponent());
                oAppState.setData(this.getView().getModel("filterModel").getData());
                oAppState.save();
                var ohashChanger = new sap.ui.core.routing.HashChanger.getInstance();
                var oldHash = ohashChanger.getHash().split("?sap-iapp-state")[0];
                var sNewHash = oldHash + "?" + "sap-iapp-state=" + oAppState.getKey();
                ohashChanger.replaceHash(sNewHash);
                var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
                    target: {
                        semanticObject: "zpe_disp_rel_order",
                        action: "display"
                    },
                    appSpecificRoute: Aufnr,
                    appStateKey: oAppState.getKey()
                })) || "";

                oCrossAppNavigator.toExternal({
                    target: {
                        shellHash: hash
                    }
                });

            }
        });
    });

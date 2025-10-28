/* eslint-disable radix,	no-extra-boolean-cast */
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Fragment",
	"sap/m/ColumnListItem",
	"sap/m/Label",
	"sap/m/Token",
	"sap/m/SearchField",
	"sap/m/MessageBox",
	"sap/ui/core/message/Message",
	"sap/ui/core/BusyIndicator",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/core/ValueState",
	"sap/ui/model/Sorter"
], function (Controller, JSONModel, Fragment, ColumnListItem, Label, Token, SearchField, MessageBox, Message, BusyIndicator, Filter,
	FilterOperator, ValueState, Sorter) {
	"use strict";
	var oResource;
	return Controller.extend("com.reckitt.zpeworklist.controller.BaseController", {
		onInit: function () {
			oResource = this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},
		/*	Method: getUserParameters
 *	Description/Usage: method used for read odata service for fetching plant of the user from parameterID.
 **/
		getUserParameters: function () {
			BusyIndicator.show();
			var filterModel = this.getOwnerComponent().getModel("filterModel");
			var f4Model = this.getOwnerComponent().getModel("oDataSearchModel");
			f4Model.read("/UserPlantSet", {
				success: $.proxy(function (oRetrievedResult) {
					filterModel.setProperty("/Plant", oRetrievedResult.results[0].Plant);
					filterModel.refresh();
					sap.ui.core.BusyIndicator.hide();
					this.getWorkCenterSHSet();
				}, this),
				error: $.proxy(function (oError) {
					BusyIndicator.hide();
				})
			});
		},
		getWorkCenterSHSet: function () {
			BusyIndicator.show();
			var aFilter = [];
			var filterModel = this.getOwnerComponent().getModel("filterModel");
			var f4Model = this.getOwnerComponent().getModel("oDataSearchModel");
			var CommonValueHelpModel = this.getOwnerComponent().getModel("CommonValueHelpModel");
			if (filterModel.getProperty("/Plant").length != 0) {
				aFilter.push(new Filter("Werks", FilterOperator.EQ, filterModel.getProperty("/Plant")));
			}
			f4Model.read("/WorkCenterSHSet", {
				filters: aFilter,
				success: $.proxy(function (oRetrievedResult) {
					var newData1 = [];
					oRetrievedResult.results.forEach(function (obj) {
						var nItem = {
							"Arbpl": obj.Arbpl,
							"Ktext": obj.Ktext,
							"Werks": obj.Werks
						};
						newData1.push(nItem);
					});
					CommonValueHelpModel.setProperty("/WorkCenter", newData1);
					CommonValueHelpModel.refresh();
					BusyIndicator.hide();
				}, this),
				error: $.proxy(function (oError) {
					BusyIndicator.hide();
				})
			});
		},
		/*	Method: fnValueHelpDialog
		 *	Description/Usage: common method used for open value help dialog across application
		 **/
		fnValueHelpDialog: function (control, entityset, columnData, data) {
			var that = this;
			this._oBasicSearchField = new SearchField({
				showSearchButton: false,
				liveChange: function (oEvent) {
					sap.ui.core.BusyIndicator.show();
					var fil = []
					var sQuery = oEvent.getSource().getValue();
					var columns = [];
					var col = [];
					columnData.cols.forEach(function (col) {
						var oFilter = new sap.ui.model.Filter(col.template, sap.ui.model.FilterOperator.Contains, sQuery);
						columns.push(oFilter);
					});
					var obj1 = {};
					obj1[entityset] = data;
					that.oVHModel.setData(obj1);
					that._oValueHelpDialog.getTableAsync().then(function (oTable) {
						oTable.setModel(that.oVHModel);
						oTable.setModel(that.oColModel, "columns");
						if (oTable.bindRows) {
							oTable.bindAggregation("rows", "/" + entityset);
						}
						that._oValueHelpDialog.update();
					}.bind(that));
					control.setModel(this.oVHModel);
					var allFilter = new sap.ui.model.Filter(columns, false);
					var oBinding = oEvent.getSource().getParent().getParent().getParent().getItems()[1].getBinding("rows");
					oBinding.filter(allFilter);
					sap.ui.core.BusyIndicator.hide();
				}
			});
			this._oInput = control;
			this.oColModel = new JSONModel();
			this.oColModel.setData(columnData);
			var aCols = this.oColModel.getData().cols;
			this.oVHModel = new JSONModel();
			var obj = {};
			obj[entityset] = data;
			this.oVHModel.setData(obj);
			control.setModel(this.oVHModel);
			Fragment.load({
				name: "com.reckitt.zpeworklist.view.Fragments.ValueHelpDialog",
				controller: this
			}).then(function (oFragment) {
				this._oValueHelpDialog = oFragment;
				if (entityset === 'WorkCenterSHSet') {
					this._oValueHelpDialog.setSupportMultiselect(true);
				}
				this.getView().addDependent(this._oValueHelpDialog);
				this._oValueHelpDialog.getFilterBar().setBasicSearch(this._oBasicSearchField);
				this._oValueHelpDialog.getFilterBar().setShowGoOnFB(false);
				this._oValueHelpDialog.getTableAsync().then(function (oTable) {
					this._oValueHelpDialog.setTokens([]);
					var oWCRef = this.getView().byId("idWorkCenter").getTokens();
					this._oValueHelpDialog.setTokens(oWCRef);
					oTable.setModel(this.oVHModel);
					oTable.setModel(this.oColModel, "columns");
					if (oTable.bindRows) {
						oTable.bindAggregation("rows", "/" + entityset);
					}
					if (oTable.bindItems) {
						oTable.bindAggregation("items", "/" + entityset, function () {
							return new ColumnListItem({
								cells: aCols.map(function (column) {
									return new Label({
										text: "{" + column.template + "}"
									});
								})
							});
						});
					}
					this._oValueHelpDialog.update();
				}.bind(this));
				var oToken = new Token();
				oToken.setKey(this._oInput.getSelectedKey());
				oToken.setText(this._oInput.getValue());
				this._oValueHelpDialog.setTokens([oToken]);
				this._oValueHelpDialog.open();
			}.bind(this));
		},

		/*	Method: onVHOK
		 *	Description/Usage: common method used for select value help dialog selection or ok event across application
		 **/
		onVHOK: function (oEvent) {
			var aTokens = oEvent.getParameter("tokens");
			var oWCRef = this.getView().byId("idWorkCenter");
			// if(oWCRef.getTokens().length === 0 ){
			// 	this._oInput.setTokens(aTokens);
			// }
			// else{
			// //check if the token is already added to input field and ignore dublicate tokens
			// aTokens.forEach(function (item) {
			// 	var a = 0;
			// 	oWCRef.getTokens().forEach(function(oItem){
			// 		if(oItem.getKey() === item.getKey()){
			// 			a = a+1;
			// 		}
			// 	});
			// 	if(a === 0 ){
			// 		oWCRef.addToken(item);
			// 	}
			// });
			// }
			this._oInput.setTokens(aTokens);
			this._oValueHelpDialog.close();
		},
		/*	Method: onVHCancel
		 *	Description/Usage: common method used for select value help dialog cancel or close event across application
		 **/
		onVHCancel: function () {
			this._oValueHelpDialog.close();
		},
		/*	Method: onVHAfterClose
		 *	Description/Usage: common method used for select value help dialog afterclose event
		 **/
		onVHAfterClose: function () {
			this._oValueHelpDialog.destroy();
		},
		/*	Method: fnFilterValues
		 *	Description/Usage: it return combined filter values to filter
		 **/
		fnFilterValues: function () {
			var oRes = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			var aFilter = [];
			var filters = this.getOwnerComponent().getModel("filterModel");
			var WorkCenter = this.getView().byId("idWorkCenter").getTokens();
			//To get status selected
			var status = [];
			var selectedCRTD = filters.getProperty("/CRTD");
			var selectedREL = filters.getProperty("/REL");
			var selectedTECO = filters.getProperty("/TECO");
			if (selectedCRTD) {
				status.push(oRes.getText("txtCRTD"));
			}
			if (selectedREL) {
				status.push(oRes.getText("txtREL"));
			}
			if (selectedTECO) {
				status.push(oRes.getText("txtTECO"));
			}
			var wlStatus = status.toString();
			if (wlStatus.length > 0) {
				aFilter.push(new Filter("SysStatus", FilterOperator.EQ, wlStatus));
			}
			// var StorageTypefilter = this.getView().byId("idST").getTokens();
			if (filters.getProperty("/Plant").length > 0) {
				aFilter.push(new Filter("Werks", FilterOperator.EQ, filters.getProperty("/Plant")));
			}
			$.each(WorkCenter, function (index, value) {
				if (value.data().range === undefined) {
					aFilter.push(new Filter("Arbpl", sap.ui.model.FilterOperator.EQ, value.getKey()));
				}
			});
			// if (filters.getProperty("/Material").length > 0) {
			// 	aFilter.push(new Filter("Material", FilterOperator.EQ, filters.getProperty("/Material")));
			// }
			// if (filters.getProperty("/Batch").length > 0) {
			// 	aFilter.push(new Filter("Batch", FilterOperator.EQ, filters.getProperty("/Batch")));
			// }
			if (filters.getProperty("/StartDateFrom").length > 0) {
				aFilter.push(new Filter("RelSdateFrom", FilterOperator.EQ, filters.getProperty("/StartDateFrom")));
			}
			if (filters.getProperty("/StartDateTo").length > 0) {
				aFilter.push(new Filter("RelSdateTo", FilterOperator.EQ, filters.getProperty("/StartDateTo")));
			}
			return aFilter;
		},
		fnvalidationST: function () {
			var StorageType = this.getOwnerComponent().getModel("filterModel").getData().StorageType;
			if (StorageType.length === 0) {
				return false;
			}
			else {
				return true;
			}
		},
		fnValidateHeader: function () {
			var filterData = this.getOwnerComponent().getModel("filterModel").getData();
			var appModel = this.getOwnerComponent().getModel("AppModeModel");
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			this.fnResetValidationError(appModel);
			if (filterData.Plant.length === 0) {
				appModel.setProperty("/errorVisible", true);
				this.fnInsertErrorMessage(oResourceBundle.getText("errTxtPlant"));
				appModel.setProperty("/vsPlantErrorText", oResourceBundle.getText("errTxtPlant"));
				appModel.setProperty("/vsPlant", ValueState.Error);
			}
			if (filterData.WorkCenter.length !== 0) {
				appModel.setProperty("/errorVisible", true);
				this.fnInsertErrorMessage(oResourceBundle.getText("errTxtWorkCenter1"));
				appModel.setProperty("/vsWorkCenterErrorText", oResourceBundle.getText("errTxtWorkCenter1"));
				appModel.setProperty("/vsWorkCenter", ValueState.Error);
			}
			if (filterData.CRTD === false && filterData.REL === false && filterData.TECO === false) {
				appModel.setProperty("/errorVisible", true);
				this.fnInsertErrorMessage(oResourceBundle.getText("errTxtStatus"));
				appModel.setProperty("/vsStatusErrorText", oResourceBundle.getText("errTxtStatus"));
				appModel.setProperty("/vsStatus", ValueState.Error);
			}
			if (this.getView().byId("idWorkCenter").getTokens().length === 0) {
				appModel.setProperty("/errorVisible", true);
				this.fnInsertErrorMessage(oResourceBundle.getText("errTxtWorkCenter1"));
				appModel.setProperty("/vsWorkCenter1ErrorText", oResourceBundle.getText("errTxtWorkCenter1"));
				appModel.setProperty("/vsWorkCenter1", ValueState.Error);
			}
			if ((Number(filterData.StartDateFrom) > Number(filterData.StartDateTo)) && filterData.StartDateTo !== "") {
				appModel.setProperty("/errorVisible", true);
				MessageBox.error(oResourceBundle.getText("errTxtdata"));
			}
			if (appModel.getProperty("/errorVisible") === true) {
				return false;
			} else {
				return true;
			}
		},
		/*	Method: fnResetValidationError
		 *	Description/Usage: local method used for reset if any error value state
		 */
		fnResetValidationError: function (oAppModeModel) {
			sap.ui.getCore().getMessageManager().removeAllMessages();
			oAppModeModel.setProperty("/errorVisible", false);
			oAppModeModel.setProperty("/errorText", "");
			oAppModeModel.setProperty("/vsWorkCenter", ValueState.None);
			oAppModeModel.setProperty("/vsWorkCenter1", ValueState.None);
			oAppModeModel.setProperty("/vsStatus", ValueState.None);
			oAppModeModel.setProperty("/vsPlant", ValueState.None);
			oAppModeModel.refresh();
		},
		/*	Method: fnInitMessageManager
		 *	Description/Usage: Initialising message manager for error management
		 **/
		fnInitMessageManager: function () {
			var oMessageManager, oModel, oView;
			oView = this.getView();
			oMessageManager = sap.ui.getCore().getMessageManager();
			this.getOwnerComponent().setModel(oMessageManager.getMessageModel(), "message");
			oMessageManager.registerObject(oView, true);
			oModel = new JSONModel({
				MandatoryInputValue: "",
				DateValue: null,
				IntegerValue: undefined,
				Messages: ""
			});
			oView.setModel(oModel);
		},
		/*	Method: fnInsertErrorMessage
		 *	Description/Usage: insert error message if any found
		 **/
		fnInsertErrorMessage: function (errorMsg) {
			var oRe = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			var oMessage = new Message({
				message: errorMsg,
				type: oRe.getText("lblError"),
				target: "/Messages",
				processor: this.getView().getModel()
			});
			sap.ui.getCore().getMessageManager().addMessages(oMessage);
		},
		/*	Method: fnResetErrorMessage
		 *	Description/Usage: method used to reset or clear exisitng errors in popover
		 **/
		fnResetErrorMessage: function () {
			this.getOwnerComponent().getModel("message").setData([]);
		},
		/*	Method: sortCategories
			*	Description/Usage: method used to open notification fragment
			*/
		sortCategories: function () {
			if (!this.FilterDialog) {
				this.FilterDialog = sap.ui.xmlfragment("com.reckitt.zpeworklist.view.Fragments.column", this);
				this.getView().addDependent(this.FilterDialog);
			}
			this.FilterDialog.open();
		},
		/*	Method: handleSortConfirm
		 *	Description/Usage: method used to sort Stock
		 */
		handleSortConfirm: function (oEvent) {
			var oTable = this.byId("WorkListTable"),
				mParams = oEvent.getParameters(),
				oBinding = oTable.getBinding("items"),
				sPath,
				bDescending,
				aSorters = [];

			sPath = mParams.sortItem.getKey();
			bDescending = mParams.sortDescending;
			aSorters.push(new Sorter(sPath, bDescending));
			oBinding.sort(aSorters);
			this.onAfterDialogClose();
		},
		/*	Method: onDialogClose
	 *	Description/Usage: close event for opened dialog
	 */
		onDialogClose: function (oEvent) {
			oEvent.getSource().getParent().close();
		},
		// Code Added By Komal Nilakhe on 09082024 Starts Here
		onOK: function (oEvent) {
			var selectedContextPaths = oEvent.getSource().getParent().getContent()[0].getSelectedContextPaths();
			var oSelectedColumnsModel = this.getOwnerComponent().getModel("SearchableColumnsModel");
			var oTable = this.byId("WorkListTable");
		
			// Set all columns' visibility to false initially
			oSelectedColumnsModel.getProperty("/columns").forEach(function (oItem) {
				oItem.status = false;
			});
		
			// Set visibility to true for selected columns
			selectedContextPaths.forEach(function (oItem, index) {
				oSelectedColumnsModel.setProperty(oItem + "/status", true);
			});
		
			// Update the visibility of table columns based on status
			var oColumns = oTable.getColumns();
			oColumns.forEach(function (oColumn, index) {
				var oColumnData = oSelectedColumnsModel.getProperty("/columns")[index];
				oColumn.setVisible(oColumnData.status);
			});
		
			// Close the dialog
			oEvent.getSource().getParent().close();
		},
		// Code Added By Komal Nilakhe on 09082024 Ends Here
		/*	Method: onAfterDialogClose
		 *	Description/Usage: after close event for closed dialog
		 */
		onAfterDialogClose: function (oEvent) {
			this.FilterDialog = undefined;
		},
	});
});
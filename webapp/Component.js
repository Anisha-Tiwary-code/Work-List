/**
 * eslint-disable @sap/ui5-jsdocs/no-jsdoc
 */

sap.ui.define([
        "sap/ui/core/UIComponent",
        "sap/ui/Device",
        "com/reckitt/zpeworklist/model/models"
    ],
    function (UIComponent, Device, models) {
        "use strict";

        return UIComponent.extend("com.reckitt.zpeworklist.Component", {
            metadata: {
                manifest: "json"
            },

            /**
             * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
             * @public
             * @override
             */
            init: function () {
                // call the base component's init function
                UIComponent.prototype.init.apply(this, arguments);

                // enable routing
                this.getRouter().initialize();

                // set the device model
                this.setModel(models.createDeviceModel(), "device");
                this.setModel(models.createfilterModel(), "filterModel");
                this.setModel(models.createColumnModel(), "ColumnModel");
                this.setModel(models.createVHKeyModel(), "VHKeyModel");
                this.setModel(models.createValueHelpModel(), "CommonValueHelpModel");
                this.setModel(models.createTableModel(), "TableModel");
                this.setModel(models.createAppModeModel(), "AppModeModel");
                this.setModel(models.createSearchableColumnsModel(), "SearchableColumnsModel");
            }
        });
    }
);
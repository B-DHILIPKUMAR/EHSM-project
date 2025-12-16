sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox"
], function (Controller, History, Filter, FilterOperator, JSONModel, MessageBox) {
    "use strict";

    return Controller.extend("ehsm.controller.Incident", {
        formatter: {
            statusState: function (sStatus) {
                if (sStatus === "Open") {
                    return "Error";
                } else if (sStatus === "Closed") {
                    return "Success";
                } else {
                    return "None";
                }
            }
        },

        onInit: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("Incident").attachPatternMatched(this._onObjectMatched, this);

            // Create JSON model for incident table
            var oIncidentModel = new sap.ui.model.json.JSONModel();
            this.getView().setModel(oIncidentModel, "incident");
        },

        _onObjectMatched: function () {
            var sEmployeeId = this.getOwnerComponent().getModel("session").getProperty("/EmployeeId");

            if (sEmployeeId) {
                this._loadData(sEmployeeId);
            } else {
                this.getOwnerComponent().getRouter().navTo("Login");
            }
        },

        _loadData: function (sEmployeeId) {
            var oModel = this.getOwnerComponent().getModel();
            var oView = this.getView();
            var oIncidentModel = oView.getModel("incident");

            // Bypass ODataModel read because Backend metadata has incorrect Keys (EmployeeId only)
            var sServiceUrl = oModel.sServiceUrl;
            if (!sServiceUrl.endsWith("/")) {
                sServiceUrl += "/";
            }
            var sUrl = sServiceUrl + "ZEHSM_INCIDENTSet";

            oView.setBusy(true);

            $.ajax({
                url: sUrl,
                type: "GET",
                dataType: "json",
                data: {
                    "$filter": "EmployeeId eq '" + sEmployeeId + "'",
                    "$format": "json"
                },
                success: function (oData) {
                    oView.setBusy(false);
                    var aResults = (oData && oData.d && oData.d.results) ? oData.d.results : [];

                    // Manually parse OData Date/Time strings
                    aResults.forEach(function (oItem) {
                        // Parse IncidentDate
                        if (oItem.IncidentDate && typeof oItem.IncidentDate === "string" && oItem.IncidentDate.indexOf("/Date(") === 0) {
                            var sTimestamp = oItem.IncidentDate.replace(/\/Date\((-?\d+)\)\//, "$1");
                            oItem.IncidentDate = new Date(parseInt(sTimestamp, 10));
                        }
                        // Parse CompletionDate
                        if (oItem.CompletionDate && typeof oItem.CompletionDate === "string" && oItem.CompletionDate.indexOf("/Date(") === 0) {
                            var sTimestamp = oItem.CompletionDate.replace(/\/Date\((-?\d+)\)\//, "$1");
                            oItem.CompletionDate = new Date(parseInt(sTimestamp, 10));
                        }
                        // Parse IncidentTime (Edm.Time usually comes as object {ms: ...} or PT string in V2)
                        // This uses a flexible approach: if it has 'ms', use that; if it acts like a PT string, try to parse
                        if (oItem.IncidentTime) {
                            if (oItem.IncidentTime.ms) {
                                oItem.IncidentTime = new Date(oItem.IncidentTime.ms);
                            } else if (typeof oItem.IncidentTime === "string") {
                                // Try to handle PT format simple case or assuming standard ISO if somehow converted
                                // For simplicity/robustness in V2 JSON, manual handling is tricky. 
                                // Mapping directly if it is "PT..." might confuse sap.ui.model.type.Time
                                // Let's try to dummy create a date if possible, otherwise leave it found.
                                // Common V2 JSON for time is { __metadata: ..., ms: 1234 }
                                // If plain string, might be ISO.
                            }
                        }
                    });

                    oIncidentModel.setData({ results: aResults });
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    oView.setBusy(false);
                    MessageBox.error("Failed to load incidents from SAP backend.");
                }
            });
        },

        onNavBack: function () {
            var oHistory = History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                this.getOwnerComponent().getRouter().navTo("Dashboard", {}, true);
            }
        }
    });
});

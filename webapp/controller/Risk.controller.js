sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox"
], function (Controller, History, Filter, FilterOperator, JSONModel, MessageBox) {
    "use strict";

    return Controller.extend("ehsm.controller.Risk", {
        onInit: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("Risk").attachPatternMatched(this._onObjectMatched, this);

            // Create a local JSON model for the table to avoid OData Key duplication issues
            var oRiskModel = new JSONModel();
            this.getView().setModel(oRiskModel, "risk");
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
            var oRiskModel = oView.getModel("risk");

            // Bypass ODataModel read because Backend metadata has incorrect Keys (EmployeeId only),
            // causing ODataModel to de-duplicate rows incorrectly.
            var sServiceUrl = oModel.sServiceUrl;
            // Handle trailing slash
            if (!sServiceUrl.endsWith("/")) {
                sServiceUrl += "/";
            }
            var sUrl = sServiceUrl + "ZEHSM_RISKSet";

            oView.setBusy(true);

            // Using jQuery AJAX to fetch raw JSON without ODataModel normalization
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
                    // OData V2 standard response structure: { d: { results: [...] } }
                    var aResults = (oData && oData.d && oData.d.results) ? oData.d.results : [];

                    // Manually parse OData Date strings "/Date(...)/" to JS Dates
                    aResults.forEach(function (oItem) {
                        if (oItem.RiskIdentificationDate && typeof oItem.RiskIdentificationDate === "string" && oItem.RiskIdentificationDate.indexOf("/Date(") === 0) {
                            var sTimestamp = oItem.RiskIdentificationDate.replace(/\/Date\((-?\d+)\)\//, "$1");
                            oItem.RiskIdentificationDate = new Date(parseInt(sTimestamp, 10));
                        }
                    });

                    oRiskModel.setData({ results: aResults });
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    oView.setBusy(false);
                    MessageBox.error("Failed to load data from SAP backend.");
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

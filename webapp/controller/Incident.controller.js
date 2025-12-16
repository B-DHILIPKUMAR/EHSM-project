sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (Controller, History, Filter, FilterOperator) {
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
        },

        _onObjectMatched: function () {
            var sEmployeeId = this.getOwnerComponent().getModel("session").getProperty("/EmployeeId");
            var oTable = this.byId("incidentTable");
            var oBinding = oTable.getBinding("items");

            if (sEmployeeId) {
                var oFilter = new Filter("EmployeeId", FilterOperator.EQ, sEmployeeId);
                oBinding.filter([oFilter]);
            } else {
                this.getOwnerComponent().getRouter().navTo("Login");
            }
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

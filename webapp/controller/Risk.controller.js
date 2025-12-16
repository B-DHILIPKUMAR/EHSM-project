sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (Controller, History, Filter, FilterOperator) {
    "use strict";

    return Controller.extend("ehsm.controller.Risk", {
        onInit: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("Risk").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function () {
            var sEmployeeId = this.getOwnerComponent().getModel("session").getProperty("/EmployeeId");
            var oTable = this.byId("riskTable");
            var oBinding = oTable.getBinding("items");

            if (sEmployeeId) {
                var oFilter = new Filter("EmployeeId", FilterOperator.EQ, sEmployeeId);
                oBinding.filter([oFilter]);
            } else {
                // Handle case where user refreshes page and session is lost -> redirect to login (optional, but good practice)
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

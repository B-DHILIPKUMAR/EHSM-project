sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox"
], function (Controller, MessageBox) {
    "use strict";

    return Controller.extend("ehsm.controller.Dashboard", {
        onPressRisk: function () {
            this.getOwnerComponent().getRouter().navTo("Risk");
        },

        onPressIncident: function () {
            this.getOwnerComponent().getRouter().navTo("Incident");
        },

        onLogout: function () {
            MessageBox.confirm("Are you sure you want to logout?", {
                onClose: function (oAction) {
                    if (oAction === MessageBox.Action.OK) {
                        // Clear session
                        this.getOwnerComponent().getModel("session").setData({ EmployeeId: "" });
                        // Nav to Login
                        this.getOwnerComponent().getRouter().navTo("Login");
                    }
                }.bind(this)
            });
        }
    });
});

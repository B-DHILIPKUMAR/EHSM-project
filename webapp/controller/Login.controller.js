sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel"
], function (Controller, MessageToast, MessageBox, JSONModel) {
    "use strict";

    return Controller.extend("ehsm.controller.Login", {
        onInit: function () {
            // Local model for login form
            var oLoginModel = new JSONModel({
                EmployeeId: "",
                Password: ""
            });
            this.getView().setModel(oLoginModel);
        },

        onLogin: function () {
            var oLoginData = this.getView().getModel().getData();
            var sEmployeeId = oLoginData.EmployeeId;
            var sPassword = oLoginData.Password;

            if (!sEmployeeId || !sPassword) {
                MessageToast.show("Please enter both Employee ID and Password.");
                return;
            }

            var oModel = this.getOwnerComponent().getModel();
            var sPath = "/ZEHSM_LOGINSet(EmployeeId='" + sEmployeeId + "',Password='" + sPassword + "')";

            // Show busy indicator
            sap.ui.core.BusyIndicator.show();

            oModel.read(sPath, {
                success: function (oData) {
                    sap.ui.core.BusyIndicator.hide();
                    if (oData.Status === "Success") {
                        MessageToast.show("Login Successful");
                        // Store EmployeeId in session model
                        this.getOwnerComponent().getModel("session").setProperty("/EmployeeId", sEmployeeId);
                        // Navigate to Dashboard
                        this.getOwnerComponent().getRouter().navTo("Dashboard");
                    } else {
                        MessageBox.error("Authentication failed. Please check your credentials.");
                    }
                }.bind(this),
                error: function (oError) {
                    sap.ui.core.BusyIndicator.hide();
                    MessageBox.error("Login service failed. Please try again later.");
                }
            });
        }
    });
});

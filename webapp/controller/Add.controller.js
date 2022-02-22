sap.ui.define([
    'tcs/fin/payroll/controller/BaseController',
    'sap/ui/model/json/JSONModel',
    'sap/m/MessageToast',
    'sap/m/MessageBox',
    'sap/ui/core/Fragment'
], function(BaseController, JSONModel, MessageToast, MessageBox, Fragment) {
    'use strict';
    return BaseController.extend("tcs.fin.payroll.controller.Add",{
        onInit: function(){
            this.oLocalData = new JSONModel();
            this.oLocalData.setData({
                "productData": {
                "PRODUCT_ID" : "",
                "TYPE_CODE" : "PR",
                "CATEGORY" : "Notebooks",
                "NAME" : "",
                "DESCRIPTION" : "",
                "SUPPLIER_ID" : "0100000051",
                "SUPPLIER_NAME" : "TECUM",
                "TAX_TARIF_CODE" : "1 ",
                "MEASURE_UNIT" : "EA",
                "WEIGHT_MEASURE" : "4.300 ",
                "WEIGHT_UNIT" : "KG",
                "PRICE" : "0.00",
                "CURRENCY_CODE" : "USD",
                "DIM_UNIT" : "CM"
                }
                });
            this.getView().setModel(this.oLocalData, "local");
        },
        mode: "create",
        onEnter: function(oEvent){
            //Step 1: Read the value of product ID entered by user
            var val = oEvent.getParameter("value");
            //Step 2: Get Odata Model object
            var oDataModel = this.getView().getModel();
            //Step 3: Call the Read function of OData to get Single Record
            var that = this;
            this.getView().setBusy(true);
            oDataModel.read("/ProductSet('" + val + "')",{
                success: function(data){
                    //Step 4: success Callback- set data to local model
                    that.oLocalData.setProperty("/productData", data);
                    that.getView().setBusy(false);
                    that.mode = "update";
                    that.getView().byId("idSave").setText("Update");
                },
                error: function(oError){
                    //Step 5: error Callback - handle error
                    debugger;
                    MessageBox.error(JSON.parse(oError.responseText).error.innererror.errordetails[0].message);
                    that.getView().setBusy(false);
                    that.mode = "create";
                    that.getView().byId("idSave").setText("Save");
                }
            });
            

        },
        onClear: function(){
            this.oLocalData.setData({
                "productData": {
                "PRODUCT_ID" : "",
                "TYPE_CODE" : "PR",
                "CATEGORY" : "Notebooks",
                "NAME" : "",
                "DESCRIPTION" : "",
                "SUPPLIER_ID" : "0100000051",
                "SUPPLIER_NAME" : "TECUM",
                "TAX_TARIF_CODE" : "1 ",
                "MEASURE_UNIT" : "EA",
                "WEIGHT_MEASURE" : "4.300 ",
                "WEIGHT_UNIT" : "KG",
                "PRICE" : "0.00",
                "CURRENCY_CODE" : "USD",
                "DIM_UNIT" : "CM"
                }
                });
            this.getView().byId("idSave").setText("Create");
            this.mode = "create";
            this.getView().byId("idSuppname").setText("");
        },
        onDelete: function(oEvent){

            MessageBox.confirm("Do you really want to do this to me :( ?",{
                onClose: this._deleteProduct.bind(this)
            });

        },
        onMostExpensive: function(){
            var oDataModel = this.getView().getModel();
            var that = this;
            that.getView().setBusy(true);
            oDataModel.callFunction("/GetMostExpensiveProduct",{
                urlParameters:{
                    "I_CATEGORY": "Notebooks"
                },
                success: function(data){
                    that.oLocalData.setProperty("/productData", data);
                    that.getView().setBusy(false);
                    that.mode = "update";
                    that.getView().byId("idSave").setText("Update");
                }
            });
        },
        supplierPopup: null,
        oField: null,
        onConfirmPopup: function(oEvent){
            var sId = oEvent.getSource().getId();
            //Step 1: get the selected Item by user
            var oSelectedItem = oEvent.getParameter("selectedItem");
            //Step 2: get the value of selected data
            var sLabel = oSelectedItem.getLabel();
            //Step 3: Set the value in the same fields INSIDE the table where F4 was presssed
            this.oField.setValue(sLabel);
            this.getView().byId("idSuppname").setText(oSelectedItem.getValue());
        },

        onSupplierF4: function(oEvent){
            this.oField = oEvent.getSource();
            var that = this;
            //just like we check lo_alv IS NOT BOUND
            if(this.supplierPopup === null){
                Fragment
                .load({
                    id: "supplier",
                    name: "tcs.fin.payroll.fragments.popup",
                    controller: this
                })
                .then(function(oDialog){
                    //in the callback function, we will not be getting access to THIS pointer
                    //As Controller object, we need a local variable that where we assign this
                    //we can have the access of local variable inside the call back
                    that.supplierPopup = oDialog;
                    //Use the remote control of the popup to set data and title
                    that.supplierPopup.setTitle("Select Supplier");
                    //allow access to model by view -immune system allowing parasite to access
                    that.getView().addDependent(that.supplierPopup);
                    //MultiSelect
                    that.supplierPopup.setMultiSelect(false);
                    //Syntax no. 4 which we learnt in past for aggregation binding
                    that.supplierPopup.bindAggregation("items",{
                        path: '/SupplierSet',
                        template: new sap.m.DisplayListItem({
                            label: "{BP_ID}",
                            value: "{COMPANY_NAME}"
                        })
                    });
                    that.supplierPopup.open();
                });
            }else{
                this.supplierPopup.open();
            }

        },
        _deleteProduct: function(status){
            if(status === "OK"){
                var productId = this.getView().byId("PID").getValue();
                //Step 2: get the odata model object (default)
                var oDataModel = this.getView().getModel();
                var that = this;
                oDataModel.remove("/ProductSet('" + productId + "')",{
                    success: function(){
                        MessageToast.show("OMG You hurt me");
                        that.onClear();
                    },
                    error: function(){
                        MessageToast.show("I love you, you saved me");
                        that.onClear();
                    }
                });
            }
        },
        onSave: function(){
            //Step 1: Prepare payload to send
            var payload = this.oLocalData.getProperty("/productData");

            //Step 2: get the odata model object (default)
            var oDataModel = this.getView().getModel();

            //Step 3: Fire a POST Request - .create
            if(this.mode === "update"){
                oDataModel.update("/ProductSet('" + payload.PRODUCT_ID + "')", payload, {
                    success: function(){
                        MessageToast.show("Wow!! Update was success Amigo");
                    },
                    error: function(oError){
                        MessageBox.error(JSON.parse(oError.responseText).error.innererror.errordetails[0].message);
                    }
                });
            }else{
                oDataModel.create("/ProductSet", payload, {
                    success: function(){
                        MessageToast.show("Wow!! You made it Amigo");
                    },
                    error: function(oError){
                        MessageBox.error(JSON.parse(oError.responseText).error.innererror.errordetails[0].message);
                    }
                });
            }

        }

    });
});
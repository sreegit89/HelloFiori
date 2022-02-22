sap.ui.define([
    'tcs/fin/payroll/controller/BaseController',
    'sap/m/MessageBox',
    'sap/m/MessageToast',
    'sap/ui/core/Fragment',
    'sap/ui/model/Filter',
    'sap/ui/model/FilterOperator'
], function(BaseController,MessageBox,MessageToast, Fragment,Filter,FilterOperator) {
    'use strict';
    return BaseController.extend("tcs.fin.payroll.controller.View2",{
        onInit: function(){
            //get the router object
            this.oRouter = this.getOwnerComponent().getRouter();
            //use the router object to tell router, i want to call a function
            //whenever route changes, route can change because
            //1. when i click an item on left
            //2. when user press browser navigation btns
            //3. user can manually change route
            //hey my Router, whenever route change call a method herculis
            this.oRouter.getRoute("detail").attachMatched(this.herculis, this);
            //this.oRouter.attachRouteMatched(this.herculis, this);
        },
        onItemPress: function(oEvent){
            MessageBox.confirm("I confirm to ANubhav that i will implement the 3rd view" +
            "and navigate to the supplier details on weekend");
        },
        onConfirmPopup: function(oEvent){
            var sId = oEvent.getSource().getId();
            if(sId.indexOf("city") !== -1){
                //Step 1: get the selected Item by user
                var oSelectedItem = oEvent.getParameter("selectedItem");
                //Step 2: get the value of selected data
                var sLabel = oSelectedItem.getLabel();
                //Step 3: Set the value in the same fields INSIDE the table where F4 was presssed
                this.oField.setValue(sLabel);
            }else{
                //Step 1: get the selected Item by user
                var aSelectedItem = oEvent.getParameter("selectedItems");
                var aFilter = [];
                for (let i = 0; i < aSelectedItem.length; i++) {
                    const element = aSelectedItem[i];
                    var sText = element.getLabel();
                    var oFilterCondition = new Filter("name", FilterOperator.EQ, sText);
                    aFilter.push(oFilterCondition);
                }
                var oFilter = new Filter({
                    filters: aFilter,
                    and: false
                });
                this.getView().byId("idTable").getBinding("items").filter(oFilter);
            }
            
        },
        cityPopup: null,
        oField: null,
        onF4Help: function (oEvent) {
            this.oField = oEvent.getSource();
            var that = this;
            //just like we check lo_alv IS NOT BOUND
            if(this.cityPopup === null){
                Fragment
                .load({
                    id: "city",
                    name: "tcs.fin.payroll.fragments.popup",
                    controller: this
                })
                .then(function(oDialog){
                    //in the callback function, we will not be getting access to THIS pointer
                    //As Controller object, we need a loc   al variable that where we assign this
                    //we can have the access of local variable inside the call back
                    that.cityPopup = oDialog;
                    //Use the remote control of the popup to set data and title
                    that.cityPopup.setTitle("Cities");
                    //allow access to model by view -immune system allowing parasite to access
                    that.getView().addDependent(that.cityPopup);
                    //MultiSelect
                    that.cityPopup.setMultiSelect(false);
                    //Syntax no. 4 which we learnt in past for aggregation binding
                    that.cityPopup.bindAggregation("items",{
                        path: '/cities',
                        template: new sap.m.DisplayListItem({
                            label: "{name}",
                            value: "{famousFor}"
                        })
                    });
                    that.cityPopup.open();
                });
            }else{
                this.cityPopup.open();
            }

            //MessageBox.confirm("we clicked on " + sId + " this functionality is under construction, please check later");
        },
        oSupplierPopup: null,
        onFilter: function (oEvent) {
            var that = this;
            //just like we check lo_alv IS NOT BOUND
            if(this.oSupplierPopup === null){
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
                    that.oSupplierPopup = oDialog;
                    //Use the remote control of the popup to set data and title
                    that.oSupplierPopup.setTitle("Supplier");
                    //allow access to model by view -immune system allowing parasite to access
                    that.getView().addDependent(that.oSupplierPopup);
                    //Syntax no. 4 which we learnt in past for aggregation binding
                    that.oSupplierPopup.bindAggregation("items",{
                        path: '/suppliers',
                        template: new sap.m.DisplayListItem({
                            label: "{name}",
                            value: "{sinceWhen}"
                        })
                    });
                    that.oSupplierPopup.open();
                });
            }else{
                this.oSupplierPopup.open();
            }
        },
        herculis: function(oEvent){

            //now the route changed

            //Step 1: what is fruit id selected by user

            var sIndex = oEvent.getParameter("arguments").fruitId;

            //step 2: construct the path for element binding

            var sPath = '/' + sIndex;

            //Step 3: perform the element binding with current view

            this.getView().bindElement(sPath);

        },
        onSave: function () {
            MessageBox.confirm("Would like to save?",{
                title: "Confirmation",
                onClose: this.onCloseMsg
            });
        },
        onCloseMsg : function(status){
            if(status === "OK"){
                MessageToast.show("The sales order XXXX has been created successfully!");
            }else{
                MessageBox.error("Action was cancelled");
            }
        },
        onBack: function(){
            this.getView().getParent().to("idView1");
        }
    });
});
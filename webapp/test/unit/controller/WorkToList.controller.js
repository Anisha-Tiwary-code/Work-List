/*global QUnit*/

sap.ui.define([
	"comreckitt/zpe_worklist/controller/WorkToList.controller"
], function (Controller) {
	"use strict";

	QUnit.module("WorkToList Controller");

	QUnit.test("I should test the WorkToList controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});

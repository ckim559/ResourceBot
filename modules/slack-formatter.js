"use strict";

let color = "#009cdb";

let formatCase = _case => {

    let fields = [];
	fields.push({title: "Case Subject:", value: _case.get("Subject"), short: false});
    fields.push({title: "Case URL:", value: 'https://login.salesforce.com/' + _case.get("id"), short: false});
    return [{color: color, fields: fields}];

};

let formatOpenCases = cases => {

    if (cases && cases.length>0) {
        let attachments = [];
		color = "#009cdb";
        cases.forEach(_case => {
            let fields = [];
            fields.push({title: "Case Subject:", value: _case.get("Subject"), short: true});
			fields.push({title: "Case Number:", value: _case.get("CaseNumber"), short: true});
			fields.push({title: "Case Status:", value: _case.get("Status"), short: true});
			fields.push({title: "Assignment Due Date:", value: _case.get("Resource_Assignment_Due_Date__c"), short: true});
			fields.push({title: "Project Target Start Date:", value: _case.get("Project_Target_Start_Date__c"), short: true});
			fields.push({title: "Project Target Life Date:", value: _case.get("Project_Target_Live_Date__c"), short: true});
			fields.push({title: "Project Description:", value: _case.get("Description"), short: false});
			fields.push({title: "Project Scope:", value: _case.get("Project_Scope__c"), short: false});
			fields.push({title: "Estimated Hours:", value: _case.get("Estimated_Hours__c,"), short: false});
			fields.push({title: "Project Manager Required?", value: _case.get("PJM_Req__c"), short: true});
			fields.push({title: "Account Manager Required?:", value: _case.get("AM_Req__c"), short: true});
			fields.push({title: "Solutions Engineer Required?:", value: _case.get("SE_Req__c"), short: true});
			fields.push({title: "Advisory Services Required?:", value: _case.get("AS_Req__c"), short: true});
			fields.push({title: "Case URL:", value: 'https://login.salesforce.com/' + _case.get("id"), short: false});
			fields.push({title: "Created By:", value: _case.get("Submitted_By__c"), short: false});
            attachments.push({color: color, fields: fields});
        });
        return attachments;
    } else {
        return [{text: "No records"}];
    }

};

let formatClosedCases = cases => {

    if (cases && cases.length>0) {
        let attachments = [];
		color = "#009cdb";
        cases.forEach(_case => {
            let fields = [];
            fields.push({title: "Case Subject:", value: _case.get("Subject"), short: true});
			fields.push({title: "Case Number:", value: _case.get("CaseNumber"), short: true});
			fields.push({title: "Case Status:", value: _case.get("Status"), short: true});
			fields.push({title: "Assignment Due Date:", value: _case.get("Resource_Assignment_Due_Date__c"), short: true});
			fields.push({title: "Project Target Start Date:", value: _case.get("Project_Target_Start_Date__c"), short: true});
			fields.push({title: "Project Target Life Date:", value: _case.get("Project_Target_Live_Date__c"), short: true});
			fields.push({title: "Project Description:", value: _case.get("Description"), short: false});
			fields.push({title: "Project Scope:", value: _case.get("Project_Scope__c"), short: false});
			fields.push({title: "Estimated Hours:", value: _case.get("Estimated_Hours__c,"), short: false});
			fields.push({title: "Project Manager:", value: _case.get("Project_Manager_Assigned__c"), short: true});
			fields.push({title: "Account Manager:", value: _case.get("Account_Manager_Assigned__c"), short: true});
			fields.push({title: "Solutions Engineer(s):", value: _case.get("SE_assigned_to_GTM_Project__c"), short: true});
			fields.push({title: "AS Resources:", value: _case.get("AS_Assignments__c"), short: true});
			fields.push({title: "Case URL:", value: 'https://login.salesforce.com/' + _case.get("id"), short: false});
			fields.push({title: "Created By:", value: _case.get("Submitted_By__c"), short: false});
            attachments.push({color: color, fields: fields});
        });
        return attachments;
    } else {
        return [{text: "No records"}];
    }

};

exports.formatOpenCases = formatOpenCases;
exports.formatClosedCases = formatClosedCases;
exports.formatCase = formatCase;

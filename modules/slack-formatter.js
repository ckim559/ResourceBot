"use strict";

let color = "#009cdb";

let formatShoutouts = shoutouts => {
	

    if (shoutouts && shoutouts.length>0) {

        let attachments = [{
		color: "#009cdb", fallback: "Vote!"
		}];
        shoutouts.forEach(Services_Shoutout__c => {
            let fields = [];
            fields.push({title: 'Shoutout #' + Services_Shoutout__c.get("Request_Number__c") +":", value: "", short: true});
			fields.push({value: Services_Shoutout__c.get("Shoutout__c") , short: false});
            attachments.push({color: color, fields: fields});
        });
        return attachments;
    } else {
        return [{text: "No records"}];
    }

};

let formatWeeks = weeks => {
	
	color = "#dbad00";

    if (weeks && weeks.length>0) {

        let attachments = [];
		color = "#009cdb";
        weeks.forEach(Shoutout_Week__c => {
            let fields = [];
            fields.push({value: Shoutout_Week__c.get("ID"), short: true});
			fields.push({value: Shoutout_Week__c.get("Name") , short: false});
            attachments.push({color: color, fields: fields});
        });
        return attachments;
    } else {
        return [{text: "No records"}];
    }

};

exports.formatShoutouts = formatShoutouts;
exports.formatWeeks = formatWeeks;

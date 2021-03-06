"use strict";

const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN;

let Botkit = require('botkit'),
    formatter = require('./modules/slack-formatter'),
    salesforce = require('./modules/salesforce'),
	moment = require('moment'),
    controller = Botkit.slackbot(),

    bot = controller.spawn({
        token: SLACK_BOT_TOKEN
    });

bot.startRTM(err => {
    if (err) {
        throw new Error('Could not connect to Slack');
    }
});



controller.hears(['hello', 'hi', 'hey', 'greetings', 'help'], 'direct_message,direct_mention,mention', (bot, message) => {
	
    bot.api.users.info({user: message.user}, function(err, info){
	let first = info.user.profile.first_name
	let last = info.user.profile.last_name
	
	
	bot.reply(message, {
        text: `Hello ` + first + `, I'm Resourcingbot! \n -To create a resource request in Salesforce, please type "Create Case". \n -To search for cases you can ask me things like "Find my open cases", "Find my closed cases", "Find case number 8827", "Find case subject GTM", "Find case owner `+ first + ` ` + last +  `" or type "Case Search".`
    });
	});
});


controller.hears(['Find my open cases'], 'direct_message,direct_mention,mention', (bot, message) => {
	
	bot.api.users.info({user: message.user}, function(err, info){
    let email = info.user.profile.email
	let name = info.user.profile.first_name + " " + info.user.profile.last_name
	
    salesforce.findmyopencases(email)
        .then(cases => bot.reply(message, {
            text: "I found these open cases created by " + name + ":",
            attachments: formatter.formatOpenCases(cases)
        }))
        .catch(error => bot.reply(message, error));
	})	

});

controller.hears(['find case number (.*)', 'case number (.*)'], 'direct_message,direct_mention,mention', (bot, message) => {

    let casenumber = message.match[1];
    salesforce.findcasenumber(casenumber)
        .then(cases => bot.reply(message, {
            text: "I found this case matching number '" + casenumber + "':",
            attachments: formatter.formatClosedCases(cases)
        }))
        .catch(error => bot.reply(message, error));

});

controller.hears(['find case subject (.*)', 'case subject (.*)'], 'direct_message,direct_mention,mention', (bot, message) => {

    let criteria = message.match[1];
    salesforce.findcasesubject(criteria)
        .then(cases => bot.reply(message, {
            text: "I found these cases matching subject '" + criteria + "':",
            attachments: formatter.formatClosedCases(cases)
        }))
        .catch(error => bot.reply(message, error));

});

controller.hears(['find case owner (.*)', 'case owner (.*)'], 'direct_message,direct_mention,mention', (bot, message) => {

    let criteria = message.match[1];
    salesforce.findcaseowner(criteria)
        .then(cases => bot.reply(message, {
            text: "I found these cases owned by '" + criteria + "':",
            attachments: formatter.formatClosedCases(cases)
        }))
        .catch(error => bot.reply(message, error));

});


controller.hears(['Find my closed cases'], 'direct_message,direct_mention,mention', (bot, message) => {
	
	bot.api.users.info({user: message.user}, function(err, info){
    let email = info.user.profile.email
	let name = info.user.profile.first_name + " " + info.user.profile.last_name
	
    salesforce.findmyclosedcases(email)
        .then(cases => bot.reply(message, {
            text: "I found these closed cases created by " + name + ":",
            attachments: formatter.formatClosedCases(cases)
        }))
        .catch(error => bot.reply(message, error));
	})	

});

controller.hears(['case search'], 'direct_message,direct_mention,mention', (bot, message) => {
	
	let search,
		criteria;

    let askSearch = (response, convo) => {

    convo.ask("*What is the search criteria?*"+ "\n" + "1. Creator" + "\n" + "2. Case Number" + "\n" + "3. Case Subject" + "\n" + "4. Cancel", (response, convo) => {
        search = response.text;
			
		if(search.toUpperCase() == 'CREATOR' || search.toUpperCase() == '1. CREATOR' || search == '1' || search == '1.')
		{
			askCreator(response, convo);
			convo.next();
		}
		else if(search.toUpperCase() == 'CASE NUMBER' || search.toUpperCase() == '2. CASE NUMBER' || search == '2' || search == '2.')
		{
			askCNumber(response, convo);
			convo.next();
		}
		else if(search.toUpperCase() == 'CASE SUBJECT' || search.toUpperCase() == '3. CASE SUBJECT' || search == '3' || search == '3.')
		{
			askCSubject(response, convo);
			convo.next();
		}
		else if(search.toUpperCase() == 'CANCEL' || search.toUpperCase() == '4. CANCEL' || search == '4' || search == '4.')
		{
			bot.reply(message, `No worries! If you change your mind, type "case search" to try again.`);
			convo.next();
		}
		else
		{
			bot.reply(message, {
				text: `Sorry that is not a valid option. Please try again`
			});
				askSearch(response, convo);
				convo.next();
		}
		
		});

    }; 
		
		let askCreator = (response, convo) => {
			convo.ask("*Please type in the case creator's name:*", (response, convo) => {
			criteria = response.text;
		
		 salesforce.findcaseowner(criteria)
        .then(cases => bot.reply(message, {
            text: "I found these cases created by '" + criteria + "':",
            attachments: formatter.formatClosedCases(cases)
        }))
        .catch(error => bot.reply(message, error));
		convo.next();
		
		});
		};
		
		let askCNumber = (response, convo) => {
			convo.ask("*Please type in the case number:*", (response, convo) => {
			criteria = response.text;
		
		 salesforce.findcasenumber(criteria)
        .then(cases => bot.reply(message, {
            text: "I found this case matching number '" + criteria + "':",
            attachments: formatter.formatClosedCases(cases)
        }))
        .catch(error => bot.reply(message, error));
		convo.next();
		
		});
		};
		
		let askCSubject = (response, convo) => {
			convo.ask("*Please type in the case subject:*", (response, convo) => {
			criteria = response.text;
		
		 salesforce.findcasesubject(criteria)
        .then(cases => bot.reply(message, {
            text: "I found these cases matching subject '" + criteria + "':",
            attachments: formatter.formatClosedCases(cases)
        }))
        .catch(error => bot.reply(message, error));
		convo.next();
		
		});
		};
		
		
		
	bot.reply(message, "OK, I can help you with that!");
    bot.startConversation(message, askSearch);

});


controller.hears(['create case', 'new case'], 'direct_message,direct_mention,mention', (bot, message) => {

    let subject,
		scope,
        description,
		date,
		hours,
		start,
		live,
		PJM,
		PJM2,
		search,
		AM2,
		SE,
		SE2,
		AS,
		AS2,
		edit,
		finalize,
		complete,
		retry;
		
		moment().format();
		
	bot.api.users.info({user: message.user}, function(err, info){
    let email = info.user.profile.email
	let name = info.user.profile.first_name + " " + info.user.profile.last_name
	

   let askSubject = (response, convo) => {

        convo.ask("*What is the subject?*", (response, convo) => {
            subject = response.text;
			
			if(subject.toUpperCase() == '!CANCEL')
			{
				askRetry(response, convo);
				convo.next();
			}
			else
			{
				if(complete == '1')
				{
					askFinalize(response, convo);
					convo.next();
				}
				else
				{
					askDate(response, convo);
					convo.next();
				}
			}	
			
        });

    }; 
	
	let askDate = (response, convo) => {

        convo.ask("*When are the assignments due?* (Please format the date as YYYY-MM-DD)", (response, convo) => {
            date = response.text;
			var today = moment();
			var re = /^\d{4}-\d{2}-\d{2}$/
			
			if(date.toUpperCase() == '!CANCEL')
			{
				askRetry(response, convo);
				convo.next();
			}
			else
			{
	
	if(moment(date, "YYYY-MM-DD").isValid())
		{
		if(re.test(date))
		{
			if(moment(date).isSame(today, 'day') || moment(date).isBefore(today, 'day') )
			{
				bot.reply(message, {
				text: "Date value must be in the future, please try again"
				});
				askDate(response, convo);
				convo.next();
			}
			else if(moment(date).isAfter(start, 'day') && complete == '1')
			{
				bot.reply(message, {
				text: "Assignment due date value must be before the Projected Project Start Date (" + start + "), please try again"
				});
				askDate(response, convo);
				convo.next();
			}
			else
			{
				if(complete == '1')
				{
					askFinalize(response, convo);
					convo.next();
				}
				else
				{
					askStart(response, convo);
					convo.next();
				}
			}
			}
			else
			{
				bot.reply(message, {
				text: `Invalid date format, please try again`
			});
				askDate(response, convo);
				convo.next();
			}	
		}
		else
		{
			bot.reply(message, {
				text: `Invalid date format, please try again`
			});
				askDate(response, convo);
				convo.next();
		}
            }
		});
    }; 
	
	let askStart = (response, convo) => {

        convo.ask("*What is the project target start date?* (Please format the date as YYYY-MM-DD)", (response, convo) => {
            start = response.text;
			var today = moment();
			var re = /^\d{4}-\d{2}-\d{2}$/
			
			if(start.toUpperCase() == '!CANCEL')
			{
				askRetry(response, convo);
				convo.next();
			}
			else
			{
	
	if(moment(start, "YYYY-MM-DD").isValid())
		{
		if(re.test(start))
		{
			if(moment(start).isSame(today, 'day') || moment(start).isBefore(today, 'day') )
			{
				bot.reply(message, {
				text: "Date value must be in the future, please try again"
				});
				askStart(response, convo);
				convo.next();
			}
			else if(moment(start).isBefore(date, 'day'))
			{
				bot.reply(message, {
				text: "Target Start Date value must be after the Assignment Due Date (" + date + ") , please try again"
				});
				askStart(response, convo);
				convo.next();
			}
			else if(complete == '1' && moment(start).isAfter(live, 'day'))
			{
				bot.reply(message, {
				text: "Target Start Date value must be before the Project Live Date (" + live + ") , please try again"
				});
				askStart(response, convo);
				convo.next();
			}
			else
			{
				if(complete == '1')
				{
					askFinalize(response, convo);
					convo.next();
				}
				else
				{
					askLive(response, convo);
					convo.next();
				}
			}
			}
		else
		{
			bot.reply(message, {
			text: `Invalid date format, please try again`
			});
			askStart(response, convo);
			convo.next();
		}	
		}
	else
	{
		bot.reply(message, {
		text: `Invalid date format, please try again`
		});
		askStart(response, convo);
		convo.next();
		}
        }
		});
    }; 
	

	let askLive = (response, convo) => {

        convo.ask("*What is the project target live (project end) date?* (Please format the date as YYYY-MM-DD)", (response, convo) => {
            live = response.text;
			var today = moment();
			var re = /^\d{4}-\d{2}-\d{2}$/
			
			if(live.toUpperCase() == '!CANCEL')
			{
				askRetry(response, convo);
				convo.next();
			}
			else
			{
	
	if(moment(live, "YYYY-MM-DD").isValid())
		{
		if(re.test(live))
		{
			if(moment(live).isSame(today, 'day') || moment(live).isBefore(today, 'day') )
			{
				bot.reply(message, {
				text: "Date value must be in the future, please try again"
				});
				askLive(response, convo);
				convo.next();
			}
			else if(moment(live).isBefore(start, 'day'))
			{
				bot.reply(message, {
				text: "Target Live Date value must be after the Target Start Date (" + start + ") , please try again"
				});
				askLive(response, convo);
				convo.next();
			}
			else
			{
				if(complete == '1')
				{
					askFinalize(response, convo);
					convo.next();
				}
				else
				{
					askHours(response, convo);
					convo.next();
				}
			}
		}
		else
		{
			bot.reply(message, {
			text: `Invalid date format, please try again`
			});
			askLive(response, convo);
			convo.next();
		}	
		}
		else
		{
			bot.reply(message, {
				text: `Invalid date format, please try again`
			});
				askLive(response, convo);
				convo.next();
		}
            }
		});
    }; 
	
	
	
    let askHours = (response, convo) => {
		
		convo.ask("*What is the estimated amount of hours for this project?* (Please enter numerical values only)", (response, convo) => {
            hours = response.text;
			
			if(hours.toUpperCase() == '!CANCEL')
			{
				askRetry(response, convo);
				convo.next();
			}
			else
			{
				if(isNaN(hours))
				{
				   bot.reply(message, "Invalid format, please enter a valid number");
 				   askHours(response, convo);
				   convo.next();	
				}
				else
				{
					if(complete == '1')
					{	
						askFinalize(response, convo);
						convo.next();
					}
					else
					{
						askPJM(response, convo);
						convo.next();
					}
				}	
			}
		});

    };
	
    let askPJM = (response, convo) => {
		

        convo.ask("*Does the project require a Project Manager?*"+ "\n" + "1. Yes" + "\n" + "2. No", (response, convo) => {
            PJM = response.text;
			if(PJM.toUpperCase() == 'YES' || PJM.toUpperCase() == '1. YES' || PJM == '1' || PJM == '1.')
				{
					PJM = 'true';
					PJM2 = 'Yes';
					if(complete == '1')
					{	
						askFinalize(response, convo);
						convo.next();
					}
					else
					{
						askAM(response, convo);
						convo.next();
					}
				}
				else if(PJM.toUpperCase() == 'NO' || PJM.toUpperCase() == '2. NO' || PJM == '2' || PJM == '2.')
				{
					PJM = 'false';
					PJM2 = 'No';
					if(complete == '1')
					{	
						askFinalize(response, convo);
						convo.next();
					}
					else
					{
						askAM(response, convo);
						convo.next();
					}
				}
				else if(PJM.toUpperCase() == "'!CANCEL'" || PJM.toUpperCase() == '!CANCEL')
				{
					askRetry(response, convo);
					convo.next();
				}
				else
				{
				   bot.reply(message, "Sorry that is not a valid option. Please try again.");
 				   askPJM(response, convo);
					convo.next();	
				}
        });

    };
	
	    let askAM = (response, convo) => {
		

        convo.ask("*Does the project require an Account Manager?*"+ "\n" + "1. Yes" + "\n" + "2. No", (response, convo) => {
            search = response.text;
			if(search.toUpperCase() == 'YES' || search.toUpperCase() == '1. YES' || search == '1' || search == '1.')
				{
					search = 'true';
					AM2 = 'Yes';
					if(complete == '1')
					{	
						askFinalize(response, convo);
						convo.next();
					}
					else
					{
					askSE(response, convo);
					convo.next();
					}
				}
				else if(search.toUpperCase() == 'NO' || search.toUpperCase() == '2. NO' || search == '2' || search == '2.')
				{
					search = 'false';
					AM2 = 'No';
					if(complete == '1')
					{	
						askFinalize(response, convo);
						convo.next();
					}
					else
					{
					askSE(response, convo);
					convo.next();
					}
				}
				else if(search.toUpperCase() == "'!CANCEL'" || search.toUpperCase() == '!CANCEL')
				{
					askRetry(response, convo);
					convo.next();
				}
				else
				{
				   bot.reply(message, "Sorry that is not a valid option. Please try again.");
 				   askAM(response, convo);
					convo.next();	
				}
        });

    };
	
	   let askSE = (response, convo) => {

        convo.ask("*Does the project require a Solutions Engineer?*"+ "\n" + "1. Yes" + "\n" + "2. No", (response, convo) => {
            SE = response.text;
			if(SE.toUpperCase() == 'YES' || SE.toUpperCase() == '1. YES' || SE == '1' || SE == '1.')
				{
					SE = 'true';
					SE2 = 'Yes';
					if(complete == '1')
					{	
						askFinalize(response, convo);
						convo.next();
					}
					else
					{
					askAS(response, convo);
					convo.next();
					}
				}
				else if(SE.toUpperCase() == 'NO' || SE.toUpperCase() == '2. NO' || SE == '2' || SE == '2.')
				{
					SE = 'false';
					SE2 = 'No';
					if(complete == '1')
					{	
						askFinalize(response, convo);
						convo.next();
					}
					else
					{
					askAS(response, convo);
					convo.next();
					}
				}
				else if(SE.toUpperCase() == "'!CANCEL'" || SE.toUpperCase() == '!CANCEL')
				{
					askRetry(response, convo);
					convo.next();
				}
				else
				{
				   bot.reply(message, "Sorry that is not a valid option. Please try again.");
 				   askSE(response, convo);
					convo.next();	
				}
			});

		};
		
	let askAS = (response, convo) => {

        convo.ask("*Does the project require Advisory Services support?*"+ "\n" + "1. Yes" + "\n" + "2. No", (response, convo) => {
            AS = response.text;
			    
				
				if(AS.toUpperCase() == 'YES' || AS.toUpperCase() == '1. YES' || AS == '1' || AS == '1.')
				{
					AS = 'true';
					AS2 = 'Yes';

						if(complete == '1')
						{	
						askFinalize(response, convo);
						convo.next();
						}
						else
						{
						askScope(response, convo);
						convo.next();
						}
				}
				
				else if(AS.toUpperCase() == 'NO' || AS.toUpperCase() == '2. NO' || AS == '2' || AS == '2.')
				{
					AS = 'false';
					AS2 = 'No';
					
					if(PJM2 == 'No' && AM2 == 'No'&& SE2 == 'No'&& AS2 == 'No')
				    { 
					 bot.reply(message, "At least one assignment type is required to create a case");
					 askPJM(response, convo);
					 convo.next();
				    }
					else
					{
						if(complete == '1')
						{	
						askFinalize(response, convo);
						convo.next();
						}
						else
						{
						askScope(response, convo);
						convo.next();
						}
					}
				}	
				else if(AS.toUpperCase() == "'!CANCEL'" || AS.toUpperCase() == '!CANCEL')
				{
					askRetry(response, convo);
					convo.next();
				}
				else
				{
				   bot.reply(message, "Sorry that is not a valid option. Please try again.");
 				   askAS(response, convo);
					convo.next();	
				}
			});

		};	

    let askScope = (response, convo) => {

        convo.ask("*What is the project's scope?* (Please define responsibilities by resource role)", (response, convo) => {
            scope = response.text;
			
			if(scope.toUpperCase() == '!CANCEL' || scope.toUpperCase() =="'!CANCEL'" )
			{
				askRetry(response, convo);
				convo.next();
			}
			else
			{
				if(complete == '1')
					{	
						askFinalize(response, convo);
						convo.next();
					}
					else
					{
						askDescription(response, convo);
						convo.next();
					}
			
			}
			});

    };
	
	
    let askDescription = (response, convo) => {

        convo.ask("*Enter a description for the case*", (response, convo) => {
            description = response.text;
			
			if(description.toUpperCase() == '!CANCEL' || description.toUpperCase() == "CANCEL" )
			{
				askRetry(response, convo);
				convo.next();
			}
			else
			{
				askFinalize(response, convo);
				convo.next();
			}	
        });

	};
	
	let askFinalize = (response, convo) => {
		
		bot.reply(message, {
				"attachments": [
				{
					"fallback": "Confirmation of submission",
					"color": "#36a64f",
					"pretext": "Please review case details below:",
					"fields": [
                {
                    "title": "Case Subject:",
                    "value": subject,
                    "short": true
                },
				{
                    "title": "Assignment Due Date:",
                    "value": date,
                    "short": true
                },
				{
                    "title": "Project Target Start Date:",
                    "value": start,
                    "short": true
                },
				{
                    "title": "Project Target Live Date:",
                    "value": live,
                    "short": true
                },
				{
                    "title": "Project Scope:",
                    "value": scope,
                    "short": false
                },
				{
                    "title": "Project Description:",
                    "value": description,
                    "short": false
                },
				{
                    "title": "Estimated hours:",
                    "value": hours,
                    "short": false
                },
				{
                    "title": "Project Manager Required?",
                    "value": PJM2,
                    "short": true
                },
				{
                    "title": "Account Manager Required?",
                    "value": AM2,
                    "short": true
                },
				{
                    "title": "Solutions Engineer Required?",
                    "value": SE2,
                    "short": true
                },
				{
                    "title": "Advisory Services Required?",
                    "value": AS2,
                    "short": true
                }
            ],
          
        }
    ]
    });			
		convo.ask('Please type *CONFIRM* to create the case, type *EDIT* to edit the case or type *CANCEL* to cancel submission', (response, convo) => {
		
            finalize = response.text;
			
			if(finalize.toUpperCase() == '!CANCEL' || finalize.toUpperCase() =="'!CANCEL'" || finalize.toUpperCase() == "CANCEL" )
			{
				askRetry(response, convo);
				convo.next();
			}
			else if(finalize.toUpperCase() == 'EDIT')
			{
				complete = '1';
				askEdit(response, convo);
				convo.next();
			}
			
			else if(finalize.toUpperCase() == 'CONFIRM')
			{	
				salesforce.createCase({subject: subject, start: start, live: live, hours: hours, description: description, scope: scope, name: name, email: email, PJM: PJM, search: search, SE: SE, AS: AS, date: date})
                .then(_case => {
                    bot.reply(message, {
                       text: "Your resourcing case has been generated:",
                        attachments: formatter.formatCase(_case)
                    });
                    convo.next();
                })
                .catch(error => {
                    bot.reply(message, error);
                    convo.next();
                });
			}
			else
			{
				bot.reply(message, "Sorry that is not a valid option. Please try again.");
 				askFinalize(response, convo);
				convo.next();	
			}
		});

	};	
	
	let askEdit = (response, convo) => {
			convo.ask(`*Which field would you like to edit?* \n 1. Subject \n 2. Assignment Due Date \n 3. Project Target Start Date \n 4. Project Target Live Date \n 5. Project Scope \n 6. Project Description \n 7. Estimated Hours \n 8. Project Manager Required? \n 9. Account Manager Required? \n 10. Solutions Engineer Required? \n 11. Advisory Services Required? \n 12. Cancel Edit`, (response, convo) => {
			edit = response.text;	
			
			if(edit.toUpperCase() == 'SUBJECT' || edit.toUpperCase() == '1. SUBJECT' || edit == '1' || edit == '1.')
			{
				askSubject(response, convo);
				convo.next();	
			}
			else if(edit.toUpperCase() == 'ASSIGNMENT DUE DATE' || edit.toUpperCase() == '2. ASSIGNMENT DUE DATE' || edit == '2' || edit == '2.')
			{
				askDate(response, convo);
				convo.next();
			}
			else if(edit.toUpperCase() == 'PROJECT TARGET START DATE' || edit.toUpperCase() == '3. PROJECT TARGET START DATE' || edit == '3' || edit == '3.')
			{
				askStart(response, convo);
				convo.next();
				
			}
			else if(edit.toUpperCase() == 'PROJECT TARGET LIVE DATE' || edit.toUpperCase() == '4. PROJECT TARGET LIVE DATE' || edit == '4' || edit == '4.')
			{
				askLive(response, convo);
				convo.next();
			}
			else if(edit.toUpperCase() == 'PROJECT SCOPE' || edit.toUpperCase() == '5. PROJECT SCOPE' || edit == '5' || edit == '5.')
			{
				askScope(response, convo);
				convo.next();
			}
			else if(edit.toUpperCase() == 'PROJECT DESCRIPTION' || edit.toUpperCase() == '6. PROJECT DESCRIPTION' || edit == '6' || edit == '6.')
			{
				askDescription(response, convo);
				convo.next();
			}
			else if(edit.toUpperCase() == 'ESTIMATED HOURS' || edit.toUpperCase() == '7. ESTIMATED HOURS' || edit == '7' || edit == '7.')
			{
				askHours(response, convo);
				convo.next();
				
			}
			else if(edit.toUpperCase() == 'PROJECT MANAGER REQUIRED?' || edit.toUpperCase() == '8. PROJECT MANAGER REQUIRED?' || edit == '8' || edit == '8.')
			{
				askPJM(response, convo);
				convo.next();
				
			}
			else if(edit.toUpperCase() == 'ACCOUNT MANAGER REQUIRED?' || edit.toUpperCase() == '9. ACCOUNT MANAGER REQUIRED?' || edit == '9' || edit == '9.')
			{
				askAM(response, convo);
				convo.next();	
			}
			else if(edit.toUpperCase() == 'SOLUTIONS ENGINEER REQUIRED?' || edit.toUpperCase() == '10. SOLUTIONS ENGINEER REQUIRED?' || edit == '10' || edit == '10.')
			{
				askSE(response, convo);
				convo.next();
			}
			else if(edit.toUpperCase() == 'ADVISORY SERVICES REQUIRED?' || edit.toUpperCase() == '11. ADVISORY SERVICES REQUIRED?' || edit == '11' || edit == '11.')
			{
				askAS(response, convo);
				convo.next();
			}
			else if(edit.toUpperCase() == 'CANCEL EDIT' || edit.toUpperCase() == '12. CANCEL EDIT' || edit == '12' || edit == '12.')
			{
				askFinalize(response, convo);
				convo.next();
			}
			else
			{
				bot.reply(message, "Sorry that is not a valid option. Please try again.");
 				askEdit(response, convo);
				convo.next();	
			}
		});	
	};
			
	let askRetry = (response, convo) => {
		
			convo.ask('Case creation cancelled.' + "\n" + "\n" + '*Would you like to create another resource case?*' + "\n" + "1. Yes" + "\n" + "2. No", (response, convo) => {
			retry = response.text;	
			if(retry.toUpperCase() == 'YES' || retry.toUpperCase() == '1. YES' || retry == '1' || retry == '1.')
				{
					bot.reply(message, "OK, I can help you with that!" + "\n"  + "*Please note:* You can cancel at any time by typing *_!cancel_*" + "\n");
					complete = '0';
					askSubject(response, convo);
					convo.next();
				}
				else if(retry.toUpperCase() == 'NO' || retry.toUpperCase() == '2. NO' || retry == '2' || retry == '2.')
				{
				   bot.reply(message, `No worries! If you change your mind, type "create case" to try again.`);
				   convo.next();
				}
				else
				{
				   bot.reply(message, "Sorry that is not a valid option. Please try again.");
 				   askRetry(response, convo);
				   convo.next();	
				}
				
			});

		};	
		

    bot.reply(message, "OK, I can help you with that!" + "\n"  + "*Please note:* You can cancel at any time by typing *_!cancel_*" + "\n");
	complete = '0';
    bot.startConversation(message, askSubject);
	
	})
 });



controller.hears(['(.*)'], 'direct_message,direct_mention,mention', (bot, message) => {
	
	bot.api.users.info({user: message.user}, function(err, info){
	let first = info.user.profile.first_name
	let last = info.user.profile.last_name
	
    bot.reply(message, {
        text: `I'm sorry, I didn't understand that. \n -To create a resource request in Salesforce, please type "Create Case". \n -To search for cases you can ask me things like "Find my open cases", "Find my closed cases", "Find case number 8827", "Find case subject GTM", "Find case owner ` + first + ` ` + last + `" or type "Case Search".`
    });
});

});

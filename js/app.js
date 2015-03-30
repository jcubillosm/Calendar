'use strict';

var app = angular.module('jsCalendar', []),
	monthNum = new Date().getMonth(), //today's month
	yearNum = new Date().getFullYear(); //today's year
	
app.controller('CalendarController', function ($scope, $compile, $location, $anchorScroll) {
	var scope = $scope,
		monthNames = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];

	this.weekDays = [{name:'Mon'}, {name:'Tue'}, {name:'Wed'}, {name:'Thu'}, {name:'Fri'}, {name:'Sat'}, {name:'Sun'}];
	scope.year = yearNum;
	scope.monthName = monthNames[(monthNum >= 12? 0 : monthNum)];
    scope.local = (localStorage.getItem('data')!==null) ? JSON.parse(localStorage.getItem('data')) : [];
    localStorage.setItem('data', JSON.stringify(scope.local));
    scope.event_ID = null;
    scope.showValidationMessages = true;
    scope.wrongDateEnd = false;        

	/*Gives functionality to "Next" and "Previous" buttons
		changing current month and year values*/
	this.setMonth = function (buttonID) {
		if(buttonID === 2){ //Increase month and/or year
			monthNum++;
			if(monthNum === 12){
				monthNum = 0;
				yearNum++;
			}
		}else{ //Decrease month and/or year
			monthNum--;
			if(monthNum < 0){
				monthNum = 11;
				yearNum--;
			}
		}
		scope.monthName = monthNames[(monthNum >= 12? 0 : monthNum)];
		scope.year = yearNum;
	};

	//This function goes to today's day, showing today's calendar month
	this.showToday = function () {
		monthNum = new Date().getMonth(); //Today's Month
		yearNum = new Date().getFullYear(); //Today's Year
		scope.monthName = monthNames[(monthNum >= 12? 0 : monthNum)];
		scope.year = yearNum;
	};

	//Function to show the event information in a div under the calendar
	scope.showEvent = function (eventID) {
		scope.clearForm();
		for(var i=0; i < $scope.local.length; i++){
			if($scope.local[i].id == eventID){
				//clean previous content
				angular.element('div#event .dateTitle').empty();
				angular.element('div#event .eventContent').empty();
				//set same background colour as event colour
				angular.element('div#event').css('background', $scope.local[i].backColor);
				//get start and end dates in dd/mm/yyyy format
				var title = $scope.local[i].text,
					startDate = $scope.local[i].start.split('-'),
					endDate = $scope.local[i].end.split('-');						
				startDate = startDate[2] + '/' + startDate[1] +'/' + startDate[0];					
				if(endDate != '')
					endDate = ' to ' + endDate[2] + '/' + endDate[1] +'/' + endDate[0];					
				//append event data + option buttons and exit the loop					
				angular.element('div#event .dateTitle').append($compile('<div class="eventButtons"><button class="btn-custom" ng-click="calendar.editEvent('+$scope.local[i].id+')">Edit</button><button class="btn-delete" ng-click="calendar.removeEvent('+$scope.local[i].id+')">Delete</button></div>')($scope));
				angular.element('div#event .dateTitle').append(title + '<br>' + startDate + endDate);
				angular.element('div#event .eventContent').append($scope.local[i].description);
				break;
			}
		}
		$scope.showEventsArea = true;
		// set the location.hash to the id of the element you wish to scroll to.
      	$location.hash('event');
      	$anchorScroll();
	};

	//Removes the event from our localStorage item and hides the events div area
	this.removeEvent = function (eventID) {
		scope.clearForm();
		var storage = $scope.local;

		for(var i=0; i<storage.length; i++){
			if(storage[i].id === eventID){
				storage.splice(i, 1);
				break;
			}
		}

		localStorage.setItem('data', JSON.stringify(storage));
			$scope.showEventsArea = false;
	};

	//Edit the event from our localStorage item
	this.editEvent = function (eventID) {
		var storage = $scope.local;
		scope.event_ID = eventID;
		
		for(var i=0; i<storage.length; i++){
			if(storage[i].id === eventID){
				scope.CalendarEvent.title = storage[i].text;
				scope.CalendarEvent.description = storage[i].description;
				scope.CalendarEvent.from = storage[i].start != '' ? new Date(storage[i].start) : null;
					scope.CalendarEvent.to = storage[i].end != '' ? new Date(storage[i].end) : null;
				break;
			}
		}
		//change the form action
		scope.changeActionTo('editEvent');
	};

	//Clearing the form input fields
	scope.clearForm = function () {
		scope.changeActionTo('addEvent');
		scope.showValidationMessages = false;
		scope.wrongDateEnd = false;
		scope.CalendarEvent.title = "";
		scope.CalendarEvent.description = "";
		scope.CalendarEvent.from = null;
			scope.CalendarEvent.to = null;
	};

	//form actions: add or edit events
	scope.formActions = {
        addEvent: function (CalendarEvent) {
            var from = CalendarEvent.from != null ? CalendarEvent.from.yyyymmdd() : '',
        		to = CalendarEvent.to != null ? CalendarEvent.to.yyyymmdd() : '',
        		title = CalendarEvent.title;

        	if(title == "" || from == "" || !DateCheck(from, to)) {
        		scope.wrongDateEnd = true;
        		return;
        	} else {
        		var	content = CalendarEvent.description,
					timeDiff = (from != '' && to != '') ? Math.abs(CalendarEvent.to.getTime() - CalendarEvent.from.getTime()) : '',
					diffDays = (timeDiff != '') ? Math.ceil(timeDiff / (1000 * 3600 * 24)) - 1 : '',
					latestID = !$scope.local.length ? 0 : $scope.local[$scope.local.length-1].id;
					latestID++;
				
				if(to === from) to = '';

	        	//save data localy in localStorage
		        $scope.local.push({id: latestID, text: title, description: content, start: from, end: to, diff: diffDays, backColor: getRandomEventColour()});
				localStorage.setItem('data', JSON.stringify($scope.local));
				scope.clearForm();
        	}	        	
        },
        editEvent: function (CalendarEvent) {	        	
        	var eventID = scope.event_ID;

        	//if an event is selected then we look for it on our local storage and replace its values
        	if(eventID != null) {
	        	var from = CalendarEvent.from != null ? CalendarEvent.from.yyyymmdd() : '',
	        		to = CalendarEvent.to != null ? CalendarEvent.to.yyyymmdd() : '',
	        		title = CalendarEvent.title;

	        	if(title == "" || from == "" || !DateCheck(from, to)) {
	        		scope.wrongDateEnd = true;
	        		return;
	        	} else {
	        		var content = CalendarEvent.description,
						timeDiff = (from != '' && to != '') ? Math.abs(CalendarEvent.to.getTime() - CalendarEvent.from.getTime()) : '',
						diffDays = (timeDiff != '') ? Math.ceil(timeDiff / (1000 * 3600 * 24)) - 1 : '',
						storage = $scope.local;

					if(to === from) to = '';

					for(var i=0; i<storage.length; i++){
						if(storage[i].id === eventID){
							storage[i].text = title;
							storage[i].description = content;
							storage[i].start = from;
							storage[i].end = to;
							storage[i].diff = diffDays;
							break;
						}
					}
					//we finally store the new JSON with the edited values
					localStorage.setItem('data', JSON.stringify(storage));    
					scope.showEvent(eventID);
					scope.event_ID = null;  
				} 
			}
			//Reseting the form				
			scope.clearForm();
        }
    };

    //function to change the form action
    scope.changeActionTo = function (name) {
	    scope.action = scope.formActions[name];
	    if(name === 'addEvent')
	        scope.actionLabel = 'Add Event';
	    else
	    	scope.actionLabel = 'Edit Event';
	};

	scope.changeActionTo('addEvent');
});
(function () {
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
        scope.today = new Date().yyyymmdd();

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

	app.filter('range', function () {
	  return function(val, range) {
	    range = parseInt(range);
	    for (var i=0; i<range; i++)
	      val.push(i);
	    return val;
	  };
	});

	//Custom directive to compile the calendar table
	app.directive('calendartable', function ($compile) {
		var generateCalendarTable = function (storage, month, year) {
            var i = 0, 
            	j = 0,     	
            	dd = 0,
            	mm = 0,
            	full = "",
            	num = "",
            	style = "",
            	days = getMonthDays(month, year),
            	weekDayNum = getWeekDay(monthNum, yearNum),
            	eventArray = [],
            	rowCount = 0,
            	html = "<tr><th id='week' ng-repeat='weekDay in calendar.weekDays'>{{weekDay.name}}</th></tr><tr><th ng-repeat='n in [] | range:" + weekDayNum + "'></th>";

            for(i = 0, j=weekDayNum + 1; i < days.length; i++, j++){
            	dd = days[i].getDate();
            	if(dd<10) dd='0'+dd;

            	mm = days[i].getMonth() + 1;
			    if (mm < 10) mm = '0' + mm;
			    
			    full = days[i].getFullYear() + "-" + mm + "-" + dd;
			    //Check if current date (in yyyy-MM-dd format) is today so the cell background is different
			    if(isToday(full))
				    style = "style='background:#FFCC99'";
				else
					style = "";

            	html += "<th data-date='" + full + "'" + style + ">" + dd + "&nbsp;";

            	eventArray = getDayEvents(storage, dd, month, year);            	
            	//Include all the events in the calendar
            	if(!!eventArray.length){ //is eventArray length is > 0 then it returns a truthy element so !! returns true
            		for(var cont = 0; cont < eventArray.length; cont++){
            			switch (eventArray[cont].position){
            				case 'solo':
            					html += "<span class='event single' ng-click='showEvent("+eventArray[cont].storage.id+")' style='background:"+eventArray[cont].storage.backColor+";'>"+ eventArray[cont].storage.text + "</span>";
            				break;
            				case 'start':
            					html += "<span class='event first' ng-click='showEvent("+eventArray[cont].storage.id+")' style='background:"+eventArray[cont].storage.backColor+";'>"+ eventArray[cont].storage.text + "</span>";
            				break;
            				case 'centre':
            					html += "<span class='event empty' ng-click='showEvent("+eventArray[cont].storage.id+")' style='background:"+eventArray[cont].storage.backColor+";'/>";
            				break;
            				case 'end':
            					html += "<span class='event empty last' ng-click='showEvent("+eventArray[cont].storage.id+")' style='background:"+eventArray[cont].storage.backColor+";'/>";
            				break;
            			}
            		}
            	}

            	html += "</th>";

            	if (j % 7 == 0){
            		html += "</tr>";
            		rowCount++;
            	}
            }
            
            //Logic to add last rows to the table in order to always get the same size 
            var aux = (7-(j-(7*parseInt(j/7))))+1,
            	aux2 = aux > 7 ? parseInt(aux/7) : 0;
            aux = aux-aux2;

            if(aux2 > 0){
            	while(aux2 > 0){
            		html += "<th></th>";
            		aux2 --;
            	}
            	html += "</tr>";
            	rowCount++;
            }
            while(aux > 0){
            	html += "<th></th>";
            	aux --;
            }
            html += "</tr>";
            rowCount++;

            if(rowCount == 5){
            	html += "<tr><th></th><th></th><th></th><th></th><th></th><th></th><th></th></tr>";
            }
            
            return html;
        };

      	return {
            link:function ($scope, $element, attrs) {
            	/*WatchGroup and watchCollection (current AngularJS v1.3.7) don´t support a deep watch that I need to 
            		catch the differences in 'local', so this is the "hack" way: registering an anonymous deep watcher
            		with array of values being passed in from the watch function*/
				$scope.$watch(function () {
				    return ['local', 'monthName'].map(angular.bind($scope, $scope.$eval));
				}, function (newV) {
			  		// Compile the HTML template and attach to calendartable directive
                	var linkToDOM = $compile(generateCalendarTable($scope.local, monthNum, yearNum));
	                // Links template and scope
	                var table = linkToDOM($scope);
		            // Appends compiled template to DOM directive
		            $element.empty();
	            	$element.append(table);
				},true);
           }
        }
	});
})();
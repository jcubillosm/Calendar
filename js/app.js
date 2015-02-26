(function(){
	var app = angular.module('jsCalendar', []),
		monthNum = new Date().getMonth(), //today's month
		yearNum = new Date().getFullYear(); //today's year
		
	app.controller('CalendarController', function($scope){
		var scope = $scope,
			monthNames = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];

		this.weekDays = [{name:'Mon'}, {name:'Tue'}, {name:'Wed'}, {name:'Thu'}, {name:'Fri'}, {name:'Sat'}, {name:'Sun'}];
		scope.year = yearNum;
		scope.monthName = monthNames[(monthNum >= 12? 0 : monthNum)];
		scope.saved = localStorage.getItem('data');
        scope.local = (localStorage.getItem('data')!==null) ? JSON.parse(scope.saved) : [];
        localStorage.setItem('data', JSON.stringify(scope.local));

		/*Gives functionality to "Next" and "Previous" buttons
			changing current month and year values*/
		this.setMonth = function(buttonID){
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

		scope.showEvent = function(){
			console.log("Test");
		};
	});

	app.filter('range', function() {
	  return function(val, range) {
	    range = parseInt(range);
	    for (var i=0; i<range; i++)
	      val.push(i);
	    return val;
	  };
	});

	//Custom directive to compile the calendar table
	app.directive('calendartable', function($compile) {
		var generateCalendarTable = function(storage, month, year) {
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
            	html = "<tr><th id='week' ng-repeat='weekDay in calendar.weekDays'>{{weekDay.name}}</th></tr><tr><th ng-repeat='n in [] | range:" + weekDayNum + "'></th>";

            	/*//if the first day starts on monday then we need and extra line at the top
            	// ... that would show the previous month dates throught the hole week
            	if(weekDayNum === 0){
            		html += "<tr><th></th><th></th><th></th><th></th><th></th><th></th><th></th></tr>";
            	}*/

            for(i = 0, j=weekDayNum + 1; i < days.length; i++, j++){
            	dd = days[i].getDate();
            	if(dd<10) dd='0'+dd;

            	mm = days[i].getMonth() + 1;
			    if (mm < 10) mm = '0' + mm;
			    
			    full = days[i].getFullYear() + "-" + mm + "-" + dd;

			    if(Today(full))
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
            					html += "<span class='event single' ng-click='showEvent()' style='background:"+eventArray[cont].storage.backColor+";'>"+ eventArray[cont].storage.text + "</span>";
            				break;
            				case 'start':
            					html += "<span class='event first' ng-click='showEvent()' style='background:"+eventArray[cont].storage.backColor+";'>"+ eventArray[cont].storage.text + "</span>";
            				break;
            				case 'centre':
            					html += "<span class='event empty' ng-click='showEvent()' style='background:"+eventArray[cont].storage.backColor+";'/>";
            				break;
            				case 'end':
            					html += "<span class='event empty last' ng-click='showEvent()' style='background:"+eventArray[cont].storage.backColor+";'/>";
            				break;
            			}
            		}
            	}

            	html += "</th>";

            	if (j % 7 == 0)
            		html += "</tr>";
            }
            //console.log(j);
            return html;
        };

      	return {
            link:function($scope, $element, attrs) {
            	/*WatchGroup and watchCollection (current AngularJS v1.3.7) don´t support a deep watch that I need to 
            		catch the differences in 'local', so this is the "hack" way: registering an anonymous deep watcher
            		with array of values being passed in from the watch function*/
				$scope.$watch(function(){
				    return ['local', 'monthName'].map(angular.bind($scope, $scope.$eval));
				}, function(newV){
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

	//Controller for "Add Event" form
	app.controller('FormController', ['$scope', '$element', function($scope, $element) {
    	angular.element('input[type="date"]').attr({
			min: new Date().yyyymmdd(),
			value:'2015-02-15'
		});
		    
      	//Updates the events on form submit, it saves the new event into local storage
      	$scope.update = function(CalendarEvent) {
        	var from = CalendarEvent.from != null ? CalendarEvent.from.yyyymmdd() : '',
        		to = CalendarEvent.to != null ? CalendarEvent.to.yyyymmdd() : '',
        		title = CalendarEvent.title,
				timeDiff = (from != '' && to != '') ? Math.abs(CalendarEvent.to.getTime() - CalendarEvent.from.getTime()) : '',
				diffDays = (timeDiff != '') ? Math.ceil(timeDiff / (1000 * 3600 * 24)) - 1 : '';

	        //save data localy in localStorage
	        $scope.local.push({text: title,	start: from, end: to, diff: diffDays, backColor: getRandomEventColour()});
			localStorage.setItem('data', JSON.stringify($scope.local));
    	};
    }]);

	//Returns a color for the event background
	function getRandomEventColour () {
		var colourArray = ['#009bcc', '#cc3100', '#00cc97', '#9700cc', '#cc9700', '#1f5cb1', '#646472'],
			latestColour = localStorage.getItem('colourIndex');

		if(latestColour < colourArray.length - 1)
			latestColour ++;
		else
			latestColour = 0;

		localStorage.setItem('colourIndex', JSON.stringify(latestColour));
		return colourArray[latestColour];
	};

	//Returns an Array containing all days of a specific month
	function getMonthDays (month, year) {
	   	var date = new Date(year, month, 1);
	    var array = [];
	    while (date.getMonth() === month) {
	       array.push(new Date(date));
	       date.setDate(date.getDate() + 1);
	    }
	    return array;
	};

	/*Returns the week day (0-6) of the first day of the current month 
		so we know which day of the calendar the month starts*/
	function getWeekDay (month, year) {
	    var d = new Date(year, month, 1).getDay();
		if(d === 0) d = 7;
		d--;
		return d;
	};

	/*Returns all the events stored in localStorage that are present in 
		the selected 'day'/'month'/'year'*/
	function getDayEvents (storage, day, month, year) {
		var array = [];

		for(var i = 0; i < storage.length; i++){
            var from = new Date(storage[i].start),
        		to = new Date(storage[i].end), 
        		diff = storage[i].diff,
        		fromDay = from.getDate(), fromMonth = from.getMonth(), fromYear = from.getFullYear(),
        		toDay = to.getDate(), toMonth = to.getMonth(), toYear = to.getFullYear();

        	if(isNaN(to.getTime()) && fromDay == day && fromMonth == month && fromYear == year){ //invalid 'to' date, so it is just one day event
        		array.push({storage: storage[i], position: 'solo'}); //start
        	} else {
	        	if(fromDay == day && fromMonth == month && fromYear == year)
	        		array.push({storage: storage[i], position: 'start'}); //start
	        	else if(toDay == day && toMonth == month && toYear == year)
	        		array.push({storage: storage[i], position: 'end'}); //end
	        	else{ //centre
	        		if(fromMonth == toMonth && fromMonth == month && day > fromDay && day < toDay){ //all in same month
	        			array.push({storage: storage[i], position: 'centre'});
	        		} else if(day > fromDay && fromMonth == month && toMonth != month && !isNaN(to.getTime())){
	        			array.push({storage: storage[i], position: 'centre'}); //current month is 'from'
	        		} else if(day < toDay && toMonth == month && fromMonth != month){
	        			array.push({storage: storage[i], position: 'centre'}); //current month is 'to'
	        		}
	        	}
        	}
	    }

		return array;
	};

	/*Compares today's day with the passed value which is a date in format 'yyyy-MM-dd'
		and returns true if they are the same*/
	function Today (value) {
		var todayDay = ("0" + new Date().getDate()).slice(-2), //01-31
		    todayMonth = ("0" + (new Date().getMonth() + 1)).slice(-2), //01-12
		    todayYear = new Date().getFullYear(), //four digits
		    finalDate = todayYear+'-'+todayMonth+'-'+todayDay;

		if(value == finalDate) 
			return true;
		return false;
	};
})();
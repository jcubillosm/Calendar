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

		/*Gives functionality to "Next" and "Previous" buttons
			...changing current month and year values*/
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
		var generateCalendarTable = function(month, year) {
            var i = 0, 
            	j = 0,     	
            	dd = 0,
            	mm = 0,
            	full = "",
            	num = "",
            	style = "",
            	days = getMonthDays(month, year),
            	weekDayNum = getWeekDay(monthNum, yearNum),
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

            	html += "<th data-date='" + full + "'" + style + ">" + dd + "&nbsp;</th>";

            	if (j % 7 == 0)
            		html += "</tr>";
            }
            console.log(j);
            return html;
        };


      	return {
            link:function($scope, $element, attrs) {
            	// Watching monthName in our scope. When $scope.monthName changes, view is updated
                $scope.$watch('monthName', function() {
	            	// Compile the HTML template and attach to calendartable directive
	                var linkToDOM = $compile(generateCalendarTable(monthNum, yearNum));
	                // Links template and scope
	                var table = linkToDOM($scope);
		            // Appends compiled template to DOM directive
		            $element.empty();
		            $element.append(table);
		        });
           }
        }
	});

	//Controller for "Add Event" form
	app.controller('FormController', ['$scope', '$element', function($scope, $element) {
      	$scope.master = {};
    	angular.element('input[type="date"]').attr({
			min: new Date().yyyymmdd(),
			value:'2015-02-15'
		});

      	//Puts the <span> event into the calendar on submit
      	$scope.update = function(CalendarEvent) {
        	$scope.master = angular.copy(CalendarEvent);
        	var from = CalendarEvent.from != null ? CalendarEvent.from.yyyymmdd() : '',
        		to = CalendarEvent.to != null ? CalendarEvent.to.yyyymmdd() : '',
        		title = CalendarEvent.title;

        	if(from === to || !to) {
	        	angular.element('th[data-date="'+ from +'"]').append("<span class='event single' ng-click='showEvent()'>"+ title + "</span>");
       		} else{       			
       			var diff = (!CalendarEvent.to) ? -1 : (CalendarEvent.to.getDate() - CalendarEvent.from.getDate()) - 1,
       				yyyy = (CalendarEvent.from.getFullYear()).toString(),
       				mm = (CalendarEvent.from.getMonth()+1).toString();       			

	        	angular.element('th[data-date="'+ from +'"]').append("<span class='event first' ng-click='showEvent()'>"+ title + "</span>");

	        	if(diff > -1){
	        		var aux = yyyy + "-" + (mm[1]?mm:"0"+mm[0]) + "-";
	        		for(var i = CalendarEvent.from.getDate() + 1; i < CalendarEvent.to.getDate(); i++)
	            		angular.element('th[data-date="'+ aux + i +'"]').append("<span class='event' ng-click='showEvent()'>"+ title + "</span>");
	        	}

    	    	angular.element('th[data-date="'+ to +'"]').append("<span class='event last' ng-click='showEvent()'>"+ title + "</span>");
	        }
    	};

      	$scope.reset = function() {
        	$scope.CalendarEvent = angular.copy($scope.master);
      	};

      	$scope.reset();
    }]);

	//Returns an Array containing all days of a specific month
	function getMonthDays (month, year){
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
	function getWeekDay (month, year){
	    var d = new Date(year, month, 1).getDay();
		if(d === 0) d = 7;
		d--;
		return d;
	};

	//Compares today's day with the passed value which is a date in format 'yyyy-MM-dd'
	//... and returns true if they are the same
	function Today (value){
		var todayDay = ("0" + new Date().getDate()).slice(-2), //01-31
		    todayMonth = ("0" + (new Date().getMonth() + 1)).slice(-2), //01-12
		    todayYear = new Date().getFullYear(), //four digits
		    finalDate = todayYear+'-'+todayMonth+'-'+todayDay;

		if(value == finalDate) 
			return true;
		return false;
	};
})();
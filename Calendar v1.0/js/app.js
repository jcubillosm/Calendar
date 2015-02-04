(function(){
	var app = angular.module('jsCalendar', []);
		
	app.controller('CalendarController', function($scope){
		var scope = $scope,
			monthNum = new Date().getMonth(), //today's month
			yearNum = new Date().getFullYear(), //today's year
			monthNames = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];

		this.weekDays = [{name:'Mon'}, {name:'Tue'}, {name:'Wed'}, {name:'Thu'}, {name:'Fri'}, {name:'Sat'}, {name:'Sun'}];
		this.days = getMonthDays(monthNum, yearNum);
		this.weekDayNum = getWeekDay(monthNum, yearNum);
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
			this.days = getMonthDays(monthNum, yearNum);
			this.weekDayNum = getWeekDay(monthNum, yearNum);
			scope.monthName = monthNames[(monthNum >= 12? 0 : monthNum)];
		};

		scope.$watch(function() { 
			scope.year = yearNum;
	    	//scope.monthName = monthNames[(monthNum >= 12? 0 : monthNum)];
	    	Today();
		});

		/*scope.$watch('monthName', function (newVal, oldVal) { 
			scope.year = yearNum;
	    	Today();
		 });*/
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
      	return {
            link: function($scope, $element, attrs) {
            	var tableContent = "<tr><th id='week' ng-repeat='weekDay in calendar.weekDays'>{{weekDay.name}}</th></tr><tr><th ng-repeat='n in [] | range:calendar.weekDayNum'></th><th ng-repeat='day in calendar.days.slice(0, 7-calendar.weekDayNum) track by $index'>{{day | date:'dd'}}</th></tr><tr><th ng-repeat='day in calendar.days.slice(7-calendar.weekDayNum, 14-calendar.weekDayNum) track by $index' data-date='{{day | date:\"yyyy-MM-dd\"}}'>{{day | date:'dd'}}</th></tr><tr><th ng-repeat='day in calendar.days.slice(14-calendar.weekDayNum, 21-calendar.weekDayNum) track by $index' data-date='{{day | date:\"yyyy-MM-dd\"}}'>{{day | date:'dd'}}</th></tr><tr><th ng-repeat='day in calendar.days.slice(21-calendar.weekDayNum, 28-calendar.weekDayNum) track by $index' data-date='{{day | date:\"yyyy-MM-dd\"}}'>{{day | date:'dd'}}</th></tr><tr><th ng-repeat='day in calendar.days.slice(28-calendar.weekDayNum, 35-calendar.weekDayNum) track by $index' data-date='{{day | date:\"yyyy-MM-dd\"}}'>{{day | date:'dd'}}</th></tr><tr><th ng-repeat='day in calendar.days.slice(35-calendar.weekDayNum, 42-calendar.weekDayNum) track by $index' data-date='{{day | date:\"yyyy-MM-dd\"}}'>{{day | date:'dd'}}</th></tr>";
            	// Compile the HTML template and attach to map-view directive
                var linkToDOM = $compile(tableContent);
                // Links template and scope
                var table = linkToDOM($scope);
	            // Appends compiled template to DOM directive
	            $element.empty();
	            $element.append(table);
           }
        }
	});

	//Controller of "Add Event" form
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

        	if(from === to) {
	        	angular.element('th[data-date="'+ from +'"]').append("<span class='event' ng-click='showEvent()'>"+ title + "</span>");
       		} else{
	        	angular.element('th[data-date="'+ from +'"]').append("<span class='event' ng-click='showEvent()'>"+ title + "</span>");
    	    	angular.element('th[data-date="'+ to +'"]').append("<span class='event' ng-click='showEvent()'>"+ title + "</span>");
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
		so we now which day of the calendar the month starts*/
	function getWeekDay (month, year){
	    var d = new Date(year, month, 1).getDay();
		if(d === 0) d = 7;
		d--;
		return d;
	};

	//Looks for today date on our calendar and applies styling (different background) if found
	function Today (){
		var todayDay = ("0" + new Date().getDate()).slice(-2), //01-31
		    todayMonth = ("0" + (new Date().getMonth() + 1)).slice(-2), //01-12
		    todayYear = new Date().getFullYear(), //four digits
		    finalDate = todayYear+'-'+todayMonth+'-'+todayDay;

		if(angular.element('th[data-date="'+ finalDate +'"]').length > 0)	
			angular.element('th[data-date="'+ finalDate +'"]').css('background','#FFCC99');
		else
			angular.element('th[data-date]').css('background','');
	};

})();
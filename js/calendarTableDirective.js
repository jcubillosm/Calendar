'use strict';

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

        if(rowCount == 5)
            html += "<tr><th></th><th></th><th></th><th></th><th></th><th></th><th></th></tr>";
                    
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

app.filter('range', function () {
    return function(val, range) {
        range = parseInt(range);
        for (var i=0; i<range; i++)
            val.push(i);
        return val;
    };
});
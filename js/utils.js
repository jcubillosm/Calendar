Date.prototype.yyyymmdd = function() {                                
    var yyyy = this.getFullYear().toString(),
       	mm = (this.getMonth()+1).toString(), // getMonth() is zero-based 
      	dd  = this.getDate().toString();      
	return yyyy + '-' + (mm[1]?mm:"0"+mm[0]) + '-' + (dd[1]?dd:"0"+dd[0]);
};

//Returns a color for the event background
function getRandomEventColour () {
	var colourArray = ['#ff748c', '#82cc68', '#fd8e2f', '#9700cc', '#cc9700', '#18498d', '#646472'],
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
        		if(fromMonth == toMonth && fromMonth == month && day > fromDay && day < toDay && fromYear == year){ //all in same month
        			array.push({storage: storage[i], position: 'centre'});
        		} else if(day > fromDay && fromMonth == month && toMonth != month && !isNaN(to.getTime()) && fromYear == year){
        			array.push({storage: storage[i], position: 'centre'}); //current month is 'from'
        		} else if(day < toDay && toMonth == month && fromMonth != month && fromYear == year){
        			array.push({storage: storage[i], position: 'centre'}); //current month is 'to'
        		}
        	}
    	}
    }

	return array;
};

/*Compares today's day with the passed value which is a date in format 'yyyy-MM-dd'
	and returns true if they are the same*/
function isToday (value) {
	var todayDay = ("0" + new Date().getDate()).slice(-2), //01-31
	    todayMonth = ("0" + (new Date().getMonth() + 1)).slice(-2), //01-12
	    todayYear = new Date().getFullYear(), //four digits
	    finalDate = todayYear+'-'+todayMonth+'-'+todayDay;

	if(value == finalDate) 
		return true;
	return false;
};

//Checks if final event date is bigger than the starting date, if not it returns false
function DateCheck (dateStart, dateEnd) {
  	var eDate = new Date(dateEnd),
  		sDate = new Date(dateStart);
  		
	if(dateStart != '' && dateEnd != '' && sDate > eDate) 
	    return false;
	return true;
};
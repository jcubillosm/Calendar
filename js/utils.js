//modify Date to be in the format we need: yyyy-MM-dd
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
 	var date = new Date(year, month, 1),
      	array = [];

  	while (date.getMonth() === month) {
    	array.push(new Date(date));
     	date.setDate(date.getDate() + 1);
  	}

  	return array;
};

/* Returns the week day (0-6) of the first day of the current month 
	so we know which day of the calendar the month starts */
function getWeekDay (month, year) {
  	var d = new Date(year, month, 1).getDay();
	
  	if(d === 0) d = 7;
	d--;

	return d;
};

/* Returns all the events stored in localStorage that are present in 
	the selected day-month-year */
function getDayEvents (storage, day, month, year) {
	var array = [];

	for(var i = 0; i < storage.length; i++){
        var from = new Date(storage[i].start),
    		to = new Date(storage[i].end),
            currentDate = new Date(year, month, day).yyyymmdd(),
            fromDate = new Date(from.getFullYear(), from.getMonth(), from.getDate()).yyyymmdd(),
            toDate = new Date(to.getFullYear(), to.getMonth(), to.getDate()).yyyymmdd();

      	if(isNaN(to.getTime())){ //invalid 'to' date, so it should be a one day event
	    	if(fromDate == currentDate)
	        	array.push({storage: storage[i], position: 'solo'}); //one day event
	    } else {
	        if(currentDate == fromDate)
	        	array.push({storage: storage[i], position: 'start'}); //start
	        else if(currentDate == toDate)
	        	array.push({storage: storage[i], position: 'end'}); //end
	        else if(currentDate < toDate && currentDate > fromDate)
	            array.push({storage: storage[i], position: 'centre'}); //centre
	    }
	}

	return array;
};

/* Compares today's day with the passed value which is a date in format 'yyyy-MM-dd'
	and returns true if they are the same */
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
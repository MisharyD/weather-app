import "../styles/index.css"
import "../styles/reset.css"
import "../styles/current-info.css"
import "../styles/next-hours.css"
import "../styles/forecast.css"

import sunny from "../assets/images/sunny.svg";
import night from "../assets/images/clear-night.svg";
import rain from "../assets/images/rain.svg";
import fog from "../assets/images/fog.svg";
import partlyCloudyDay from "../assets/images/partly-cloudy-day.svg";
import partlyCloudyNight from "../assets/images/partly-cloudy-night.svg";
import wind from "../assets/images/wind.svg";
import snow from "../assets/images/snow.svg";
import cloudy from "../assets/images/cloudy.svg";

const weather = (function ()
{
    const KEY = "NPZ3AVG6QMT9RU556MX3ULXQL";

    const getLocationData = async (location) =>
    {
        const data = await fetch(`https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${location}?key=${KEY}`, 
            {
            mode: 'cors'
        });
        const json = await data.json();
        
        const processed = processData(json);
        return processed;
    }
    
    function processData(data)
    {        
        console.log(data);
        //data for today, temp for every hour remaining, humididty, pressure, windspeed
        const today = {
            location:data.address,
            time:data.currentConditions.datetime,
            date:data.days[0].datetime,
            currentTemp:toCelc(data.currentConditions.temp),
            state:data.currentConditions.icon,
            humidity:data.currentConditions.humidity,
            windSpeed:data.currentConditions.windspeed,
            nextHours:[]
        }
        today.nextHours = getDataForNextHours(data)
        
        //data for next 5 days, min and max temp, general ?
        const forecast = getForecast(5, data);

        return { 
            today:today,
            forecast:forecast 
        }
    }

    //returns an array for each hour with their temp and state for today
    function getDataForNextHours(data)
    {
        const nextHours = [];

        //get data for all hours in today
        const allHours = data.days[0].hours;

        //get remaining hours in the day, for example if it is 4am then 20 hours is left which is what will be displayed
        const currentTime = data.currentConditions.datetime.split(":")[0] // date time is in the format hh:mm:ss
        const remainingHours = 24 - currentTime;
        
        for(let i =24-remainingHours; i< 24; i++)// 24-remaining hours so that when it is currently at 20 remaining hours will be 4 then i will be 20
        {
            let hour = allHours[i];

            let temp = hour.temp
            let state = hour.icon;
            let time = hour.datetime

            nextHours.push({
                time:time,
                temp:toCelc(temp),
                state:state
            })
        }
        
        return nextHours;
    }

    //returns an array for each day with each having min and max temp and state
    function getForecast(nbOfDays, data)
    {
        const forecast = [];

        //get data for all days
        const allDays = data.days;

        for(let i =1; i<=nbOfDays;i++) //skip today
        {
            let day = allDays[i];
            
            let minTemp = day.tempmin;
            let maxTemp = day.tempmax;
            let state = day.icon

            forecast.push({
                date:day.datetime,
                minTemp:toCelc(minTemp),
                maxTemp:toCelc(maxTemp),
                state:state
            })
        }

        return forecast;
    }

    function toCelc(feranhait)
    {
        return Math.floor((feranhait-32) * 5/9)
    }

    return { getLocationData }

})()

const dom = (function ()
{
    //get containers

    //for current section
    const location = document.querySelector(".location");
    const currentTemp = document.querySelector(".current-info-container .temp");
    const currentState = document.querySelector(".state-container .state-icon");
    const currentDay = document.querySelector(".current-info-container .day");
    const currentTime = document.querySelector(".current-info-container .time");
    const humididty = document.querySelector(".current-info-container .humidity");
    const windSpeed = document.querySelector(".current-info-container .wind-speed");

    //for next hours section 
    const nextHoursContainer = document.querySelector(".next-hours-container");

    //for forecast section
    const forecastContainer = document.querySelector(".forecast-container");

    async function init()
    {
        const form = document.querySelector(".form")
        form.addEventListener("submit", handleFormSubmit);

        const data = await weather.getLocationData("Riyadh");
            
        loadCurrent(data);
        loadNextHours(data);
        loadForecast(data);
    }
    
    async function handleFormSubmit(e)
    {
        e.preventDefault();

        try 
        {
            const data = await weather.getLocationData(document.querySelector(".location-input").value);
            
            loadCurrent(data);
            loadNextHours(data);
            loadForecast(data);
        } 
        catch (error) 
        {
            displayInvalidMessage()
        }
    }

    function displayInvalidMessage()
    {
        const invalidMessage = document.querySelector(".invalid-message");
        invalidMessage.classList.remove("hidden");
        setTimeout(() => invalidMessage.classList.add("hidden"), 4000);
    }

    function loadCurrent(data){
        const currentData = data.today;

        location.textContent = capitalizeFirstLetter(currentData.location);
        currentTemp.textContent = currentData.currentTemp + "\u00B0";
        currentDay.textContent = getDayOfWeek(currentData.date);
        currentTime.textContent = changeTimeFormat(currentData.time);
        humididty.textContent = "H: " + currentData.humidity;
        windSpeed.textContent = "WS: " + currentData.windSpeed;
        currentState.src = getStateIcon(currentData.state);
    }

    function loadNextHours(data)
    {
        //get data for all next hours
        const nextHours = data.today.nextHours;

        //reset container for next hours
        nextHoursContainer.textContent = "";

        for(let i=0;i<nextHours.length;i++)
        {
            //get hour info
            let hourInfo = nextHours[i];

            //get container for info
            let hourInfoContainer = document.querySelector(".hour-info-container.structure").cloneNode(true);
            hourInfoContainer.classList.remove("hidden", "structure");

            //assign info
            hourInfoContainer.querySelector(".hour").textContent = changeTimeFormat(hourInfo.time);
            hourInfoContainer.querySelector(".state-icon").src = getStateIcon(hourInfo.state);
            hourInfoContainer.querySelector(".temp").textContent = hourInfo.temp + "\u00B0";

            //append container to nexthours container
            nextHoursContainer.append(hourInfoContainer);
        }
    }

    function loadForecast(data)
    {
        const days = data.forecast

        forecastContainer.textContent ="";
        for(let i =0; i<days.length;i++)
        {
            //get info for
            let dayInfo = days[i];
            
            //get container for info
            let dayInfoContainer = document.querySelector(".day-info.structure").cloneNode(true);
            dayInfoContainer.classList.remove("hidden", "structure");

            dayInfoContainer.querySelector(".day").textContent = getDayOfWeek(dayInfo.date);
            dayInfoContainer.querySelector(".state-icon").src = getStateIcon(dayInfo.state);
            dayInfoContainer.querySelector(".minmax-temp").textContent = dayInfo.minTemp + "\u00B0 - " + dayInfo.maxTemp + "\u00B0";

            forecastContainer.append(dayInfoContainer);
        }
    }
    
    //returns the correct svg icon for a given icon state from the visual crossing api
    function getStateIcon(icon)
    {
        const currentState = document.querySelector(".state-container .state-icon");
        switch (icon) {
            case 'snow':
                return snow;
            case 'rain':
                return rain;
            case 'fog':
                return fog;
            case 'wind':
                return wind;
            case 'cloudy':
                return cloudy;
            case 'partly-cloudy-day':
                return partlyCloudyDay;
            case 'partly-cloudy-night':
                return partlyCloudyNight;
            case 'clear-day':
                return sunny;
            case 'clear-night':
                return night;
            default:
                console.warn("Unknown weather icon:", icon);
                return ""; // Return an empty string if no match
        }
    }

    //returns the corrosponding day for a given string date
    function getDayOfWeek(date) {
        const dateObject = new Date(date);
        const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const dayIndex = dateObject.getDay();
        return daysOfWeek[dayIndex];
    }

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    //return time in hh:mm 12 hour format
    function changeTimeFormat(time)
    {
        // Split the input time string into hours, minutes, and seconds
        const [hours, minutes] = time.split(':').map(Number);

        // Determine AM or PM
        const period = hours >= 12 ? 'PM' : 'AM';
        
        // Convert hours from 24-hour format to 12-hour format
        const formattedHours = hours % 12 || 12; // Convert 0 to 12 for midnight
        const formattedMinutes = minutes.toString().padStart(2, '0');

        // Combine and return the formatted time
        return `${formattedHours}:${formattedMinutes} ${period}`;
    }

    return { init }
})()

document.addEventListener("DOMContentLoaded", dom.init);
import "../styles/index.css"
import "../styles/reset.css"
import "../styles/current-info.css"
import "../styles/next-hours.css"
import "../styles/forecast.css"

const weather = (function ()
{
    const KEY = "NPZ3AVG6QMT9RU556MX3ULXQL";

    const getLocationData = async (location) =>
    {
        const data = await fetch(`https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${location}?key=${KEY}`, 
            {
            mode: 'cors'
        });

        return data.json().then((respone) => processData(respone));
    }
    
    function processData(data)
    {        
        //data for today, temp for every hour remaining, humididty, pressure, windspeed
        const today = {
            currentTemp:toCelc(data.currentConditions.temp),
            state:data.currentConditions.icon,
            humidity:data.currentConditions.humidity,
            windspeed:data.currentConditions.windspeed,
            nextHours:[]
        }
        today.nextHours = getDataForNextHours(data)
        
        //data for next 5 days, min and max temp, general ?
        const next5 = getForecast(5, data);

        return { 
            today:today,
            next5:next5 
        }
    }

    //returns an array for each hour with their temp and state for today
    function getDataForNextHours(data)
    {
        const nextHours = [];

        //get data for all hours in today
        const allHours = data.days[0].hours;

        //get remaining hours in the day, for example if it is 4am then 20 hours is left which is what will be displayed
        const now = new Date();
        const remainingHours = 24 - now.getHours();
        
        for(let i =24-remainingHours; i< 24; i++)// 24-remaining hours so that when it is currently at 20 remaining hours will be 4 then i will be 20
        {
            let hour = allHours[i];

            let temp = hour.temp
            let state = hour.icon;

            nextHours.push({
                hour:i,
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
                minTemp:minTemp,
                maxTemp:maxTemp,
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
    const stateContainer = document.querySelector(".state-container");
    const currentDay = document.querySelector(".current-info-container .day");
    const currentTime = document.querySelector(".current-info-container .time");
    const humididty = document.querySelector(".current-info-container .humididty");
    const windSpeed = document.querySelector(".current-info-container .wind-speed");

    //for next hours section 

    //for forecast section
    

    function init()
    {
        const form = document.querySelector(".form")
        form.addEventListener("submit", handleFormSubmit);
    }
    
    async function handleFormSubmit(e)
    {
        e.preventDefault();

        try 
        {
            const data = await weather.getLocationData(document.querySelector(".location-input").value);
        } 
        catch (error) 
        {
            //display message
            console.log(error);
        }
    }

    function loadCurrent(data){

    }

    function loadNextHours(data){}

    function loadForecast(data){}
    
    //returns the corrosponding day for a given string date
    function getDayOfWeek(date) {
        const dateObject = new Date(date);
        const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const dayIndex = dateObject.getDay();
        return daysOfWeek[dayIndex];
    }

    return { init }
})()

document.addEventListener("DOMContentLoaded", dom.init);
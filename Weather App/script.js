const userTab=document.querySelector("[data-userWeather]");
const searchTab=document.querySelector("[data-searchWeather]");
const userContainer=document.querySelector("[data-weather-container]");

const grantAccessContainer=document.querySelector(".grant-location-container");
const searchForm=document.querySelector(".form-container");
const loadingScreen=document.querySelector(".loading-container");
const userInfoContainer=document.querySelector(".user-info-container");
const errorMsgContainer=document.querySelector(".error-Msg")

let currentTab=userTab;
const API_KEY="16666f98061207752672ca1686182eca";
currentTab.classList.add("current-tab");
grantAccessContainer.classList.add("active");

// handle switching of tabs

function switchTab(clickedTab){
// this part changes bg color of tabs
  if(clickedTab!=currentTab){
    currentTab.classList.remove("current-tab");
    currentTab=clickedTab;
    currentTab.classList.add("current-tab");
//
// agar mein your weather tab par tha aur search weather par switch kiya toh , iska matlab abhi searchForm mein active class
// nahi hai, usko add karna hoga
    if(!searchForm.classList.contains("active")){
        userInfoContainer.classList.remove("active");
        grantAccessContainer.classList.remove("active");
        searchForm.classList.add("active");
    }
    else{
        // searchForm pehle se active hai matlab mein your weather tab par switch kara hoon
        searchForm.classList.remove("active");
        userInfoContainer.classList.remove("active");
        // your weather tab click karte hi meri location ka weather dikh jaana chahiye toh mere current location coordinates fetch karo session storage se
        getfromSessionStorage();
    }
  }
}

// user tab and search tab click karne par switch tab function call karna hai
userTab.addEventListener('click',()=>{
    switchTab(userTab);
});

searchTab.addEventListener('click',()=>{
    switchTab(searchTab);
});

// check if coordinates are already present in session storage
function getfromSessionStorage(){
  const localCoordinates=sessionStorage.getItem("user-coordinates");
//   if local coordinates not present in storage then display the grant access container
  if(!localCoordinates){
    grantAccessContainer.classList.add("active");
  }
  else{
    //  convert string to json object

    const coordinates=JSON.parse(localCoordinates);
    console.log(coordinates);
    fetchUserWeatherInfo(coordinates);

  }
}

// Get accurate city name as the openweather api is giving it inaccurately
async function getAccurateCityName(lat,lon){
  try{
     const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
    );
    const data = await response.json();
    // Try to return city, then locality, then principalSubdivision (fallback)
     return data.city || data.locality || data.principalSubdivision || "Unknown Location";
  }
  catch(err){
    console.error("Reverse geocoding failed",err);
  }
}


async function fetchUserWeatherInfo(coordinates){
  // this is object destructuring in Javascript ,takes the properties of lat and lon from corrdinates
  // and stores them in 2 new constants lat and lon
    const {lat,lon}=coordinates;
    grantAccessContainer.classList.remove("active");
    errorMsgContainer.classList.remove("active");
    // make loader visible
    loadingScreen.classList.add("active");
    
    // API CALL
    try{
      const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
      const data=await response.json();

    // fetch accurate city name
    const accurateCity=await getAccurateCityName(lat,lon);
    data.name=accurateCity;
    //   remove loader
     loadingScreen.classList.remove("active");
    //  make user info container visible
     userInfoContainer.classList.add("active");
     renderWeatherInfo(data);
    }
    catch(err){
        loadingScreen.classList.remove("active");
        console.error("Error fetching weather",err);

    }
}

function renderWeatherInfo(weatherInfo){
//  first fetch elements
 const cityName = document.querySelector("[data-cityName]");
 const countryIcon = document.querySelector("[data-countryIcon]");
 const desc = document.querySelector("[data-weatherDesc]");
 const weatherIcon = document.querySelector("[data-weatherIcon]");
 const temp = document.querySelector("[data-temp]");
 const windspeed = document.querySelector("[data-windspeed]");
 const humidity = document.querySelector("[data-humidity]");
 const cloudiness = document.querySelector("[data-cloudiness]");

//  fetch values from weather info object and put in UI elements
 cityName.innerText=weatherInfo?.name;
 countryIcon.src=`https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`
 desc.innerText=weatherInfo?.weather?.[0]?.description;
 weatherIcon.src=`http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`
 temp.innerText=`${weatherInfo?.main?.temp} °C`;
 windspeed.innerText=`${weatherInfo?.wind?.speed} m/s`;
 humidity.innerText=`${weatherInfo?.main?.humidity} %`;
 cloudiness.innerText=`${weatherInfo?.clouds?.all} %`;
}

function getLocation(){
  // navigator.geolocation is a built in browser API that lets web apps access the users location
  if(navigator.geolocation){
    // browser fetches the current location and calls a function showPosition and passes that position data as an argument
    navigator.geolocation.getCurrentPosition(showPosition);
  }
  else{
    // show an alert for no geolocation support available
    alert("Geolocation is not supported bby your browser");
  }
}

function showPosition(position){
    const userCoordinates={
        lat:position.coords.latitude,
        lon:position.coords.longitude,
    }
    console.log(userCoordinates);
    sessionStorage.setItem("user-coordinates",JSON.stringify(userCoordinates));
    fetchUserWeatherInfo(userCoordinates);
}

const grantAccessButton=document.querySelector("[data-grantAccess]");
grantAccessButton.addEventListener('click',getLocation);

let searchInput=document.querySelector("[data-searchInput]");
searchForm.addEventListener('submit',(e)=>{
    e.preventDefault();
    if(searchInput.value===""){
        return;
    }

    fetchSearchWeatherInfo(searchInput.value);
});

async function fetchSearchWeatherInfo(city){
   loadingScreen.classList.add("active");
   userInfoContainer.classList.remove("active");
   grantAccessContainer.classList.remove("active");
   errorMsgContainer.classList.remove("active");

   try{
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
    const data=await response.json();
    loadingScreen.classList.remove("active");
    if(data?.cod==="404"){
      errorMsgContainer.classList.add("active");
    }
    else{
    userInfoContainer.classList.add("active");
    renderWeatherInfo(data);
    }

   }
   catch(err){
     console.error("Error displaying weather",err);
   }
}

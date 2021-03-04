const proxy = 'https://api.codetabs.com/v1/proxy/?quest=';


const coutriesEndpoint = 'https://restcountries.herokuapp.com/api/v1';
const covidStats = 'https://corona-api.com/countries';
const continents = document.querySelector('.continents');
//general get api function
async function getApiData(url) {
    let callApi = await fetch(url);
    let data = await callApi.json();
    return data;
}
//get all countries
async function getCountries() {
    let dataArr = await getApiData(`${proxy}${coutriesEndpoint}`);
    console.log(dataArr)
}
//getCountries()
//get object with name and continet of coutry 
async function getCountryByContinent(continent) {
    let dataArr = await getApiData(`${proxy}${coutriesEndpoint}`);
    //console.log(dataArr)
    let countryByContinentArr=[];
    let countryByContinent = await Promise.all(
        dataArr.map(async (c) => {
            //console.log(c.region)
            if (c.region === continent) {
                countryByContinentArr.push({name: c.name.common, continent: c.region})
            }
        })
    )
    console.log(countryByContinentArr)
}



async function getCovidStats() {
    let data = await getApiData(`${proxy}${covidStats}`);
    let dataArr = data.data
    //console.log(dataArr)
    let covidInfo = await Promise.all(
        dataArr.map(async (c) => {
            return {
                name: c.name, confirmed: c.latest_data.confirmed, deaths: c.latest_data.deaths,
                recovered: c.latest_data.recovered, critical: c.latest_data.critical
            }
        })
    )
    //console.log(covidInfo)
    return covidInfo;
}
getCovidStats()

continents.addEventListener('click',async (e) => {
    await getCountryByContinent(e.target.classList[0])
});
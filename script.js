function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min); // The maximum is inclusive and the minimum is inclusive
}

function injectHTML(list) {
  console.log('fired injectHTML');
  const target = document.querySelector('#breach_list');
  target.innerHTML = '';
  list.forEach((item) => {
    item.isVerified = true;
    const str = `<li>${item.Name}: ${item.Description}</li>`;
    target.innerHTML += str;
  });
}

function filterList(list, query) {
  return list.filter((item) => {
    const LCaseName = item.name.toLowerCase();
    const LCaseQuery = query.toLowerCase();
    return LCaseName.includes(LCaseQuery);
  })
}

function processRestaurants(list) {
  console.log('fired breach list');
  const range = [...Array(15).keys()];
  return newArray = range.map((item) => {
    const index = getRandomIntInclusive(0, list.length - 1);
    return list[index]
  });
}

function initChart(chart, object){
  const labels = Object.keys(object);
  const info = Object.keys(object).map((item)=> object[item].length);
  
  return new Chart(chart, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Breaches By Category',
        backgroundColor: 'rgb(255, 99, 132)',
        borderColor: 'rgb(255, 99, 132)',
        data: info
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });

}

function changeChart(chart, object){
  const labels = Object.keys(object);
  const info = Object.keys(object).map((item)=> object[item].length);

  chart.data.labels = labels;
  chart.data.datasets.forEach((dataset) => {
      dataset.data = info;
      return dataset;
  });
  chart.update();
}

async function getData(){
  const url ='https://haveibeenpwned.com/api/v2/breaches';
  const data = await fetch(url);
  const json = await data.json();
  const reply = json.filter((item) => Boolean(item.isVerified=true)).filter((item) => Boolean(item.Name));
  return reply;
}

function shapeDataForChart(array){
  return array.reduce((collection, item)=>{
    if(!collection[item.category]){
      collection[item.category] = [item]
    } else{
      collection[item.category].push(item);
    }
    return collection;
  }, {});
}

async function mainEvent() { 
  // const filterButton = document.querySelector('#filter_button');// Add a querySelector that targets your filter button here
  const loadDataButton = document.querySelector('#data_load');// Add a querySelector that targets your load county data button here
  const clearDataButton = document.querySelector('#data_clear');// Add a querySelector that clears your load county data button here
  const generateListButton = document.querySelector('#generate');// Add a querySelector that targets your generate button here
  const chartTarget = document.querySelector('#myChart');
  const loadAnimation = document.querySelector('#load_animation');
  loadAnimation.style.display = 'none';
  generateListButton.classList.add('hidden');
  const textField = document.querySelector('#breach');
 
  // const carto = initMap();

  const chartData = await getData();
  const shapedData = shapeDataForChart(chartData);
  console.log(shapedData);
  const myChart = initChart(chartTarget, shapedData);

  const storedData = localStorage.getItem('storedData');
  let parsedData = JSON.parse(storedData);
  if (parsedData?.length > 0) {
    generateListButton.classList.remove('hidden');
  }

  //let storedList = [];
  let currentList = []; // this is "scoped" to the main event function

  /* We need to listen to an "event" to have something happen in our page - here we're listening for a "submit" */

  loadDataButton.addEventListener('click', async (submitEvent) => { // async has to be declared on every function that needs to "await" something

    // This prevents your page from becoming a list of 1000 records from the county, even if your form still has an action set on it
    submitEvent.preventDefault();

    // this is substituting for a "breakpoint" - it prints to the browser to tell us we successfully submitted the form
    console.log('loading data...');
    loadAnimation.style.display = 'inline-block';

    // Basic GET request - this replaces the form Action
    const results = await fetch('https://haveibeenpwned.com/api/v2/breaches');


    const storedList = await results.json();
    localStorage.setItem('storedData',JSON.stringify(storedList));
    parsedData = storedList;
    if (parsedData?.length>0){
      generateListButton.classList.remove("hidden");
    }
    loadAnimation.style.display = 'none';
    console.table(storedList);
    injectHTML(storedList);
    const localData = shapeDataForChart(storedList);
    changeChart(myChart, localData);
    
  });

  /**filterButton.addEventListener('click', (event) => {
    console.log('Clicked FilterButton');
    const formData = new FormData(mainForm);
    const formProps = Object.fromEntries(formData);
    console.log(formProps);
    const newList = filterList(currentList, formProps.resto);
    console.log(newList);
    injectHTML(newList);
  })**/

  generateListButton.addEventListener('click', (event) => {
    console.log('generate new list');
    currentList = processRestaurants(chartData);
    console.log(currentList);
    injectHTML(currentList);
    // markerPlace(currentList, carto);
    const localData = shapeDataForChart(currentList);
    changeChart(myChart, localData);
  });

  textField.addEventListener('input', (event) => {
    console.log('input', event.target.value);
    const newList = filterList(currentList, event.target.value);
    console.log(newList);
    injectHTML(newList);
    const localData = shapeDataForChart(newList);
    changeChart(myChart, localData);
  });

  clearDataButton.addEventListener('click', (event)=>{
    console.log('clear browser data');
    localStorage.clear();
    console.log('localStorage Check', localStorage.getItem("storedData"));
  });

}

function initMap (){
  const carto = L.map('map').setView([38.9897, -76.9378], 13);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(carto);
return carto;                   
}

function markerPlace (array, map) {
console.log('array for markers', array);

map.eachLayer((layer) => {
  if (layer instanceof L.Marker) {
    layer.remove();
  }
});

array.forEach((item) => {
console.log('markerPlace', item);
const {coordinates} = item.geocoded_column_1;
L.marker([coordinates[1], coordinates[0]]).addTo(map);
})
}

/*
  This adds an event listener that fires our main event only once our page elements have loaded
  The use of the async keyword means we can "await" events before continuing in our scripts
  In this case, we load some data when the form has submitted
*/
document.addEventListener('DOMContentLoaded', async () => mainEvent()); // the async keyword means we can make API requests

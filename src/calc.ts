const urlData = 'http://localhost:4200/allData' as string;
const avgPriceThirtyTable = document.getElementById('average-price-thirty-table') as HTMLElement;
const topFiveTable = document.getElementById('top-five-table') as HTMLElement;
const avgPriveTable = document.getElementById('average-price-table') as HTMLElement; 
const distTable = document.getElementById('distribution-table') as HTMLElement;

const tableColumn = [
  'Listing Id',
  'Make',
  'Selling Price (€)',
  'Mileage',
  'Seller Type',
  'Total Amount of contacts',
  'Month',
] as string[];

getAllData();

/**
 * fetch data and execute each calculate function
 */
function getAllData() {
  fetch(urlData)
    .then((response) => response.json())
    .then((data) => {
      const dataForFourth = cleanData(data['topFive']);
      const avgPriceThirty = [['Average price'], [`€ ${data['avgThirty']}`]];
      insertFirstTable(data['avgPerSeller']);
      insertSecondTable(data['distByMake']);
      insertThirdTable(avgPriceThirty);
      insertFourthTable(dataForFourth);
    });
}

/**
 * insert first table
 * @param avgPerSeller 
 */
function insertFirstTable(avgPerSeller: string[][]) {
  const insertData = createTable(avgPerSeller);
  avgPriveTable.appendChild(insertData);
}

/**
 * insert second table
 * @param distByMake 
 */
function insertSecondTable(distByMake: string[][]) {
  const insertData = createTable(distByMake);
  distTable.appendChild(insertData);
}

/**
 * insert third table
 * @param avgPriceThirty
 */
function insertThirdTable(avgPriceThirty: string[][]) {
  const insertData = createTable(avgPriceThirty);
  avgPriceThirtyTable.appendChild(insertData);
}

/**
 * insert fourth table
 * @param top5 
 */
function insertFourthTable(top5: string[][]) {
  const insertData = createTable(top5);
  topFiveTable.appendChild(insertData);
}

/**
 * clean data for the fourth table 
 * @param data 
 */
function cleanData(data: string[][]) {
  const arr = [];
  data.map((value: any) => {
    value.map((ele: any) => {
      ele = Object.values(ele);
      if (ele.length === 7) {
        ele[3] = ele[3].substring(1, ele[3].length - 1); // remove ""
        ele[6] = ele[6].substring(1, ele[6].length - 1); // remove ""
        ele.push(ele.splice(1, 1)[0]); // put counts number to the end of array
        ele.push(ele.splice(1, 1)[0]); // put month number to the end of array
        arr.push(ele);
      }
    });
  });
  arr.unshift(tableColumn);
  return arr;
}

/**
 * create Table
 * @param data
 */
function createTable(data: string[][]) {
  var table = document.createElement('table');
  for (var i = 0; i < data.length; i++) {
    var tr = document.createElement('tr');
    for (var j = 0; j < data[i].length; j++) {
      var td = document.createElement('td');
      td.innerText = data[i][j];
      tr.appendChild(td);
    }
    table.appendChild(tr);
  }
  return table;
}

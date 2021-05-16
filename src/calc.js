var urlData = 'http://localhost:4200/allData';
var avgPriceThirtyTable = document.getElementById('average-price-thirty-table');
var topFiveTable = document.getElementById('top-five-table');
var avgPriveTable = document.getElementById('average-price-table');
var distTable = document.getElementById('distribution-table');
var tableColumn = [
    'Listing Id',
    'Make',
    'Selling Price (€)',
    'Mileage',
    'Seller Type',
    'Total Amount of contacts',
    'Month',
];
getAllData();
/**
 * fetch data and execute each calculate function
 */
function getAllData() {
    fetch(urlData)
        .then(function (response) { return response.json(); })
        .then(function (data) {
        var dataForFourth = cleanData(data['topFive']);
        var avgPriceThirty = [['Average price'], ["\u20AC " + data['avgThirty']]];
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
function insertFirstTable(avgPerSeller) {
    var insertData = createTable(avgPerSeller);
    avgPriveTable.appendChild(insertData);
}
/**
 * insert second table
 * @param distByMake
 */
function insertSecondTable(distByMake) {
    var insertData = createTable(distByMake);
    distTable.appendChild(insertData);
}
/**
 * insert third table
 * @param avgPriceThirty
 */
function insertThirdTable(avgPriceThirty) {
    var insertData = createTable(avgPriceThirty);
    avgPriceThirtyTable.appendChild(insertData);
}
/**
 * insert fourth table
 * @param top5
 */
function insertFourthTable(top5) {
    var insertData = createTable(top5);
    topFiveTable.appendChild(insertData);
}
/**
 * clean data for the fourth table
 * @param data
 */
function cleanData(data) {
    var arr = [];
    data.map(function (value) {
        value.map(function (ele) {
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
function createTable(data) {
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

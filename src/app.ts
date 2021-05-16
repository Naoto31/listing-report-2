import express, { Application, Request, Response, NextFunction }from 'express';

const app: Application = express();
const path = require('path');
const fs = require('fs');
const listingsFile = './src/files/listings.csv';
const contactsFile = './src/files/contacts.csv';

app.listen(4200, () => console.log('server running'))

/**
 * reading 2 csv files
 */
fs.readFile(listingsFile, (err: any, listingsFile: any) => {
    return fs.readFile(contactsFile, (err: any, contactsFile: any) => {
        const listingsList = listingsFile.toString().split('\n');
        const contactsList = contactsFile.toString().split('\n');
        const prepObj = prepDataForFirstTwoReport(listingsList);
        const avgListsPerSellerData = getAvgListsPerSeller(prepObj.arr) as any[];
        const distByMakeData = getDistData(prepObj.count, prepObj.arr.length - 2) as any[];
        const avgPriceTopThirtyData = getAvgPriceTopThirty(listingsList, contactsList) as any;

        calcTopFive(contactsList, avgPriceTopThirtyData.arr, avgPriceTopThirtyData.avgThirtyValue, avgListsPerSellerData, distByMakeData);
    });
});

/**
 * prepare data for the first two report
 * @param listingsList 
 */
function prepDataForFirstTwoReport(listingsList: string[]) {
    const csvArray = new Array();
    let counts = {} as any;

    for (var i = 0; i < listingsList.length; i++) {
        csvArray[i] = listingsList[i].split(',');
        // prepare object showing Counts per Make for the second Table
        if (i !== 0 && i !== listingsList.length - 1) {
          counts[listingsList[i].split(',')[1]] = 1 + (counts[listingsList[i].split(',')[1]] || 0);
        }
    }
    return {arr: csvArray, count: counts } ;
}

/**
 * get data of the average listings per seller
 * @param array
 */
function getAvgListsPerSeller(array: string[]) {
    const privateArr = [] as any;
    const dealerArr = [] as any;
    const otherArr = [] as any;
  
    array.map((value: any) => {
      if (value[4] === '"private"') {
        privateArr.push(parseInt(value[2]));
      } else if (value[4] === '"dealer"') {
        dealerArr.push(parseInt(value[2]));
      } else if (value[4] === '"other"') {
        otherArr.push(parseInt(value[2]));
      }
    });
  
    const privateAvg = calcAverage(privateArr) as string;
    const dealerAvg = calcAverage(dealerArr) as string;
    const otherAvg = calcAverage(otherArr) as string;
  
    const avgPriceTable = [
      ['Seller Type', 'Average in Euro'],
      ['private', `€ ${privateAvg}`],
      ['dealer', `€ ${dealerAvg}`],
      ['other', `€ ${otherAvg}`],
    ];

    return avgPriceTable; 
}

/**
 * calc Average for each seller Type
 * @param array 
 */
 function calcAverage(eachArray: any) {
    let totalValue = 0;
    eachArray.map((value:any) => {
        totalValue = totalValue + value;
    });
    return (totalValue / eachArray.length).toFixed(1);
}

/**
 * get Percentual Distribution Data
 * @param counts 
 */
 function getDistData(counts: any, valueLength: number) {
    counts = Object.entries(counts); // from object to array
    counts.map((value: any) => {
      value[0] = value[0].substring(1, value[0].length-1);
      value[1] = ((value[1] / valueLength) * 100).toFixed(1) + '%';
    });
    counts.sort((a: any, b:any) => b[1].substring(0, b[1].length - 1) - a[1].substring(0, a[1].length - 1));
    counts.unshift(['Make', 'Distribution']);
    return counts;
}

/**
 * get data of the average price of the 30% most contacted listings
 * @param listingsList 
 * @param contactsList 
 */
function getAvgPriceTopThirty(listingsList: any, contactsList: any) {
    const thirty = (contactsList.length - 2) * 0.3; // 30% of the list
    const orderCount = {} as any;

        contactsList.forEach((value:any) => {
        orderCount[value.substring(0, 4)] = 1 + (orderCount[value.substring(0, 4)] || 0);
        })    

        const sortable = [];
        for (var value in orderCount) {
            sortable.push([value, orderCount[value]]);
        }
        
        /**
         * 'sortable' looks like ['1006', 141], ['1271', 138], ['1250', 136],...
         */
        sortable.sort(function(a, b) {
        return b[1] - a[1];
        });
        
        // Calculate the index for the 30 % most contacted
        let total = 0;
        let index = 0;
        for (let i = 0; i < sortable.length; i++) {
            if (total < thirty) {
            total = total + sortable[i][1];
            index ++;
            }
        }

        
        /**
         * create data e.g.
         * {id: , make: , price: , ...}, {...}
         */
        const listingsArr = [];
        const columnHeaders = listingsList[0].split(',');
        for(let i = 1; i < listingsList.length; i++) {
            const data = listingsList[i].split(',');
            let obj = {} as any;
            for(var j = 0; j < data.length; j++) {
                obj[columnHeaders[j]] = data[j];
            }
            listingsArr.push(obj);
        }

        const calcObj = {} as any;

        listingsArr.map(value => {
            calcObj[value['"id"']] = parseInt(value['"price"']);
        })

        let totalPrice = 0;
        for (let i = 0; i <= index; i++) {
            totalPrice = totalPrice + calcObj[sortable[i][0]];
        }

        const avg = (totalPrice / index).toFixed(1) as string; // average of the 30% most contacted listings
        return {arr: listingsArr, avgThirtyValue: avg}
}

/**
 * Calculate the top 5 most contacted listings per month
 * @param contactsList 
 * @param listingsArr 
 * @param avg 
 * @param avgListsPerSellerData 
 * @param distByMakeData 
 */
function calcTopFive(contactsList: string[], listingsArr: {}[], avg: string, avgListsPerSellerData: any, distByMakeData: any) {
    let arrayObjects = [] as any;
    contactsList.forEach((value:any) => {
      const date = (new Date(parseInt(value.substring(value.indexOf(',') + 1))));
      const month = date.getFullYear() + '-' + (date.getMonth()+1)
      const data = {
          id: value.substring(0, 4),
          date: month
      }
      arrayObjects.push(data)
    })    

    /**
     * newArrayOfObjects: 
     * { id: '1000', date: '2020-5', count: 13 }, 
     * { id: '1001', date: '2020-4', count: 32 },...
     */
    let newArrayOfObjects = Object.values(arrayObjects.reduce((mapping: any, item: any) => {
        const { [item.id]:matchingItem } = mapping;
        // If matching item found, increment the count
        if(matchingItem) {
          matchingItem.count ++;
        }
        else {
          mapping[ item.id ] = { ...item, count : 1 };
        }
        return mapping;
    },{}));
    
    /**
     * prepObj: {'2020-5': [{ id: '1000', count: 13 },{ id: '1005', count: 81 }...
     */
    let prepObj = {} as any; 
    newArrayOfObjects.map((value: any) => {
        if (!prepObj[value.date]) {
            prepObj[value.date] = [{id: value.id, count: value.count}];
        } else {
            prepObj[value.date].push({id : value.id, count: value.count});
        }
    })
      
    const topFiveObj = {} as any;
    for (const [key, value] of Object.entries(prepObj)) { 
        let data = value as any;
        data.sort((a: any, b: any) => (b.count) - (a.count));
        const fiveHighest = data.slice(0, 5); 
        topFiveObj[key] = fiveHighest;
    }   

    const finalObj = {} as any;
    listingsArr.map((value: any) => {
        for (const [key, prop] of Object.entries(topFiveObj)) { 
            let data = prop as any;
            data.map((ele: any) => {
                if (value['"id"'] === ele.id) {
                    ele.date = key;
                    ele.make = value['"make"'];
                    ele.price = value['"price"'];
                    ele.mileage = value['"mileage"'];
                    ele.sellerType = value['"seller_type"'];
                }
            })   
            finalObj[key] = data;  
        }
    })

    const ordered = Object.keys(finalObj).sort().reduce(
        (obj:any, key:any) => { 
          obj[key] = finalObj[key]; 
          return obj;
        }, 
        {}
    );

    app.use("/src", express.static('./src/'));
    
    app.get('/', (req: Request, res: Response, next: NextFunction) => {
        res.sendFile(path.join(__dirname, '/index.html'));
    })

    /**
     * send the all data
     */
    app.get('/allData', (req, res) => {
        return res.send({avgPerSeller: avgListsPerSellerData, distByMake: distByMakeData, topFive: Object.values(ordered), avgThirty: avg});
    });       
}

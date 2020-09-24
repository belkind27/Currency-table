var coins;
var db;
var objectStore;

$(document).ready(function () {
    init();
});
function init() {
    var stringDate = localStorage.getItem('update');
    DateDiv(stringDate);
    if (stringDate === null) {
        GetUpdate();
    }
    else {
        var date = new Date(stringDate);
        var today = CurrentDate();
        if (today > date) {
            //UploadDb();
            GetUpdate();
            DrawGraph1();
            DrawGraph2();
        }
        else {
            UploadDb();
        }
    }

};
function GetUpdate() {
    coins = [];
    Ajax();
    UpdateDb();
}
function CurrentDate() {
    var m = new Date();
    var CurrentdateString =
        m.getUTCFullYear() + "-" +
        ("0" + (m.getUTCMonth() + 1)).slice(-2) + "-" +
        ("0" + m.getUTCDate()).slice(-2);
    var date = new Date(CurrentdateString);
    return date;
}
function UploadDb() {
    Modernizr.on('indexeddb', function (isSupported) {
        if (isSupported) {
            var indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB;
            openCurrencyDatabase(function (onsuccessResult) {
                db = onsuccessResult;
                loadCurrency();
            });
        } else {
            console.log('IndexedDb not supported! :(');
        }
    });
}
function showCurrency(Coin) {
    var num = Coin.change;
    var str = `${Coin.change}`;
    var res;
    if (num > 0) res = str.fontcolor("green");
    else if (num < 0) res = str.fontcolor("red");
    else res = str.fontcolor("black");
    $("#tableC").append(
        $("<tr/>")
            .append($("<td />").html(Coin.name))
            .append($("<td />").html(Coin.unit))
            .append($("<td />").html(Coin.code))
            .append($("<td />").html(Coin.country))
            .append($("<td />").html(Coin.rate))
            .append($("<td />").html(res))
    )
}
function UpdateDb() {
    openCurrencyDatabase(function (onsuccessResult) {
        db = onsuccessResult;
        load();
    });

}
function openCurrencyDatabase(successCallback) {
    var openRequest = indexedDB.open("CurrencyDatabase");

    openRequest.onerror = function (event) {
        console.log('openCurrencyDatabase > onerror');
        console.log('DB error code: ' + event.target.errorCode);
    };

    openRequest.onsuccess = function (event) {
        console.log('openCurrencyDatabase > onsuccess');
        successCallback(openRequest.result);
    }

    openRequest.onupgradeneeded = function (event) {
        console.log('openCurrencyDatabase > onupgradeneeded');

        var _db = event.target.result;
        objectStore = _db.createObjectStore('currency', { keyPath: 'code' });
    }
}
function load() {
    var transaction = db.transaction(['currency'], "readwrite");
    transaction.oncomplete = function (event) {
        console.log("Transaction completed");
    }
    transaction.onerror = function (event) {
        console.log("Transaction failed");
    }

    objectStore = transaction.objectStore("currency");
    objectStore.clear();
    Add();


}
function Add() {
    for (let index = 0; index < coins.length; index++) {
        const element = coins[index];
        objectStore.add({
            name: element.name, unit: element.unit, code: element.code,
            country: element.country, rate: element.rate, change: element.change
        });
    }
}
function Ajax() {
    $.ajax("https://localhost:44389/api/Values", {
        dataType: "xml",
        async: false,
        success: function (data) {
            var date = $(data).find("CURRENCIES").find("LAST_UPDATE").text();
            localStorage.setItem('update', date);
            $(data).find("CURRENCY")
                .each(function () {
                    const coin = $(this);
                    const Coin = {
                        name: coin.find("NAME").text(),
                        unit: coin.find("UNIT").text(),
                        code: coin.find("CURRENCYCODE").text(),
                        country: coin.find("COUNTRY").text(),
                        rate: parseFloat(coin.find("RATE").text()),
                        change: parseFloat(coin.find("CHANGE").text())
                    };
                    coins.push(Coin);
                    showCurrency(Coin);
                })
        }

    });
}
function DrawGraph1() {
    coins.sort((a, b) => { return a.rate - b.rate });
    const canvas = document.getElementById("graph1container");
    var header = canvas.getContext("2d");
    header.font = "50px Arial bold";
    header.fillText("rate graph", 200, 50);
    var x = 15;
    const h= graph1Height(coins[coins.length-1]);
    for (let index = 0; index < coins.length; index++) {
        const element = coins[index];
        var ctx2 = canvas.getContext("2d");
        ctx2.font = "10px Arial bold";
        ctx2.fillText(element.code, x - 10, 380 - element.rate * h);
        var ctx1 = canvas.getContext("2d");
        ctx1.lineWidth = 37;
        ctx1.strokeStyle = "#5f9ea0";
        ctx1.beginPath();
        ctx1.moveTo(x, 400);
        ctx1.lineTo(x, 400 - element.rate * h);
        ctx1.stroke();
        ctx1.closePath();
        x += 47;
    }
    var ctx3= canvas.getContext("2d");
    ctx3.lineWidth = 3;
    ctx3.beginPath();
    ctx3.moveTo(690,400);
    ctx3.strokeStyle = "#000000";
    ctx3.lineTo(690, 60);
    ctx3.stroke();
    ctx3.closePath();
    var num=0.5;
    for (let index = 0; index < 10; index++) {
     var ctx4=canvas.getContext("2d");
     ctx2.font = "10px Arial bold";
     ctx2.fillText(num,650, 400-num*h);
     var ctx5= canvas.getContext("2d");
     ctx5.lineWidth = 3;
     ctx5.beginPath();
     ctx5.moveTo(670,400-num*h);
     ctx5.strokeStyle = "#000000";
     ctx5.lineTo(690, 400-num*h);
     ctx5.stroke();
     ctx5.closePath();
     num+=0.5;
    }

}
function DrawGraph2() {
    const canvas = document.getElementById("graph2container");
    var header = canvas.getContext("2d");
    header.font = "50px Arial bold";
    header.fillText("changes graph", 200, 50);
    var x = 15;
    var f=()=>{
        coins.sort((a, b) => { return a.change - b.change });
        return 100/coins[coins.length-1].change;
    }
    var h=f();
    for (let index = 0; index < coins.length; index++) {
        const element = coins[index];
        var ctx2 = canvas.getContext("2d");
        ctx2.font = "10px Arial bold";
        var ctx1 = canvas.getContext("2d");
        ctx1.lineWidth = 37;
        var extra;
        if (element.change > 0) {
            ctx1.strokeStyle = "#228b22";
            extra = -20;
        }
        else {
            ctx1.strokeStyle = "#ff0000";
            extra = 20;
        }
        ctx2.fillText(element.code, x - 10, 250 + extra - element.change * h);
        ctx1.beginPath();
        ctx1.moveTo(x, 250);
        ctx1.lineTo(x, 250 - element.change * h);
        ctx1.stroke();
        ctx1.closePath();
        x += 47;
    }
    var ctx3= canvas.getContext("2d");
    ctx3.lineWidth = 2;
    ctx3.beginPath();
    ctx3.moveTo(0,250);
    ctx3.strokeStyle = "#000000";
    ctx3.lineTo(x, 250);
    ctx3.stroke();
    ctx3.closePath();
}
function loadCurrency() {
    coins = [];
    var transaction = db.transaction(["currency"], "readonly");
    transaction.oncomplete = function (event) {
        console.log("Transaction completed");
    }
    transaction.onerror = function (event) {
        console.log("Transaction failed");
        GetUpdate();
    }
    objectStore = transaction.objectStore("currency");
    var cursorRequest = objectStore.openCursor();

    cursorRequest.onerror = function (error) {
        console.log(error);
    }

    cursorRequest.onsuccess = function (event) {
        
        var cursor = event.target.result;
        if (cursor) {
            showCurrency(cursor.value);
            coins.push(cursor.value);
            cursor.continue();
        }
        else{
            if(coins.length===0)
            {
                GetUpdate(); 
            }
            DrawGraph1();
            DrawGraph2();
        }
    }

}
function DateDiv(date)
{
const div=document.getElementById("date");
div.innerHTML="last date of update: "+date;
}
function graph1Height(coin)
{
  return 300/coin.rate
}

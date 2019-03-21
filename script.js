'use strict';
let mineField = document.getElementsByClassName('mineField')[0];
let Height = null;
let Width = null;
let QuantityMine = null;
let matrixField = [];//массив матрица
let SomeFlag = null;


//______________________________вспомогательные функции_______________________________________________________

// функция простого рандома
let randomVal = function (value) {
    return Math.floor(Math.random() * ((value + 1) - 0))
};

// функция конструктор содержимого ячеек
let SquareInfo = function (y, x, open, bombs, flags, bombstep) {
    this.y = y;
    this.x = x;
    this.open = open;
    this.bombs = bombs;
    this.flags = flags;
    this.bombstep = bombstep;
};
// функция создание логической матрицы
let matrix = function () {
    matrixField.length = 0;
    let matrixLine = [];
    for (let i = 0; i < Height; i++) {
        matrixLine = [];
        matrixField.push(matrixLine);
        for (let ii = 0; ii < Width; ii++) {
            matrixLine.push(new SquareInfo(i, ii, 0, 0, 0, 0));
        }
    }
    return matrixField
};

// функция сoздания мин

const newBomb = function () {
    let elem;
    QuantityMine = Number(document.getElementsByClassName('quantityMine')[0].value);
    document.getElementsByClassName('total')[0].value = QuantityMine;
    for (let i = 0; i < QuantityMine; i++) {
        let x = randomVal(Width - 1);
        let y = randomVal(Height - 1);
        elem = matrixField[y][x];
        if (elem['bombs'] === 0) {
            elem.bombs = elem.bombs + 1;
            mineField.children[y].children[x].classList.add('bomb');
        } else i = i - 1;
    }
};

//Функция победы;
let checkCloseMine = function () {
    let closeArr = [];
    matrixField.filter((elem) => elem.forEach((x) => (x.open === 0) ? closeArr.push(x) : false));
    if (closeArr.length == QuantityMine) {
        let newText = document.createElement('p');
        newText.className='textInfo'
        newText.innerHTML = 'YOU WIN';
        mineField.appendChild(newText);
        closeArr.forEach((value) =>
            mineField.children[value.y].children[value.x].children[0].style.display = 'none')
    }
};

//Функция поражения;
let fatalStep = function () {
    let bombArr = [];
    matrixField.filter((elem) => elem.forEach((x) => (x.bombs === 1) ? bombArr.push(x) : false));
    bombArr.forEach((value) =>
        mineField.children[value.y].children[value.x].children[0].style.display = 'none')

}

// функция установки обработчиков событий
let eventListener = function () {
    // обработчик событий клика по ячейке
    mineField.addEventListener('click', function () {
        let top = Number(event.target.parentNode.id.split('.')[0]);
        let left = Number(event.target.parentNode.id.split('.')[1]);
        if (event.target.parentNode.classList.contains('bomb') && event.target.tagName === 'IMG') {
            fatalStep()
            event.target.style.display = 'none';
            event.target.parentNode.style.backgroundImage = 'url(img/isMine.png)';
            document.getElementsByClassName('smill')[0].src = 'img/emoji2.png';
            let newText = document.createElement('p');
            newText.className='textInfo';
            newText.innerHTML = 'YOU LOSE';
            mineField.appendChild(newText);
            mineField.style.pointerEvents = 'none';
        }
        else {
            checkFreePosition(top, left) // запуск функции поиска смежных пустых ячеек по клику

        }
        checkCloseMine();
    });
    // обработчик событий клика для установки флага
    mineField.addEventListener('contextmenu', function () {
        let top = Number(event.target.parentNode.id.split('.')[0]);
        let left = Number(event.target.parentNode.id.split('.')[1]);
        if (event.target.tagName === 'IMG' && SomeFlag < QuantityMine && matrixField[top][left].flags === 0) {
            event.target.src = 'img/flagPosition.jpg';
            matrixField[top][left].flags = 1;
            SomeFlag += 1;
            console.log(SomeFlag);
        }
        else if (SomeFlag > 0 && matrixField[top][left].flags === 1) {
            event.target.src = "img/cell.jpg";
            matrixField[top][left].flags = matrixField[top][left].flags - 1;
            SomeFlag = SomeFlag - 1
        }
        document.getElementsByClassName('flag')[0].value = SomeFlag;

    });
};


//функционал выставления количества смежных количеств мин

// проверка по оси 'X'
let checkPositionOnWigth = function (left, y) {
    let x = left - 1;
    for (let i = 0; i < 3; i++) {
        if (x >= 0 && x <= Width - 1) {
            if (matrixField[y][x].bombs === 0) {
                matrixField[y][x].bombstep += 1;
                x += 1
            } else x += 1;
        } else x += 1;
    }
};
// проверка по оси 'Y' с запуском внутри checkPositionOnWigth  функции проверки по оси 'X'
let checkPositionOnHeight = function (left, top) {
    let y = top - 1, x = left;
    for (let i = 0; i < 3; i++) {
        if (y >= 0 && y <= Height - 1) {
            checkPositionOnWigth(left, y);//вызов проверки по оси 'X'
            y += 1
        } else {
            y += 1;
        }

    }
};

// функция проставления количества окружающих мин
let quantityMine = function () {
    let mineArray = [];
    matrixField.filter((elem) => elem.forEach((x) => (x['bombs'] === 1) ? mineArray.push(x) : false));
    mineArray.forEach((obj) => checkPositionOnHeight(obj.x, obj.y));
    matrixField.filter((elem) => elem.forEach((obj) => (obj['bombstep'] !== 0) ?
        mineField.children[obj['y']].children[obj['x']].style.backgroundImage = 'url(img/' + obj['bombstep'] + '.png)' :
        false));
};

//функчия поиска смежных пустых ячеек по клику
let checkFreePosition = function (y, x) {
    if (matrixField[y][x].bombs === 0 && matrixField[y][x].bombstep === 0 && matrixField[y][x].open === 0 &&
        matrixField[y][x].flags === 0) {
        matrixField[y][x].open = 1;
        mineField.children[y].children[x].children[0].style.display = 'none';
        if (y !== 0) {
            checkFreePosition(y - 1, x);
        }
        if (x < Width - 1) {
            checkFreePosition(y, x + 1);
        }
        if (y < Height - 1) {
            checkFreePosition(y + 1, x);
        }
        if (x !== 0) {
            checkFreePosition(y, x - 1);
        }
    }
    else if (matrixField[y][x].bombstep > 0 && matrixField[y][x].open === 0 && matrixField[y][x].flags === 0) {
        matrixField[y][x].open = 1;
        mineField.children[y].children[x].children[0].style.display = 'none'
    }
};
//  ______________________________________запуск основной функции старта игры _______________________________

//функция  создание визуального поля
let createField = function () {
    document.getElementsByClassName('smill')[0].src = 'img/smiley.png';
    mineField.removeAttribute("style");
    mineField.innerHTML = "";
    SomeFlag = 0;
    document.getElementsByClassName('flag')[0].value = 0;

    Height = Number(document.getElementsByClassName('heightField')[0].value);
    Width = Number(document.getElementsByClassName('widthField')[0].value);
    for (let i = 0; i < Height; i++) {
        let newLine = document.createElement('div');
        newLine.style.width = '100%';
        newLine.style.display = 'flex';
        newLine.style.justifyContent = "center";
        mineField.appendChild(newLine);

        for (let ii = 0; ii < Width; ii++) {
            let newSquare = document.createElement('div');
            newSquare.id = i + '.' + ii;
            newSquare.className = "newSquare";
            newLine.appendChild(newSquare);

            let img = document.createElement('img');
            img.src = "img/cell.jpg";
            img.style.width = '20px';
            img.style.zIndex = '4';
            newSquare.appendChild(img);
        }
    }
    document.getElementsByClassName('InputField')[0].style.display = 'none';

    // запуск сопутствующих функций
    matrix(); // вызов фуекции создания матрицы
    newBomb(); //вызов функции создания мин
    quantityMine(); //вызов функции проставления значений количества окружающих мин
    mineField.oncontextmenu = function () {  //отключение контекстного меню правой кнопки мыши
        return false
    };
};
eventListener();










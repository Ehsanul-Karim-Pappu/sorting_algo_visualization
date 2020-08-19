/**************************************************************
************************Bubble Sort****************************
**************************************************************/

let bubble = {
    i : 0,
    j : 0,
    flag : false
}

function bubble_sort() {
    bubble.flag = true;

    // draw the array element after every swap
    for (let k = 0; k < array.length; k++) {
        // if sorted, then fill with green color
        if (k >= array.length - bubble.j) fill(0, 255, 0);
        // draw the swapping element with red color
        else if (k == bubble.i) fill(255, 0, 0);
        // else fill with white color
        else fill(255, 255, 255);
        rect(20 + k * gap, 10, 10, array[k], 3);
    }

    if (array[bubble.i] > array[bubble.i + 1]) {
        let temp = null;
        temp = array[bubble.i];
        array[bubble.i] = array[bubble.i + 1];
        array[bubble.i + 1] = temp;
    }
    bubble.i++;
    // condition for inner loop
    if (bubble.i >= array.length - 1 - bubble.j) {
        bubble.j++;
        bubble.i = 0;
    }
    // condition for outter loop
    if (bubble.j > array.length) {
        bubble.flag = false;
        noLoop();
    }
}


let _bubble = {
    i : 0,
    j : 0,
    flag : false
}
let flag = false;
function bubble_sort_halka_valo() {
    _bubble.flag = true;

    // draw the array element after every swap
    for (let k = 0; k < array.length; k++) {
        // if sorted, then fill with green color
        if (k >= array.length - _bubble.j) fill(0, 255, 0);
        // draw the swapping element with red color
        else if (k == _bubble.i) fill(255, 0, 0);
        // else fill with white color
        else fill(255, 255, 255);
        rect(20 + k * gap, 10, 10, array[k], 3);
    }

    if (array[_bubble.i] > array[_bubble.i + 1]) {
        let temp = null;
        temp = array[_bubble.i];
        array[_bubble.i] = array[_bubble.i + 1];
        array[_bubble.i + 1] = temp;
        flag = true;
    }
    _bubble.i++;
    // condition for inner loop
    if (_bubble.i >= array.length - 1 - _bubble.j) {
        if (!flag) {
            _bubble.flag = false;
            for (let k = 0; k < array.length; k++) {
                fill(0, 255, 0);
                rect(20 + k * gap, 10, 10, array[k], 3);
            }
            noLoop();
        }
        _bubble.j++;
        flag = false;
        _bubble.i = 0;
    }
    // condition for outter loop
    if (_bubble.j > array.length) {
        _bubble.flag = false;
        noLoop();
    }
}



/**************************************************************
************************Selection Sort*************************
**************************************************************/

let selection = {
    i : 0,
    j : 1,
    index_min : 0,
    flag : false
}
function selection_sort() {
    selection.flag = true;

    // draw the array element after every swap
    for (let k = 0; k < array.length; k++) {
        // draw the current min element with blue color
        if (k == selection.index_min) fill(0, 0, 255);
        // draw the sorted element with green color;
        else if (k < selection.i) fill(0, 255, 0);
        // draw the current element with red color
        else if (k == selection.j) fill(255, 0, 0);
        // else fill with white color
        else fill(255, 255, 255);
        rect(20 + k * gap, 10, 10, array[k], 3);
    }

    if (array[selection.j] < array[selection.index_min]) {
        selection.index_min = selection.j;
    }
    selection.j++;
    // condition for inner loop
    if (selection.j >= array.length) {
        if (selection.index_min != selection.i) {
            let temp = null;
            temp = array[selection.i];
            array[selection.i] = array[selection.index_min];
            array[selection.index_min] = temp;
        }
        selection.i++;
        selection.j = selection.i + 1;
        selection.index_min = selection.i;
    }
    // condition for outter loop
    if (selection.i > array.length) {
        selection.flag = false;
        noLoop();
    }
}



/**************************************************************
************************Insertion Sort*************************
**************************************************************/

let insertion = {
    i : 1,
    j : 0,
    temp : null,
    flag : false
}

let t = true;
function insertion_sort() {
    insertion.flag = true;
    if (t) {  //nahole array[1] undefined astechilo..karon insertion.temp global var
        insertion.temp = array[1];
        t = false;
    }
    // draw the array element after every insertion
    for (let k = 0; k < array.length; k++) {
        if (k == insertion.i) {
            stroke(0);
            fill(255, 255, 0);
        }
        else if (k == insertion.j) {
            stroke(0);
            fill(255, 0, 0);
        }
        else if (k == insertion.j + 1) {
            noStroke(0);
            fill(100);
        }
        else if (k < insertion.i) {
            stroke(0);
            fill(0, 255, 0);
        }
        else {
            stroke(0);
            fill(255, 255, 255);
        }
        rect(20 + k * gap, 10, 10, array[k], 3);
    }

    if (insertion.j >= 0 && array[insertion.j] > insertion.temp) {
        array[insertion.j + 1] = array[insertion.j];
        insertion.j--;
    }
    else {
        array[insertion.j + 1] = insertion.temp;
        insertion.i++;
        insertion.temp = array[insertion.i];
        insertion.j = insertion.i - 1;
    }

    if (insertion.i >=   array.length) {
        insertion.flag = false;
        for (let k = 0; k < array.length; k++) {
            stroke(0);
            fill(0, 255, 0);
            rect(20 + k * gap, 10, 10, array[k], 3);
        }
        noLoop();
    }
}

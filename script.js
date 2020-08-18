let array = [];

function setup() {
    createCanvas(650, 400);
    for (let i = 0; i < 41; i++) {
        array.push(int(map(random(1, 100), 1, 100, 30, height - 30)));
    }
    frameRate(30);
}

function draw() {
    background(100);
    bubble_sort();
}

// bubble sort
let gap = 15;
let i = 0, j = 0;
let flag = null;

function bubble_sort() {
    // draw the array element after every swap
    for (let k = 0; k < array.length; k++) {
        // if sorted, then fill with green color
        if (k >= array.length - j) fill(0, 255, 0);
        // draw the swapping element with red color
        else if (k == i) fill(255, 0, 0);
        // else fill with white color
        else fill(255, 255, 255);
        rect(20 + k * gap, 10, 10, array[k], 3);
    }

    if (array[i] > array[i + 1]) {
        let temp = null;
        temp = array[i];
        array[i] = array[i + 1];
        array[i + 1] = temp;
    }
    i++;
    // condition for inner loop
    if (i >= array.length - 1 - j) {
        i = 0;
        j++;
    }
    // condition for outter loop
    if (j > array.length) noLoop();
}

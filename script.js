let array = [];
let arraySize = 41;
let gap = 15;

function setup() {
    createCanvas(650, 400);

    // slider
    slider = createSlider(1, 60, 30, 1);
    slider.position(25, 420);
    slider.size(600, 15);
    // start with default slider value
    frameRate(slider.value());

    // constructing a array
    newArray = createButton('Construct default array');
    newArray.position(15, 450);
    newArray.mousePressed(createDefaultArray);

    newArray = createButton('Construct a random array');
    newArray.position(180, 450);
    newArray.mousePressed(createArray);

    newArray = createButton('Construct an ascending array');
    newArray.position(360, 450);
    newArray.mousePressed(createAscendingArray);

    newArray = createButton('Construct a descending array');
    newArray.position(560, 450);
    newArray.mousePressed(createDescendingArray);

    // bubble sort button
    buttonBubble = createButton('Bubble Sort');
    buttonBubble.position(15, 480);
    buttonBubble.mousePressed(bubble_sort);
    buttonBubble = createButton('Bubble Sort(halka valo)');
    buttonBubble.position(15, 510);
    buttonBubble.mousePressed(bubble_sort_halka_valo);

    // selection sort button
    buttonSelection = createButton('Selection Sort');
    buttonSelection.position(120, 480);
    buttonSelection.mousePressed(selection_sort);

    // insertion sort button
    buttonInsertion = createButton('Insertion Sort');
    buttonInsertion.position(240, 480);
    buttonInsertion.mousePressed(insertion_sort);
}

function draw() {
    background(100);
    if (array.length == 0) {
        fill(255, 255, 255);
        textSize(25);
        textAlign(CENTER);
        text('Construct an array first', width / 2, height / 2);
    }
    else {
        frameRate(slider.value());
        if (bubble.flag && !selection.flag && !insertion.flag) {
            bubble_sort();
        }
        else if (_bubble.flag && !selection.flag && !insertion.flag) {
            bubble_sort_halka_valo();
        }
        else if (selection.flag && !bubble.flag && !insertion.flag) {
            selection_sort();
        }
        else if (insertion.flag && !bubble.flag && !selection.flag) {
            insertion_sort();
        }
        else {
            for (let i = 0; i < array.length; i++) {
                fill(255);
                rect(20 + i * gap, 10, 10, array[i], 3);
            }
        }
    }
}


function createDefaultArray() {
    reset();
    // constructing a random array
    array = [int(map(5, 1, 40, 30, height - 30)),int(map(9, 1, 40, 30, height - 30)),int(map(1, 1, 40, 30, height - 30)),int(map(18, 1, 40, 30, height - 30)),int(map(32, 1, 40, 30, height - 30)),int(map(4, 1, 40, 30, height - 30)),int(map(15, 1, 40, 30, height - 30)),int(map(25, 1, 40, 30, height - 30)),int(map(30, 1, 40, 30, height - 30)),int(map(20, 1, 40, 30, height - 30)),int(map(40, 1, 40, 30, height - 30)),int(map(1, 1, 40, 30, height - 30)),int(map(38, 1, 40, 30, height - 30)),int(map(11, 1, 40, 30, height - 30)),int(map(16, 1, 40, 30, height - 30)),int(map(3, 1, 40, 30, height - 30)),int(map(29, 1, 40, 30, height - 30)),int(map(25, 1, 40, 30, height - 30)),int(map(30, 1, 40, 30, height - 30)),int(map(20, 1, 40, 30, height - 30)),int(map(10, 1, 40, 30, height - 30)),int(map(2, 1, 40, 30, height - 30)),int(map(38, 1, 40, 30, height - 30)),int(map(34, 1, 40, 30, height - 30)),int(map(18, 1, 40, 30, height - 30)),int(map(13, 1, 40, 30, height - 30)),int(map(23, 1, 40, 30, height - 30)),int(map(9, 1, 40, 30, height - 30)),int(map(28, 1, 40, 30, height - 30)),int(map(8, 1, 40, 30, height - 30)),int(map(7, 1, 40, 30, height - 30)),int(map(19, 1, 40, 30, height - 30)),int(map(21, 1, 40, 30, height - 30)),int(map(31, 1, 40, 30, height - 30)),int(map(35, 1, 40, 30, height - 30)),int(map(14, 1, 40, 30, height - 30)),int(map(17, 1, 40, 30, height - 30)),int(map(33, 1, 40, 30, height - 30)),int(map(31, 1, 40, 30, height - 30)),int(map(22, 1, 40, 30, height - 30)),int(map(6, 1, 40, 30, height - 30))]
    for (let i = 0; i < arraySize; i++) {
        fill(255);
        rect(20 + i * gap, 10, 10, array[i], 3);
    }
}

function createAscendingArray() {
    reset();
    // constructing a random array
    for (let i = 0; i < arraySize; i++) {
        array.push(int(map(i, 1, arraySize, 30, height - 30)));
        fill(255);
        rect(20 + i * gap, 10, 10, array[i], 3);
    }
}

function createDescendingArray() {
    reset();
    // constructing a random array
    for (let i = 0; i < arraySize; i++) {
        array.push(int(map(arraySize - i, 1, arraySize, 30, height - 30)));
        fill(255);
        rect(20 + i * gap, 10, 10, array[i], 3);
    }
}


function createArray() {
    reset();
    // constructing a random array
    for (let i = 0; i < arraySize; i++) {
        array.push(int(map(random(1, 100), 1, 100, 30, height - 30)));
        fill(255);
        rect(20 + i * gap, 10, 10, array[i], 3);
    }
}


function reset() {
    loop();
    // clear the array
    array = [];
    // clear the bubble variables
    bubble.i = 0;
    bubble.j = 0;
    bubble.flag = false;

    _bubble.i = 0;
    _bubble.j = 0;
    _bubble.flag = false;

    // clear the selection variables
    selection.i = 0;
    selection.j = 1;
    selection.index_min = 0
    selection.flag = false;

    // clear the insertion variables
    insertion.i = 1;
    insertion.j = 0;
    insertion.flag = false;
    t = true;
}

let array = [];
let iteration = 0;
let gap = 15;

let it = null;

function setup() {
    createCanvas(650, 400);

    array = [int(map(5, 1, 41, 30, height - 30)),int(map(26, 1, 41, 30, height - 30)),int(map(40, 1, 41, 30, height - 30)),int(map(12, 1, 41, 30, height - 30)),int(map(32, 1, 41, 30, height - 30)),int(map(4, 1, 41, 30, height - 30)),int(map(15, 1, 41, 30, height - 30)),int(map(25, 1, 41, 30, height - 30)),int(map(36, 1, 41, 30, height - 30)),int(map(27, 1, 41, 30, height - 30)),int(map(41, 1, 41, 30, height - 30)),int(map(1, 1, 41, 30, height - 30)),int(map(38, 1, 41, 30, height - 30)),int(map(11, 1, 41, 30, height - 30)),int(map(16, 1, 41, 30, height - 30)),int(map(3, 1, 41, 30, height - 30)),int(map(29, 1, 41, 30, height - 30)),int(map(24, 1, 41, 30, height - 30)),int(map(30, 1, 41, 30, height - 30)),int(map(20, 1, 41, 30, height - 30)),int(map(10, 1, 41, 30, height - 30)),int(map(2, 1, 41, 30, height - 30)),int(map(39, 1, 41, 30, height - 30)),int(map(34, 1, 41, 30, height - 30)),int(map(18, 1, 41, 30, height - 30)),int(map(13, 1, 41, 30, height - 30)),int(map(23, 1, 41, 30, height - 30)),int(map(9, 1, 41, 30, height - 30)),int(map(28, 1, 41, 30, height - 30)),int(map(8, 1, 41, 30, height - 30)),int(map(7, 1, 41, 30, height - 30)),int(map(19, 1, 41, 30, height - 30)),int(map(21, 1, 41, 30, height - 30)),int(map(31, 1, 41, 30, height - 30)),int(map(35, 1, 41, 30, height - 30)),int(map(14, 1, 41, 30, height - 30)),int(map(17, 1, 41, 30, height - 30)),int(map(33, 1, 41, 30, height - 30)),int(map(37, 1, 41, 30, height - 30)),int(map(22, 1, 41, 30, height - 30)),int(map(6, 1, 41, 30, height - 30))];

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

    // merge sort button
    buttonInsertion = createButton('Merge Sort');
    buttonInsertion.position(360, 480);
    buttonInsertion.mousePressed(merge_sort_init);
}

function draw() {
    background(100);

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
    else if (mrg.flag && !insertion.flag && !bubble.flag && !selection.flag) {
        let ar = it.next().value
        if (ar == undefined) {
            mrg.flag = false;
            noLoop();
        }
        for (let i = 0; i < array.length; i++) {
            rect(20 + i * gap, 10, 10, array[i], 3);
        }
    }
    else {
        for (let i = 0; i < array.length; i++) {
            fill(255);
            rect(20 + i * gap, 10, 10, array[i], 3);
        }
    }
    textAlign(LEFT);
    textSize(15);
    fill(255);
    text("Comparisons: ", 15, 390);
    text(iteration, 110, 390);

}


function merge_sort_init() {
    if(array.length != 0) {
        mrg.flag = true;
        it = merge_sort(array, 0, array.length - 1);
    }
}

function createDefaultArray() {
    reset();

    for (let i = 0; i < array.length; i++) {
        fill(255);
        rect(20 + i * gap, 10, 10, array[i], 3);
    }
}

function createAscendingArray() {
    reset();
    array.sort(function(a, b){return a-b});
    for (let i = 0; i < array.length; i++) {
        fill(255);
        rect(20 + i * gap, 10, 10, array[i], 3);
    }
}

function createDescendingArray() {
    reset();
    array.sort(function(a, b){return b-a});
    for (let i = 0; i < array.length; i++) {
        fill(255);
        rect(20 + i * gap, 10, 10, array[i], 3);
    }
}


function createArray() {
    reset();
    // constructing a random array
    shuffleArray(array);
    for (let i = 0; i < array.length; i++) {
        fill(255);
        rect(20 + i * gap, 10, 10, array[i], 3);
    }
}


function reset() {
    loop();
    // clear the array
    array = [int(map(5, 1, 41, 30, height - 30)),int(map(26, 1, 41, 30, height - 30)),int(map(40, 1, 41, 30, height - 30)),int(map(12, 1, 41, 30, height - 30)),int(map(32, 1, 41, 30, height - 30)),int(map(4, 1, 41, 30, height - 30)),int(map(15, 1, 41, 30, height - 30)),int(map(25, 1, 41, 30, height - 30)),int(map(36, 1, 41, 30, height - 30)),int(map(27, 1, 41, 30, height - 30)),int(map(41, 1, 41, 30, height - 30)),int(map(1, 1, 41, 30, height - 30)),int(map(38, 1, 41, 30, height - 30)),int(map(11, 1, 41, 30, height - 30)),int(map(16, 1, 41, 30, height - 30)),int(map(3, 1, 41, 30, height - 30)),int(map(29, 1, 41, 30, height - 30)),int(map(24, 1, 41, 30, height - 30)),int(map(30, 1, 41, 30, height - 30)),int(map(20, 1, 41, 30, height - 30)),int(map(10, 1, 41, 30, height - 30)),int(map(2, 1, 41, 30, height - 30)),int(map(39, 1, 41, 30, height - 30)),int(map(34, 1, 41, 30, height - 30)),int(map(18, 1, 41, 30, height - 30)),int(map(13, 1, 41, 30, height - 30)),int(map(23, 1, 41, 30, height - 30)),int(map(9, 1, 41, 30, height - 30)),int(map(28, 1, 41, 30, height - 30)),int(map(8, 1, 41, 30, height - 30)),int(map(7, 1, 41, 30, height - 30)),int(map(19, 1, 41, 30, height - 30)),int(map(21, 1, 41, 30, height - 30)),int(map(31, 1, 41, 30, height - 30)),int(map(35, 1, 41, 30, height - 30)),int(map(14, 1, 41, 30, height - 30)),int(map(17, 1, 41, 30, height - 30)),int(map(33, 1, 41, 30, height - 30)),int(map(37, 1, 41, 30, height - 30)),int(map(22, 1, 41, 30, height - 30)),int(map(6, 1, 41, 30, height - 30))];
    iteration = 0;
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

    // clear the mrg variables
    mrg.flag = false;
}


// collected from https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

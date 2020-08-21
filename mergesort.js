let mrg = {
    flag : false
}

function* merge_sort(array, left,  right) {
    if (left >= right)
        return;

    let mid = int(left + (right - left) / 2);
    yield* merge_sort(array, left, mid);
    yield* merge_sort(array, mid + 1, right);

    // there is a built-in merge function in c++ defined in "algorithm" header
    yield* merge(array, left, mid, right);
}

function* merge(array, left, mid, right) {
    let n1 = mid - left + 1;
    let n2 = right - mid;

    let L = [], R = [];
    for (let i = 0; i < n1; i++)
        L[i] = array[left + i];
    for (let i = 0; i < n2; i++)
        R[i] = array[mid + i + 1];

    let lArr_index = 0, rArr_index = 0, sArr_index = left;
    while (lArr_index < n1 && rArr_index < n2){
        if (L[lArr_index] <= R[rArr_index]) {
            iteration++;
            array[sArr_index++] = L[lArr_index++];
            yield array;
        }
        else {
            iteration++;
            array[sArr_index++] = R[rArr_index++];
            yield array;
        }
    }

    while (lArr_index < n1) {
        iteration++;
        array[sArr_index++] = L[lArr_index++];
        yield array;
    }
    while (rArr_index < n2) {
        iteration++;
        array[sArr_index++] = R[rArr_index++];
        yield array;
    }
}

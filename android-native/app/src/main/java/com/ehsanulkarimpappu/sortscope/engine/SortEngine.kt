package com.ehsanulkarimpappu.sortscope.engine

import com.ehsanulkarimpappu.sortscope.data.AlgorithmCatalog
import com.ehsanulkarimpappu.sortscope.model.SortItem
import com.ehsanulkarimpappu.sortscope.model.SortTrace
import kotlin.math.floor
import kotlin.math.ln
import kotlin.math.sqrt

object SortEngine {
    fun trace(algorithmId: String, source: List<SortItem>): SortTrace {
        require(source.isNotEmpty()) { "SortScope needs at least one value" }
        val definition = requireNotNull(AlgorithmCatalog.byId[algorithmId]) { "Unknown algorithm: $algorithmId" }
        val recorder = TraceRecorder(source)
        when (algorithmId) {
            "bubble" -> bubble(recorder)
            "cocktail" -> cocktail(recorder)
            "selection" -> selection(recorder)
            "insertion" -> insertion(recorder, 0, source.lastIndex)
            "merge" -> mergeSort(recorder, 0, source.lastIndex)
            "quick" -> quickSort(recorder, 0, source.lastIndex)
            "quick-three" -> quickThree(recorder, 0, source.lastIndex)
            "heap" -> heapSort(recorder)
            "shell" -> shellSort(recorder)
            "timsort" -> timSort(recorder)
            "introsort" -> introSort(recorder)
            "counting" -> countingSort(recorder)
            "radix" -> radixSort(recorder)
            "bucket" -> bucketSort(recorder)
            "bitonic" -> bitonicSort(recorder, 0, source.size, true)
        }
        recorder.complete(definition.name)
        return SortTrace(algorithmId, source, recorder.steps.toList())
    }

    private fun bubble(recorder: TraceRecorder) {
        for (end in recorder.items.lastIndex downTo 1) {
            var swapped = false
            recorder.phase("Begin pass", "Scan positions 1 through ${end + 1}.", variables = mapOf("end" to (end + 1).toString()))
            for (index in 0 until end) {
                if (recorder.compare(index, index + 1, ">", 1, variables = mapOf("left" to (index + 1).toString(), "right" to (index + 2).toString()))) {
                    recorder.swap(index, index + 1, 2)
                    swapped = true
                }
            }
            recorder.markSorted(end..end, "The pass placed the largest remaining value at position ${end + 1}.")
            if (!swapped) {
                recorder.markSorted(0 until end, "No exchange occurred, so the remaining prefix is already ordered.")
                break
            }
        }
    }

    private fun cocktail(recorder: TraceRecorder) {
        var start = 0
        var end = recorder.items.lastIndex
        var swapped = true
        while (swapped && start < end) {
            swapped = false
            recorder.phase("Forward sweep", "Move large values toward the right edge.", variables = mapOf("start" to (start + 1).toString(), "end" to (end + 1).toString()))
            for (index in start until end) {
                if (recorder.compare(index, index + 1, ">", 1)) {
                    recorder.swap(index, index + 1, 1)
                    swapped = true
                }
            }
            recorder.markSorted(end..end)
            end -= 1
            if (!swapped) break

            swapped = false
            recorder.phase("Backward sweep", "Move small values toward the left edge.", variables = mapOf("start" to (start + 1).toString(), "end" to (end + 1).toString()))
            for (index in end downTo start + 1) {
                if (recorder.compare(index - 1, index, ">", 2)) {
                    recorder.swap(index - 1, index, 2)
                    swapped = true
                }
            }
            recorder.markSorted(start..start)
            start += 1
        }
    }

    private fun selection(recorder: TraceRecorder) {
        for (output in 0 until recorder.items.lastIndex) {
            var minimum = output
            recorder.candidate(setOf(recorder.items[minimum].id), "Minimum candidate", "Start with ${recorder.items[minimum].value} as the smallest remaining value.", 0)
            for (scan in output + 1..recorder.items.lastIndex) {
                if (recorder.compare(scan, minimum, "<", 1, variables = mapOf("scan" to (scan + 1).toString(), "minimum" to (minimum + 1).toString()))) {
                    minimum = scan
                    recorder.candidate(setOf(recorder.items[minimum].id), "New minimum", "${recorder.items[minimum].value} is the new minimum candidate.", 2)
                }
            }
            recorder.swap(output, minimum, 3, title = "Place the minimum")
            recorder.markSorted(output..output, "Position ${output + 1} now contains the smallest remaining value.")
        }
    }

    private fun insertion(recorder: TraceRecorder, low: Int, high: Int) {
        if (low >= high) return
        for (index in low + 1..high) {
            val key = recorder.items[index]
            recorder.candidate(setOf(key.id), "Take the next key", "Insert ${key.value} into the ordered prefix.", 0, mapOf("key" to key.value.toString()))
            var cursor = index - 1
            while (cursor >= low && recorder.compareItemAt(cursor, key, ">", 1, variables = mapOf("cursor" to (cursor + 1).toString(), "key" to key.value.toString()))) {
                recorder.write(cursor + 1, recorder.items[cursor], 2, title = "Shift right")
                cursor -= 1
            }
            recorder.write(cursor + 1, key, 3, title = "Insert the key")
        }
    }

    private fun mergeSort(recorder: TraceRecorder, low: Int, high: Int) {
        if (low >= high) return
        val middle = (low + high) / 2
        recorder.phase(
            "Split the range",
            "Divide positions ${low + 1}–${high + 1} at ${middle + 1}.",
            activeIds = recorder.items.subList(low, high + 1).map { it.id }.toSet(),
            codeLine = 0,
            variables = mapOf("low" to (low + 1).toString(), "mid" to (middle + 1).toString(), "high" to (high + 1).toString()),
        )
        mergeSort(recorder, low, middle)
        mergeSort(recorder, middle + 1, high)
        merge(recorder, low, middle, high, 2, 3)
    }

    private fun merge(recorder: TraceRecorder, low: Int, middle: Int, high: Int, compareLine: Int, writeLine: Int) {
        val left = recorder.items.subList(low, middle + 1).toList()
        val right = recorder.items.subList(middle + 1, high + 1).toList()
        var leftIndex = 0
        var rightIndex = 0
        var output = low
        recorder.phase("Merge runs", "Combine two ordered runs into positions ${low + 1}–${high + 1}.", codeLine = 2, variables = mapOf("left size" to left.size.toString(), "right size" to right.size.toString()))
        while (leftIndex < left.size && rightIndex < right.size) {
            val takeLeft = recorder.compareItems(left[leftIndex], right[rightIndex], "≤", compareLine, "Compare run fronts")
            val item = if (takeLeft) left[leftIndex++] else right[rightIndex++]
            recorder.write(output++, item, writeLine, title = "Merge the smaller front")
        }
        while (leftIndex < left.size) recorder.write(output++, left[leftIndex++], writeLine, title = "Drain left run")
        while (rightIndex < right.size) recorder.write(output++, right[rightIndex++], writeLine, title = "Drain right run")
    }

    private fun quickSort(recorder: TraceRecorder, low: Int, high: Int) {
        if (low > high) return
        if (low == high) {
            recorder.markSorted(low..low)
            return
        }
        val pivot = recorder.items[high]
        recorder.candidate(setOf(pivot.id), "Choose pivot", "Use ${pivot.value} as the partition pivot.", 0, mapOf("low" to (low + 1).toString(), "high" to (high + 1).toString()))
        var boundary = low
        for (scan in low until high) {
            if (recorder.compareItemAt(scan, pivot, "≤", 1, variables = mapOf("scan" to (scan + 1).toString(), "boundary" to (boundary + 1).toString(), "pivot" to pivot.value.toString()))) {
                recorder.swap(boundary, scan, 2, title = "Grow the lower partition")
                boundary += 1
            }
        }
        recorder.swap(boundary, high, 3, title = "Place the pivot")
        recorder.markSorted(boundary..boundary, "The pivot is now in its final position.")
        quickSort(recorder, low, boundary - 1)
        quickSort(recorder, boundary + 1, high)
    }

    private fun quickThree(recorder: TraceRecorder, low: Int, high: Int) {
        if (low > high) return
        if (low == high) {
            recorder.markSorted(low..low)
            return
        }
        val pivot = recorder.items[low]
        var lower = low
        var scan = low + 1
        var upper = high
        recorder.candidate(setOf(pivot.id), "Choose pivot", "Build three regions around ${pivot.value}.", 0)
        while (scan <= upper) {
            val variables = mapOf("lower" to (lower + 1).toString(), "scan" to (scan + 1).toString(), "upper" to (upper + 1).toString(), "pivot" to pivot.value.toString())
            if (recorder.compareItemAt(scan, pivot, "<", 1, variables = variables)) {
                recorder.swap(lower, scan, 2, title = "Grow the lower region")
                lower += 1
                scan += 1
            } else if (recorder.compareItemAt(scan, pivot, ">", 1, variables = variables)) {
                recorder.swap(scan, upper, 2, title = "Grow the upper region")
                upper -= 1
            } else {
                recorder.phase("Join the equal region", "${recorder.items[scan].value} equals the pivot.", activeIds = setOf(recorder.items[scan].id, pivot.id), codeLine = 2)
                scan += 1
            }
        }
        recorder.markSorted(lower..upper, "Every value equal to the pivot is now final.")
        quickThree(recorder, low, lower - 1)
        quickThree(recorder, upper + 1, high)
    }

    private fun heapSort(recorder: TraceRecorder) {
        val size = recorder.items.size
        recorder.phase("Build max heap", "Turn the array into a parent-child max heap.", codeLine = 0, variables = mapOf("heap size" to size.toString()))
        for (root in size / 2 - 1 downTo 0) heapify(recorder, 0, size, root)
        for (end in size - 1 downTo 1) {
            recorder.swap(0, end, 3, title = "Extract heap maximum")
            recorder.markSorted(end..end, "The heap maximum reaches position ${end + 1}.")
            heapify(recorder, 0, end, 0)
        }
    }

    private fun heapify(recorder: TraceRecorder, base: Int, size: Int, root: Int) {
        var largest = root
        val left = root * 2 + 1
        val right = left + 1
        val vars = mapOf("root" to (base + root + 1).toString(), "heap size" to size.toString())
        if (left < size && recorder.compare(base + left, base + largest, ">", 1, "Compare left child", vars)) largest = left
        if (right < size && recorder.compare(base + right, base + largest, ">", 1, "Compare right child", vars)) largest = right
        if (largest != root) {
            recorder.swap(base + root, base + largest, 2, title = "Restore heap order", variables = vars)
            heapify(recorder, base, size, largest)
        }
    }

    private fun shellSort(recorder: TraceRecorder) {
        var gap = recorder.items.size / 2
        while (gap > 0) {
            recorder.phase("Gap $gap pass", "Order values that are $gap positions apart.", codeLine = 0, variables = mapOf("gap" to gap.toString()))
            for (index in gap until recorder.items.size) {
                val key = recorder.items[index]
                var cursor = index
                while (cursor >= gap && recorder.compareItemAt(cursor - gap, key, ">", 2, variables = mapOf("gap" to gap.toString(), "cursor" to (cursor + 1).toString()))) {
                    recorder.write(cursor, recorder.items[cursor - gap], 2, title = "Shift along the gap")
                    cursor -= gap
                }
                recorder.write(cursor, key, 2, title = "Insert into gapped run")
            }
            gap /= 2
        }
    }

    private fun timSort(recorder: TraceRecorder) {
        val size = recorder.items.size
        val minRun = when {
            size < 8 -> size
            size < 16 -> 4
            else -> 8
        }
        var start = 0
        while (start < size) {
            val end = minOf(start + minRun - 1, size - 1)
            recorder.phase("Build natural run", "Order positions ${start + 1}–${end + 1} as a small run.", codeLine = 0, variables = mapOf("min run" to minRun.toString(), "run start" to (start + 1).toString()))
            insertion(recorder, start, end)
            start += minRun
        }
        var width = minRun
        while (width < size) {
            var low = 0
            while (low < size) {
                val middle = minOf(low + width - 1, size - 1)
                val high = minOf(low + width * 2 - 1, size - 1)
                if (middle < high) {
                    recorder.phase("Balance run stack", "Merge runs of width $width.", codeLine = 3, variables = mapOf("run width" to width.toString()))
                    merge(recorder, low, middle, high, 3, 3)
                }
                low += width * 2
            }
            width *= 2
        }
    }

    private fun introSort(recorder: TraceRecorder) {
        val depth = if (recorder.items.size <= 1) 0 else 2 * floor(ln(recorder.items.size.toDouble()) / ln(2.0)).toInt()
        introRange(recorder, 0, recorder.items.lastIndex, depth)
    }

    private fun introRange(recorder: TraceRecorder, low: Int, high: Int, depth: Int) {
        if (low >= high) return
        val size = high - low + 1
        recorder.phase("Choose strategy", "Range size $size with depth budget $depth.", codeLine = 0, variables = mapOf("range" to "$size", "depth" to depth.toString()))
        if (size <= 8) {
            recorder.phase("Insertion finish", "Use insertion sort for this small range.", codeLine = 3)
            insertion(recorder, low, high)
            return
        }
        if (depth == 0) {
            recorder.phase("Heap fallback", "The depth budget is exhausted; guarantee O(n log n).", codeLine = 2)
            val count = size
            for (root in count / 2 - 1 downTo 0) heapify(recorder, low, count, root)
            for (end in count - 1 downTo 1) {
                recorder.swap(low, low + end, 2, title = "Heap fallback extraction")
                heapify(recorder, low, end, 0)
            }
            return
        }
        val pivot = partitionIntro(recorder, low, high)
        introRange(recorder, low, pivot - 1, depth - 1)
        introRange(recorder, pivot + 1, high, depth - 1)
    }

    private fun partitionIntro(recorder: TraceRecorder, low: Int, high: Int): Int {
        val pivot = recorder.items[high]
        recorder.candidate(setOf(pivot.id), "Quick-sort strategy", "Partition around ${pivot.value}.", 1)
        var boundary = low
        for (scan in low until high) {
            if (recorder.compareItemAt(scan, pivot, "≤", 1)) {
                recorder.swap(boundary, scan, 1, title = "Grow lower partition")
                boundary += 1
            }
        }
        recorder.swap(boundary, high, 1, title = "Place partition pivot")
        return boundary
    }

    private fun countingSort(recorder: TraceRecorder) {
        val minimum = recorder.items.minOf { it.value }
        val maximum = recorder.items.maxOf { it.value }
        val counts = IntArray(maximum - minimum + 1)
        recorder.phase("Count values", "Build a frequency table from $minimum to $maximum.", codeLine = 0, variables = mapOf("range" to counts.size.toString()))
        recorder.items.forEach { item ->
            counts[item.value - minimum] += 1
            recorder.phase("Increase count", "${item.value} has appeared ${counts[item.value - minimum]} time(s).", activeIds = setOf(item.id), codeLine = 0, variables = mapOf("value" to item.value.toString(), "count" to counts[item.value - minimum].toString()))
        }
        for (index in 1 until counts.size) counts[index] += counts[index - 1]
        recorder.phase("Accumulate counts", "Counts now point to final output boundaries.", codeLine = 1)
        val output = arrayOfNulls<com.ehsanulkarimpappu.sortscope.model.SortItem>(recorder.items.size)
        for (index in recorder.items.lastIndex downTo 0) {
            val item = recorder.items[index]
            val bucket = item.value - minimum
            val outputIndex = --counts[bucket]
            output[outputIndex] = item
            recorder.phase("Place stably", "${item.value}${item.identity} maps to output position ${outputIndex + 1}.", activeIds = setOf(item.id), codeLine = 2)
        }
        output.forEachIndexed { index, item -> recorder.write(index, requireNotNull(item), 3, title = "Copy counted output") }
    }

    private fun radixSort(recorder: TraceRecorder) {
        val minimum = recorder.items.minOf { it.value }
        val offset = if (minimum < 0) -minimum else 0
        val maximum = recorder.items.maxOf { it.value + offset }
        var exponent = 1
        while (maximum / exponent > 0) {
            recorder.phase("Digit pass", "Group values by the ${digitLabel(exponent)} digit.", codeLine = 0, variables = mapOf("place" to exponent.toString(), "offset" to offset.toString()))
            val counts = IntArray(10)
            recorder.items.forEach { counts[((it.value + offset) / exponent) % 10] += 1 }
            for (index in 1 until 10) counts[index] += counts[index - 1]
            val output = arrayOfNulls<com.ehsanulkarimpappu.sortscope.model.SortItem>(recorder.items.size)
            for (index in recorder.items.lastIndex downTo 0) {
                val item = recorder.items[index]
                val digit = ((item.value + offset) / exponent) % 10
                output[--counts[digit]] = item
                recorder.phase("Place in digit bucket", "${item.value} has digit $digit.", activeIds = setOf(item.id), codeLine = 2, variables = mapOf("digit" to digit.toString()))
            }
            output.forEachIndexed { index, item -> recorder.write(index, requireNotNull(item), 2, title = "Write digit pass") }
            if (exponent > Int.MAX_VALUE / 10) break
            exponent *= 10
        }
    }

    private fun bucketSort(recorder: TraceRecorder) {
        val minimum = recorder.items.minOf { it.value }
        val maximum = recorder.items.maxOf { it.value }
        val bucketCount = sqrt(recorder.items.size.toDouble()).toInt().coerceAtLeast(2)
        val width = ((maximum - minimum + 1) + bucketCount - 1) / bucketCount
        val buckets = List(bucketCount) { mutableListOf<com.ehsanulkarimpappu.sortscope.model.SortItem>() }
        recorder.phase("Create buckets", "Divide $minimum–$maximum into $bucketCount ranges.", codeLine = 0, variables = mapOf("buckets" to bucketCount.toString(), "width" to width.toString()))
        recorder.items.forEach { item ->
            val bucket = ((item.value - minimum) / width).coerceIn(0, bucketCount - 1)
            buckets[bucket] += item
            recorder.phase("Distribute value", "${item.value} enters bucket ${bucket + 1}.", activeIds = setOf(item.id), codeLine = 1, variables = mapOf("bucket" to (bucket + 1).toString()))
        }
        buckets.forEachIndexed { bucketIndex, bucket ->
            for (index in 1 until bucket.size) {
                val key = bucket[index]
                var cursor = index - 1
                while (cursor >= 0 && recorder.compareItems(bucket[cursor], key, ">", 2, "Sort inside bucket", mapOf("bucket" to (bucketIndex + 1).toString()))) {
                    bucket[cursor + 1] = bucket[cursor]
                    cursor -= 1
                }
                bucket[cursor + 1] = key
            }
        }
        var output = 0
        buckets.flatten().forEach { item -> recorder.write(output++, item, 3, title = "Concatenate buckets") }
    }

    private fun bitonicSort(recorder: TraceRecorder, low: Int, count: Int, ascending: Boolean) {
        if (count <= 1) return
        val firstCount = count / 2
        val secondCount = count - firstCount
        recorder.phase("Build bitonic sequence", "Sort neighboring lanes in opposite directions.", codeLine = 0, variables = mapOf("direction" to if (ascending) "ascending" else "descending", "lanes" to count.toString()))
        bitonicSort(recorder, low, firstCount, !ascending)
        bitonicSort(recorder, low + firstCount, secondCount, ascending)
        bitonicMerge(recorder, low, count, ascending)
    }

    private fun bitonicMerge(recorder: TraceRecorder, low: Int, count: Int, ascending: Boolean) {
        if (count <= 1) return
        val distance = greatestPowerOfTwoBelow(count)
        recorder.phase("Comparator stage", "Compare lanes $distance positions apart.", codeLine = 1, variables = mapOf("distance" to distance.toString(), "direction" to if (ascending) "ascending" else "descending"))
        for (index in low until low + count - distance) {
            val shouldSwap = if (ascending) {
                recorder.compare(index, index + distance, ">", 2, "Ascending comparator")
            } else {
                recorder.compare(index, index + distance, "<", 2, "Descending comparator")
            }
            if (shouldSwap) recorder.swap(index, index + distance, 3, title = "Network exchange")
        }
        bitonicMerge(recorder, low, distance, ascending)
        bitonicMerge(recorder, low + distance, count - distance, ascending)
    }

    private fun greatestPowerOfTwoBelow(value: Int): Int {
        var power = 1
        while (power shl 1 < value) power = power shl 1
        return power
    }

    private fun digitLabel(exponent: Int): String = when (exponent) {
        1 -> "ones"
        10 -> "tens"
        100 -> "hundreds"
        else -> "$exponent-place"
    }
}

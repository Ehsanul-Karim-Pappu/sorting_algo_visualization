package com.ehsanulkarimpappu.sortscope.engine

import com.ehsanulkarimpappu.sortscope.model.DatasetKind
import com.ehsanulkarimpappu.sortscope.model.SortItem
import kotlin.math.max
import kotlin.random.Random

object Datasets {
    fun generate(kind: DatasetKind, size: Int, seed: Int): List<SortItem> {
        val safeSize = size.coerceIn(4, 36)
        val random = Random(seed)
        val values = when (kind) {
            DatasetKind.RANDOM, DatasetKind.CUSTOM -> List(safeSize) { random.nextInt(8, 100) }
            DatasetKind.NEARLY_SORTED -> List(safeSize) { 8 + it * max(2, 88 / safeSize) }
                .toMutableList()
                .also { list ->
                    repeat(max(1, safeSize / 6)) {
                        val left = random.nextInt(safeSize - 1)
                        val right = (left + random.nextInt(1, minOf(4, safeSize - left))).coerceAtMost(safeSize - 1)
                        val value = list[left]
                        list[left] = list[right]
                        list[right] = value
                    }
                }
            DatasetKind.REVERSED -> List(safeSize) { 96 - it * max(2, 88 / safeSize) }
            DatasetKind.FEW_UNIQUE -> {
                val palette = listOf(18, 36, 54, 72, 90)
                List(safeSize) { palette[random.nextInt(palette.size)] }
            }
        }
        return withIdentities(values)
    }

    fun stability(): List<SortItem> = withIdentities(listOf(20, 20, 10, 30, 20, 10, 30, 10))

    fun custom(raw: String): Result<List<SortItem>> = runCatching {
        val values = raw.split(",", " ", ";")
            .map { it.trim() }
            .filter { it.isNotEmpty() }
            .map { token -> token.toIntOrNull() ?: error("‘$token’ is not an integer") }
        require(values.size in 4..36) { "Enter 4 to 36 integer values" }
        require(values.all { it in -999..999 }) { "Values must be between -999 and 999" }
        withIdentities(values)
    }

    private fun withIdentities(values: List<Int>): List<SortItem> {
        val occurrences = mutableMapOf<Int, Int>()
        val totals = values.groupingBy { it }.eachCount()
        return values.mapIndexed { index, value ->
            val occurrence = occurrences.getOrDefault(value, 0)
            occurrences[value] = occurrence + 1
            SortItem(
                id = index,
                value = value,
                identity = if (totals.getValue(value) > 1) ('A'.code + occurrence).toChar().toString() else "",
            )
        }
    }
}

package com.ehsanulkarimpappu.sortscope.engine

import com.ehsanulkarimpappu.sortscope.model.Decision
import com.ehsanulkarimpappu.sortscope.model.Metrics
import com.ehsanulkarimpappu.sortscope.model.OperationKind
import com.ehsanulkarimpappu.sortscope.model.SortItem
import com.ehsanulkarimpappu.sortscope.model.SortStep

internal class TraceRecorder(source: List<SortItem>) {
    val items = source.toMutableList()
    val steps = mutableListOf<SortStep>()
    private val finalIds = linkedSetOf<Int>()
    private var comparisons = 0
    private var writes = 0
    private var swaps = 0

    init {
        record(
            operation = OperationKind.READY,
            title = "Ready",
            message = "Press play or step forward to follow every decision.",
            detail = "${items.size} values are ready.",
        )
    }

    fun compare(
        leftIndex: Int,
        rightIndex: Int,
        operator: String,
        codeLine: Int,
        title: String = "Compare values",
        variables: Map<String, String> = emptyMap(),
    ): Boolean {
        val left = items[leftIndex]
        val right = items[rightIndex]
        return compareItems(left, right, operator, codeLine, title, variables)
    }

    fun compareItemAt(
        index: Int,
        other: SortItem,
        operator: String,
        codeLine: Int,
        title: String = "Compare with key",
        variables: Map<String, String> = emptyMap(),
    ): Boolean = compareItems(items[index], other, operator, codeLine, title, variables)

    fun compareItems(
        left: SortItem,
        right: SortItem,
        operator: String,
        codeLine: Int,
        title: String = "Compare values",
        variables: Map<String, String> = emptyMap(),
    ): Boolean {
        val result = relation(left.value, right.value, operator)
        comparisons += 1
        record(
            operation = OperationKind.COMPARE,
            title = title,
            message = "${left.value} $operator ${right.value} is ${if (result) "true" else "false"}.",
            detail = "The algorithm uses this answer to choose its next move.",
            activeIds = setOf(left.id, right.id),
            codeLine = codeLine,
            decision = Decision(left.value, operator, right.value, result),
            variables = variables,
        )
        return result
    }

    fun swap(
        leftIndex: Int,
        rightIndex: Int,
        codeLine: Int,
        title: String = "Exchange the pair",
        detail: String = "Both values move to their opposite positions.",
        variables: Map<String, String> = emptyMap(),
    ) {
        if (leftIndex == rightIndex) return
        val left = items[leftIndex]
        val right = items[rightIndex]
        items[leftIndex] = right
        items[rightIndex] = left
        swaps += 1
        writes += 2
        record(
            operation = OperationKind.SWAP,
            title = title,
            message = "${left.value} and ${right.value} exchange positions.",
            detail = detail,
            activeIds = setOf(left.id, right.id),
            codeLine = codeLine,
            variables = variables,
        )
    }

    fun write(
        index: Int,
        item: SortItem,
        codeLine: Int,
        title: String = "Write value",
        detail: String = "The destination now contains this item.",
        variables: Map<String, String> = emptyMap(),
    ) {
        items[index] = item
        writes += 1
        record(
            operation = OperationKind.WRITE,
            title = title,
            message = "Write ${item.value} into position ${index + 1}.",
            detail = detail,
            activeIds = setOf(item.id),
            codeLine = codeLine,
            variables = variables,
        )
    }

    fun candidate(
        ids: Set<Int>,
        title: String,
        message: String,
        codeLine: Int,
        variables: Map<String, String> = emptyMap(),
    ) = record(
        operation = OperationKind.CANDIDATE,
        title = title,
        message = message,
        candidateIds = ids,
        codeLine = codeLine,
        variables = variables,
    )

    fun phase(
        title: String,
        message: String,
        detail: String = "",
        activeIds: Set<Int> = emptySet(),
        codeLine: Int = 0,
        variables: Map<String, String> = emptyMap(),
    ) = record(
        operation = OperationKind.PHASE,
        title = title,
        message = message,
        detail = detail,
        activeIds = activeIds,
        codeLine = codeLine,
        variables = variables,
    )

    fun markSorted(indices: IntRange, message: String = "This range is now final.") {
        indices.filter { it in items.indices }.forEach { finalIds += items[it].id }
        record(
            operation = OperationKind.SORTED,
            title = "Position locked",
            message = message,
            activeIds = indices.filter { it in items.indices }.map { items[it].id }.toSet(),
            codeLine = 3,
        )
    }

    fun complete(algorithmName: String) {
        finalIds.clear()
        finalIds += items.map { it.id }
        record(
            operation = OperationKind.COMPLETE,
            title = "Array sorted",
            message = "$algorithmName finished with $comparisons comparisons, $writes writes, and $swaps swaps.",
            detail = "Every value is now in ascending order.",
            activeIds = items.map { it.id }.toSet(),
            codeLine = 3,
        )
    }

    private fun record(
        operation: OperationKind,
        title: String,
        message: String,
        detail: String = "",
        activeIds: Set<Int> = emptySet(),
        candidateIds: Set<Int> = emptySet(),
        codeLine: Int = 0,
        decision: Decision? = null,
        variables: Map<String, String> = emptyMap(),
    ) {
        steps += SortStep(
            items = items.toList(),
            operation = operation,
            title = title,
            message = message,
            detail = detail,
            activeIds = activeIds,
            candidateIds = candidateIds,
            sortedIds = finalIds.toSet(),
            codeLine = codeLine,
            metrics = Metrics(comparisons, writes, swaps),
            decision = decision,
            variables = variables,
        )
    }

    private fun relation(left: Int, right: Int, operator: String): Boolean = when (operator) {
        ">" -> left > right
        "<" -> left < right
        "≥" -> left >= right
        "≤" -> left <= right
        "=" -> left == right
        else -> error("Unsupported comparison operator $operator")
    }
}

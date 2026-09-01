package com.ehsanulkarimpappu.sortscope.engine

import com.ehsanulkarimpappu.sortscope.data.AlgorithmCatalog
import com.ehsanulkarimpappu.sortscope.model.SortItem
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test
import kotlin.random.Random

class SortEngineTest {
    private val datasets = listOf(
        listOf(5, 1, 4, 2, 8),
        listOf(1, 2, 3, 4, 5),
        listOf(9, 7, 5, 3, 1),
        listOf(4, 2, 4, 1, 2, 4, 1),
        listOf(-8, 3, -2, 7, 0, -8, 4),
    )

    @Test
    fun everyAlgorithmSortsRepresentativeInputs() {
        AlgorithmCatalog.algorithms.forEach { algorithm ->
            datasets.forEach { values ->
                val source = values.mapIndexed { index, value -> SortItem(index, value, index.toString()) }
                val trace = SortEngine.trace(algorithm.id, source)
                assertEquals("${algorithm.name} failed for $values", values.sorted(), trace.result.map { it.value })
                assertEquals(source, trace.source)
                assertTrue(trace.steps.size >= 2)
                assertEquals("COMPLETE", trace.steps.last().operation.name)
            }
        }
    }

    @Test
    fun bitonicNetworkSupportsArbitraryLengths() {
        for (size in 4..24) {
            repeat(20) { seed ->
                val random = Random(size * 1000 + seed)
                val values = List(size) { random.nextInt(-50, 100) }
                val source = values.mapIndexed { index, value -> SortItem(index, value) }
                assertEquals("bitonic length $size seed $seed", values.sorted(), SortEngine.trace("bitonic", source).result.map { it.value })
            }
        }
    }

    @Test
    fun stableAlgorithmsPreserveDuplicateIdentity() {
        val stableIds = AlgorithmCatalog.algorithms.filter { it.stable }.map { it.id }
        val source = listOf(
            SortItem(0, 2, "A"), SortItem(1, 1, "A"), SortItem(2, 2, "B"),
            SortItem(3, 1, "B"), SortItem(4, 2, "C"), SortItem(5, 1, "C"),
        )
        stableIds.forEach { id ->
            val result = SortEngine.trace(id, source).result
            assertEquals("$id changed value-1 identity", listOf(1, 3, 5), result.filter { it.value == 1 }.map { it.id })
            assertEquals("$id changed value-2 identity", listOf(0, 2, 4), result.filter { it.value == 2 }.map { it.id })
        }
    }

    @Test
    fun metricsNeverRegressAndWorkMatchesPrimitiveDefinition() {
        AlgorithmCatalog.algorithms.forEach { algorithm ->
            val trace = SortEngine.trace(algorithm.id, Datasets.generate(com.ehsanulkarimpappu.sortscope.model.DatasetKind.FEW_UNIQUE, 12, 17))
            trace.steps.zipWithNext().forEach { (before, after) ->
                assertTrue(after.metrics.comparisons >= before.metrics.comparisons)
                assertTrue(after.metrics.writes >= before.metrics.writes)
                assertTrue(after.metrics.swaps >= before.metrics.swaps)
                assertEquals(after.metrics.comparisons + after.metrics.writes, after.metrics.work)
            }
            assertFalse(trace.result.isEmpty())
        }
    }
}

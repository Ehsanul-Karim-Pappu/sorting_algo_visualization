@file:OptIn(androidx.compose.foundation.layout.ExperimentalLayoutApi::class)

package com.ehsanulkarimpappu.sortscope.ui.screens

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ElevatedCard
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.ehsanulkarimpappu.sortscope.ui.ComplexityPoint
import com.ehsanulkarimpappu.sortscope.ui.SortScopeState
import com.ehsanulkarimpappu.sortscope.ui.SortScopeViewModel
import com.ehsanulkarimpappu.sortscope.ui.components.MetricBox
import com.ehsanulkarimpappu.sortscope.ui.components.PropertyChip
import com.ehsanulkarimpappu.sortscope.ui.components.SectionHeading
import com.ehsanulkarimpappu.sortscope.ui.theme.Ink
import com.ehsanulkarimpappu.sortscope.ui.theme.Moving
import kotlin.math.max

@Composable
fun LearnScreen(
    state: SortScopeState,
    viewModel: SortScopeViewModel,
    modifier: Modifier = Modifier,
) {
    LazyColumn(
        modifier = modifier,
        contentPadding = androidx.compose.foundation.layout.PaddingValues(16.dp, 18.dp, 16.dp, 30.dp),
        verticalArrangement = Arrangement.spacedBy(13.dp),
    ) {
        item {
            SectionHeading(
                index = "Learning lens",
                title = state.algorithm.name,
                subtitle = state.algorithm.description,
            )
        }
        item { LessonProgressCard(state) }
        item { AlgorithmProperties(state) }
        item { PseudocodeCard(state) }
        item { LiveVariablesCard(state) }
        item { ComplexityCard(state, viewModel) }
        if (state.stabilityMode) item { StabilityTeachingCard(state) }
    }
}

@Composable
private fun LessonProgressCard(state: SortScopeState) {
    ElevatedCard(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.elevatedCardColors(containerColor = MaterialTheme.colorScheme.surface),
    ) {
        Column(Modifier.padding(16.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Column(Modifier.weight(1f)) {
                    Text("GUIDED LESSON", color = MaterialTheme.colorScheme.primary, fontSize = 9.sp, fontWeight = FontWeight.Black, letterSpacing = 1.sp)
                    Text("Follow the invariant", fontSize = 17.sp, fontWeight = FontWeight.Black)
                }
                Surface(shape = RoundedCornerShape(50), color = MaterialTheme.colorScheme.primary.copy(alpha = 0.15f)) {
                    Text("${state.lessonProgress} / 3", modifier = Modifier.padding(horizontal = 11.dp, vertical = 7.dp), fontSize = 11.sp, fontWeight = FontWeight.Black)
                }
            }
            Spacer(Modifier.height(10.dp))
            Text(state.algorithm.invariant, color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 12.sp, lineHeight = 18.sp)
            Spacer(Modifier.height(12.dp))
            LinearProgressIndicator(
                progress = { state.lessonProgress / 3f },
                modifier = Modifier.fillMaxWidth().height(7.dp),
                color = MaterialTheme.colorScheme.primary,
                trackColor = MaterialTheme.colorScheme.surfaceVariant,
                strokeCap = StrokeCap.Round,
            )
            Spacer(Modifier.height(11.dp))
            LessonCheckpoint("Observe the first decision", state.lessonProgress >= 1)
            LessonCheckpoint("Explain the invariant", state.lessonProgress >= 2)
            LessonCheckpoint("Complete the trace", state.lessonProgress >= 3)
        }
    }
}

@Composable
private fun LessonCheckpoint(text: String, complete: Boolean) {
    Row(Modifier.padding(vertical = 3.dp), verticalAlignment = Alignment.CenterVertically) {
        Text(if (complete) "✓" else "○", color = if (complete) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurfaceVariant, fontWeight = FontWeight.Black)
        Text(text, modifier = Modifier.padding(start = 8.dp), color = if (complete) MaterialTheme.colorScheme.onSurface else MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 11.sp, fontWeight = if (complete) FontWeight.Bold else FontWeight.Normal)
    }
}

@Composable
private fun AlgorithmProperties(state: SortScopeState) {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(20.dp),
        color = Ink,
        contentColor = Color.White,
    ) {
        Column(Modifier.padding(16.dp)) {
            Text("COMPLEXITY & PROPERTIES", color = Color(0xFF939CAF), fontSize = 9.sp, fontWeight = FontWeight.Black, letterSpacing = 1.sp)
            Spacer(Modifier.height(11.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(7.dp)) {
                DarkMetric("Best", state.algorithm.complexity.best, Modifier.weight(1f))
                DarkMetric("Average", state.algorithm.complexity.average, Modifier.weight(1f))
            }
            Spacer(Modifier.height(7.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(7.dp)) {
                DarkMetric("Worst", state.algorithm.complexity.worst, Modifier.weight(1f))
                DarkMetric("Space", state.algorithm.complexity.space, Modifier.weight(1f))
            }
            Spacer(Modifier.height(12.dp))
            FlowRow(horizontalArrangement = Arrangement.spacedBy(7.dp), verticalArrangement = Arrangement.spacedBy(7.dp)) {
                PropertyChip(if (state.algorithm.stable) "Stable" else "Not stable", state.algorithm.stable)
                PropertyChip(if (state.algorithm.inPlace) "In place" else "Extra memory", state.algorithm.inPlace)
                PropertyChip(state.algorithm.family.label)
            }
        }
    }
}

@Composable
private fun DarkMetric(label: String, value: String, modifier: Modifier = Modifier) {
    Column(modifier.background(Color(0xFF1A1F2A), RoundedCornerShape(12.dp)).padding(10.dp)) {
        Text(label.uppercase(), color = Color(0xFF8E97A9), fontSize = 8.sp, fontWeight = FontWeight.Black)
        Text(value, color = MaterialTheme.colorScheme.primary, fontSize = 13.sp, fontWeight = FontWeight.Black)
    }
}

@Composable
private fun PseudocodeCard(state: SortScopeState) {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(20.dp),
        color = MaterialTheme.colorScheme.surface,
        border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.72f)),
    ) {
        Column(Modifier.padding(16.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Column(Modifier.weight(1f)) {
                    Text("SYNCHRONIZED CODE", color = MaterialTheme.colorScheme.primary, fontSize = 9.sp, fontWeight = FontWeight.Black, letterSpacing = 1.sp)
                    Text("Pseudocode", fontSize = 17.sp, fontWeight = FontWeight.Black)
                }
                Text("line ${state.currentStep.codeLine + 1}", color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 10.sp, fontWeight = FontWeight.Bold)
            }
            Spacer(Modifier.height(11.dp))
            state.algorithm.pseudocode.forEachIndexed { index, line ->
                val active = index == state.currentStep.codeLine.coerceIn(state.algorithm.pseudocode.indices)
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(if (active) MaterialTheme.colorScheme.primary.copy(alpha = 0.15f) else Color.Transparent, RoundedCornerShape(10.dp))
                        .padding(horizontal = 10.dp, vertical = 9.dp),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Text((index + 1).toString().padStart(2, '0'), color = if (active) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 9.sp, fontWeight = FontWeight.Black)
                    Text(line, modifier = Modifier.padding(start = 12.dp), color = if (active) MaterialTheme.colorScheme.onSurface else MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 12.sp, fontWeight = if (active) FontWeight.Bold else FontWeight.Normal)
                }
            }
        }
    }
}

@Composable
private fun LiveVariablesCard(state: SortScopeState) {
    val variables = linkedMapOf(
        "operation" to state.currentStep.operation.name.lowercase().replace('_', ' '),
        "work" to state.currentStep.metrics.work.toString(),
    ).apply { putAll(state.currentStep.variables) }
    Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(20.dp),
        color = MaterialTheme.colorScheme.surface,
        border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.72f)),
    ) {
        Column(Modifier.padding(16.dp)) {
            Text("LIVE VARIABLES", color = MaterialTheme.colorScheme.primary, fontSize = 9.sp, fontWeight = FontWeight.Black, letterSpacing = 1.sp)
            Spacer(Modifier.height(10.dp))
            variables.entries.chunked(2).forEach { row ->
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    row.forEach { (label, value) -> MetricBox(label, value, Modifier.weight(1f)) }
                    if (row.size == 1) Spacer(Modifier.weight(1f))
                }
                Spacer(Modifier.height(8.dp))
            }
        }
    }
}

@Composable
private fun ComplexityCard(state: SortScopeState, viewModel: SortScopeViewModel) {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(20.dp),
        color = MaterialTheme.colorScheme.surface,
        border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.72f)),
    ) {
        Column(Modifier.padding(16.dp)) {
            Text("MEASURED GROWTH", color = MaterialTheme.colorScheme.primary, fontSize = 9.sp, fontWeight = FontWeight.Black, letterSpacing = 1.sp)
            Text("Complexity Lab", fontSize = 17.sp, fontWeight = FontWeight.Black)
            Text("Measure primitive work on five deterministic input sizes.", color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 11.sp)
            Spacer(Modifier.height(12.dp))
            if (state.complexity.isNotEmpty()) {
                ComplexityChart(state.complexity, state.algorithm.accent, state.comparisonEnabled)
                Spacer(Modifier.height(8.dp))
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    state.complexity.forEach { point -> Text(point.size.toString(), color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 9.sp) }
                }
                Spacer(Modifier.height(8.dp))
                state.complexity.forEach { point ->
                    Text(
                        buildString {
                            append("n=${point.size}  ${state.algorithm.shortName} ${point.primaryWork}")
                            point.comparisonWork?.let { append("  ·  ${state.comparisonAlgorithm.shortName} $it") }
                        },
                        fontSize = 10.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
                Spacer(Modifier.height(11.dp))
            }
            Button(
                onClick = viewModel::runComplexityExperiment,
                enabled = !state.complexityLoading,
                modifier = Modifier.fillMaxWidth().height(48.dp),
                shape = RoundedCornerShape(13.dp),
            ) {
                Text(if (state.complexityLoading) "Measuring…" else if (state.complexity.isEmpty()) "Run experiment" else "Run again", fontWeight = FontWeight.Black)
            }
        }
    }
}

@Composable
private fun ComplexityChart(points: List<ComplexityPoint>, accent: Int, comparison: Boolean) {
    val maximum = points.maxOf { max(it.primaryWork, it.comparisonWork ?: 0) }.coerceAtLeast(1)
    Canvas(
        modifier = Modifier
            .fillMaxWidth()
            .height(180.dp)
            .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.48f), RoundedCornerShape(14.dp))
            .padding(14.dp),
    ) {
        val stepX = if (points.size <= 1) 0f else size.width / (points.size - 1)
        fun y(value: Int) = size.height - (value.toFloat() / maximum) * size.height
        for (grid in 0..3) {
            val lineY = size.height * grid / 3f
            drawLine(Color(0xFFD5D0C6), Offset(0f, lineY), Offset(size.width, lineY), strokeWidth = 1f)
        }
        points.zipWithNext().forEachIndexed { index, pair ->
            drawLine(Color(accent), Offset(index * stepX, y(pair.first.primaryWork)), Offset((index + 1) * stepX, y(pair.second.primaryWork)), strokeWidth = 7f, cap = StrokeCap.Round)
            if (comparison) {
                val first = pair.first.comparisonWork ?: 0
                val second = pair.second.comparisonWork ?: 0
                drawLine(Moving, Offset(index * stepX, y(first)), Offset((index + 1) * stepX, y(second)), strokeWidth = 6f, cap = StrokeCap.Round)
            }
        }
        points.forEachIndexed { index, point ->
            drawCircle(Color(accent), radius = 6f, center = Offset(index * stepX, y(point.primaryWork)))
            if (comparison) drawCircle(Moving, radius = 5f, center = Offset(index * stepX, y(point.comparisonWork ?: 0)))
        }
    }
}

@Composable
private fun StabilityTeachingCard(state: SortScopeState) {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(20.dp),
        color = MaterialTheme.colorScheme.primary.copy(alpha = 0.12f),
    ) {
        Column(Modifier.padding(16.dp)) {
            Text("STABILITY LAB", color = MaterialTheme.colorScheme.primary, fontSize = 9.sp, fontWeight = FontWeight.Black, letterSpacing = 1.sp)
            Text("Persistent duplicate identities", fontSize = 17.sp, fontWeight = FontWeight.Black)
            Text("Watch A/B/C labels—not only their numeric value—to see whether equal items preserve input order.", color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 11.sp, lineHeight = 17.sp)
            if (state.isComplete) {
                Spacer(Modifier.height(10.dp))
                Text(if (state.stabilityPreserved) "✓ Order preserved" else "○ Order changed", color = if (state.stabilityPreserved) Color(0xFF247A52) else Color(0xFFA0384D), fontWeight = FontWeight.Black)
            }
        }
    }
}

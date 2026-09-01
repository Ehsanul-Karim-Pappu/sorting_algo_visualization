@file:OptIn(androidx.compose.foundation.layout.ExperimentalLayoutApi::class)

package com.ehsanulkarimpappu.sortscope.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.RowScope
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ElevatedCard
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Slider
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.ehsanulkarimpappu.sortscope.model.OperationKind
import com.ehsanulkarimpappu.sortscope.model.SortStep
import com.ehsanulkarimpappu.sortscope.ui.SortScopeState
import com.ehsanulkarimpappu.sortscope.ui.SortScopeViewModel
import com.ehsanulkarimpappu.sortscope.ui.components.BarVisualizer
import com.ehsanulkarimpappu.sortscope.ui.components.MetricBox
import com.ehsanulkarimpappu.sortscope.ui.components.VisualizationLegend
import com.ehsanulkarimpappu.sortscope.ui.theme.Ink
import com.ehsanulkarimpappu.sortscope.ui.theme.Stage
import com.ehsanulkarimpappu.sortscope.ui.theme.StageRaised
import com.ehsanulkarimpappu.sortscope.ui.theme.StageText
import kotlin.math.roundToInt

@Composable
fun VisualizeScreen(
    state: SortScopeState,
    viewModel: SortScopeViewModel,
    onOpenSetup: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Column(modifier.fillMaxSize()) {
        LazyColumn(
            modifier = Modifier.weight(1f),
            contentPadding = androidx.compose.foundation.layout.PaddingValues(14.dp, 14.dp, 14.dp, 18.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            item {
                QuickSetupCard(state, viewModel::newData, onOpenSetup)
            }
            item {
                ModeTray(state, viewModel)
            }
            item {
                ExecutionStage(state.currentStep, state.algorithm.name, state.position, state.maximum)
            }
            if (state.comparisonEnabled) {
                item {
                    ComparisonStage(state)
                }
            }
            if (state.pendingPrediction != null) {
                item {
                    PredictionCard(state, viewModel::answerPrediction)
                }
            }
            item {
                NarrationCard(state.currentStep, state)
            }
            item {
                MetricsRow(state.currentStep)
            }
            if (state.stabilityMode && state.isComplete) {
                item {
                    StabilityResult(state)
                }
            }
        }
        PlaybackDock(state, viewModel)
    }
}

@Composable
private fun QuickSetupCard(state: SortScopeState, onNewData: () -> Unit, onOpenSetup: () -> Unit) {
    ElevatedCard(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.elevatedCardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.elevatedCardElevation(defaultElevation = 2.dp),
    ) {
        Column(Modifier.padding(15.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Column(Modifier.weight(1f)) {
                    Text("CURRENT EXPERIMENT", color = MaterialTheme.colorScheme.primary, fontSize = 9.sp, fontWeight = FontWeight.Black, letterSpacing = 1.1.sp)
                    Text(state.algorithm.name, fontSize = 19.sp, fontWeight = FontWeight.Black, letterSpacing = (-0.5f).sp)
                    Text("${state.sourceLabel} · ${state.trace.source.size} values · seed ${state.seed}", color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 11.sp)
                }
                OutlinedButton(onClick = onOpenSetup, shape = RoundedCornerShape(13.dp)) {
                    Text("Tune", fontWeight = FontWeight.Black)
                }
            }
            Spacer(Modifier.height(12.dp))
            Button(
                onClick = onNewData,
                modifier = Modifier.fillMaxWidth().height(46.dp),
                shape = RoundedCornerShape(13.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Ink, contentColor = Color.White),
            ) {
                Text("✦", color = MaterialTheme.colorScheme.primary, fontSize = 16.sp)
                Spacer(Modifier.width(8.dp))
                Text("Generate new data", fontWeight = FontWeight.Black)
            }
        }
    }
}

@Composable
private fun ModeTray(state: SortScopeState, viewModel: SortScopeViewModel) {
    FlowRow(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        ModeChip("?  Predict", state.predictionEnabled, state.comparisonEnabled, viewModel::togglePrediction)
        ModeChip("≡  Stability", state.stabilityMode, false, viewModel::toggleStability)
        ModeChip("⇄  Compare", state.comparisonEnabled, false, viewModel::toggleComparison)
    }
}

@Composable
private fun ModeChip(label: String, selected: Boolean, disabled: Boolean, onClick: () -> Unit) {
    FilterChip(
        selected = selected,
        onClick = onClick,
        enabled = !disabled,
        label = { Text(label, fontWeight = FontWeight.Bold) },
        colors = FilterChipDefaults.filterChipColors(
            selectedContainerColor = Ink,
            selectedLabelColor = Color.White,
        ),
    )
}

@Composable
private fun ExecutionStage(step: SortStep, algorithmName: String, position: Int, maximum: Int) {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(25.dp),
        color = Stage,
        contentColor = StageText,
        shadowElevation = 7.dp,
    ) {
        Column(Modifier.padding(15.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(Modifier.size(10.dp).background(MaterialTheme.colorScheme.primary, RoundedCornerShape(50)))
                Column(Modifier.weight(1f).padding(start = 9.dp)) {
                    Text("CURRENT OPERATION", color = Color(0xFF8E96A8), fontSize = 9.sp, fontWeight = FontWeight.Black, letterSpacing = 1.1.sp)
                    Text(step.title, fontSize = 16.sp, fontWeight = FontWeight.Black)
                }
                Surface(shape = RoundedCornerShape(50), color = StageRaised) {
                    Text("$position / $maximum", modifier = Modifier.padding(horizontal = 10.dp, vertical = 7.dp), color = Color(0xFFB5BDCD), fontSize = 10.sp, fontWeight = FontWeight.Bold)
                }
            }
            Spacer(Modifier.height(12.dp))
            Surface(shape = RoundedCornerShape(18.dp), color = Color(0xFF090D14)) {
                BarVisualizer(step = step, modifier = Modifier.padding(horizontal = 4.dp))
            }
            Spacer(Modifier.height(11.dp))
            VisualizationLegend()
            Spacer(Modifier.height(8.dp))
            Text(algorithmName, color = Color(0xFF747E91), fontSize = 9.sp, fontWeight = FontWeight.Bold, modifier = Modifier.align(Alignment.End))
        }
    }
}

@Composable
private fun ComparisonStage(state: SortScopeState) {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(21.dp),
        color = Stage,
        contentColor = StageText,
    ) {
        Column(Modifier.padding(14.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Column(Modifier.weight(1f)) {
                    Text("FAIR OPERATION RACE", color = MaterialTheme.colorScheme.primary, fontSize = 9.sp, fontWeight = FontWeight.Black, letterSpacing = 1.sp)
                    Text(state.comparisonAlgorithm.name, fontWeight = FontWeight.Black, fontSize = 15.sp)
                }
                Text("${state.currentComparisonStep.metrics.work} work", color = Color(0xFF9EA7B8), fontSize = 10.sp, fontWeight = FontWeight.Bold)
            }
            BarVisualizer(state.currentComparisonStep, compact = true)
            Text(
                "Shared clock ${state.position}/${state.maximum} · ${state.algorithm.shortName} ${state.currentStep.metrics.work} · ${state.comparisonAlgorithm.shortName} ${state.currentComparisonStep.metrics.work}",
                color = Color(0xFF8E96A8),
                fontSize = 9.sp,
            )
        }
    }
}

@Composable
private fun PredictionCard(state: SortScopeState, onAnswer: (Boolean) -> Unit) {
    val pending = state.pendingPrediction ?: return
    Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(21.dp),
        color = MaterialTheme.colorScheme.primary.copy(alpha = 0.16f),
        border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.primary.copy(alpha = 0.55f)),
    ) {
        Column(Modifier.padding(16.dp)) {
            Text("PREDICTION CHECKPOINT", color = MaterialTheme.colorScheme.primary, fontSize = 9.sp, fontWeight = FontWeight.Black, letterSpacing = 1.1.sp)
            Spacer(Modifier.height(5.dp))
            Text(pending.decision.question, fontSize = 18.sp, fontWeight = FontWeight.Black)
            Spacer(Modifier.height(5.dp))
            Text("Decide before the trace reveals the branch.", color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 11.sp)
            Spacer(Modifier.height(13.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                Button(onClick = { onAnswer(true) }, modifier = Modifier.weight(1f).height(48.dp), shape = RoundedCornerShape(13.dp)) {
                    Text("Yes", fontWeight = FontWeight.Black)
                }
                OutlinedButton(onClick = { onAnswer(false) }, modifier = Modifier.weight(1f).height(48.dp), shape = RoundedCornerShape(13.dp)) {
                    Text("No", fontWeight = FontWeight.Black)
                }
            }
        }
    }
}

@Composable
private fun NarrationCard(step: SortStep, state: SortScopeState) {
    Surface(
        modifier = Modifier.fillMaxWidth().heightIn(min = 148.dp),
        shape = RoundedCornerShape(20.dp),
        color = MaterialTheme.colorScheme.surface,
        border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.7f)),
    ) {
        Row(Modifier.padding(15.dp), verticalAlignment = Alignment.Top) {
            Surface(shape = RoundedCornerShape(13.dp), color = MaterialTheme.colorScheme.primary) {
                Text(
                    (state.position % 100).toString().padStart(2, '0'),
                    modifier = Modifier.size(44.dp).padding(top = 13.dp),
                    textAlign = TextAlign.Center,
                    color = Ink,
                    fontWeight = FontWeight.Black,
                    fontSize = 12.sp,
                )
            }
            Column(Modifier.weight(1f).padding(start = 13.dp)) {
                Text(step.title, fontWeight = FontWeight.Black, fontSize = 16.sp)
                Spacer(Modifier.height(5.dp))
                Text(step.message, color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 12.sp, lineHeight = 18.sp)
                if (step.detail.isNotBlank()) {
                    Spacer(Modifier.height(6.dp))
                    Text(step.detail, color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.78f), fontSize = 10.sp, lineHeight = 15.sp)
                }
                if (state.predictionEnabled) {
                    Spacer(Modifier.height(7.dp))
                    Text("Prediction ${state.predictionCorrect}/${state.predictionTotal} · streak ${state.predictionStreak}", color = MaterialTheme.colorScheme.primary, fontSize = 10.sp, fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}

@Composable
private fun MetricsRow(step: SortStep) {
    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        MetricBox("Compare", step.metrics.comparisons.toString(), Modifier.weight(1f))
        MetricBox("Writes", step.metrics.writes.toString(), Modifier.weight(1f))
        MetricBox("Swaps", step.metrics.swaps.toString(), Modifier.weight(1f))
    }
}

@Composable
private fun StabilityResult(state: SortScopeState) {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(18.dp),
        color = if (state.stabilityPreserved) Color(0xFFE3F6E9) else Color(0xFFFFE8EC),
    ) {
        Column(Modifier.padding(15.dp)) {
            Text("DUPLICATE IDENTITY", color = if (state.stabilityPreserved) Color(0xFF247A52) else Color(0xFFA0384D), fontSize = 9.sp, fontWeight = FontWeight.Black, letterSpacing = 1.sp)
            Text(if (state.stabilityPreserved) "Order preserved" else "Order changed", fontSize = 17.sp, fontWeight = FontWeight.Black)
            Text(
                if (state.stabilityPreserved) "Equal values kept their original A/B/C order; this run demonstrates stability."
                else "At least one equal-value identity changed order; this run demonstrates instability.",
                color = Color(0xFF555B63),
                fontSize = 11.sp,
                lineHeight = 17.sp,
            )
        }
    }
}

@Composable
private fun PlaybackDock(state: SortScopeState, viewModel: SortScopeViewModel) {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        color = MaterialTheme.colorScheme.surface,
        shadowElevation = 18.dp,
    ) {
        Column(Modifier.padding(horizontal = 12.dp, vertical = 10.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(7.dp)) {
                TransportButton("↺", "Restart", state.position > 0, viewModel::restart)
                TransportButton("←", "Previous", state.position > 0, viewModel::previous)
                Button(
                    onClick = viewModel::togglePlayback,
                    modifier = Modifier.weight(1f).height(48.dp),
                    shape = RoundedCornerShape(14.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Ink, contentColor = Color.White),
                ) {
                    Text(if (state.playing) "Ⅱ  Pause" else if (state.isComplete) "↺  Replay" else "▶  Play", fontWeight = FontWeight.Black)
                }
                TransportButton("→", "Next", !state.isComplete, viewModel::next)
            }
            Slider(
                value = state.position.toFloat(),
                onValueChange = { viewModel.seek(it.roundToInt()) },
                valueRange = 0f..state.maximum.coerceAtLeast(1).toFloat(),
                modifier = Modifier.fillMaxWidth().height(30.dp),
            )
        }
    }
}

@Composable
private fun RowScope.TransportButton(glyph: String, label: String, enabled: Boolean, onClick: () -> Unit) {
    OutlinedButton(
        onClick = onClick,
        enabled = enabled,
        modifier = Modifier.size(48.dp),
        shape = RoundedCornerShape(14.dp),
        contentPadding = androidx.compose.foundation.layout.PaddingValues(0.dp),
    ) {
        Text(glyph, fontSize = 18.sp, fontWeight = FontWeight.Black, modifier = Modifier.semantics { contentDescription = label })
    }
}

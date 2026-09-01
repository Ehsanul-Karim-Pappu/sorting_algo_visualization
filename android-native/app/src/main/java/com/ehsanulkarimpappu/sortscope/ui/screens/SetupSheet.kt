package com.ehsanulkarimpappu.sortscope.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Slider
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.ehsanulkarimpappu.sortscope.data.AlgorithmCatalog
import com.ehsanulkarimpappu.sortscope.model.DatasetKind
import com.ehsanulkarimpappu.sortscope.ui.SortScopeState
import com.ehsanulkarimpappu.sortscope.ui.SortScopeViewModel
import com.ehsanulkarimpappu.sortscope.ui.components.SelectionMenu
import kotlin.math.roundToInt

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SetupSheet(
    state: SortScopeState,
    viewModel: SortScopeViewModel,
    onDismiss: () -> Unit,
) {
    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)
    var size by remember(state.size) { mutableFloatStateOf(state.size.toFloat()) }
    var custom by rememberSaveable { mutableStateOf("42, 17, 63, 8, 29, 51, 34, 12") }

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        sheetState = sheetState,
        containerColor = MaterialTheme.colorScheme.surface,
        shape = RoundedCornerShape(topStart = 28.dp, topEnd = 28.dp),
    ) {
        Column(
            modifier = Modifier
                .navigationBarsPadding()
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 18.dp, vertical = 8.dp),
        ) {
            Text("SET UP THE EXPERIMENT", color = MaterialTheme.colorScheme.primary, fontSize = 9.sp, fontWeight = FontWeight.Black, letterSpacing = 1.2.sp)
            Text("Tune the trace", style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Black)
            Text("Every option is processed locally on this device.", color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 11.sp)
            Spacer(Modifier.height(18.dp))

            SelectionMenu(
                label = "Algorithm",
                selectedLabel = state.algorithm.name,
                values = AlgorithmCatalog.algorithms,
                itemLabel = { it.name },
                onSelected = { viewModel.selectAlgorithm(it.id) },
                modifier = Modifier.fillMaxWidth(),
            )
            Spacer(Modifier.height(14.dp))
            SelectionMenu(
                label = "Starting shape",
                selectedLabel = state.dataset.label,
                values = DatasetKind.entries,
                itemLabel = { it.label },
                onSelected = viewModel::selectDataset,
                modifier = Modifier.fillMaxWidth(),
            )

            if (state.dataset == DatasetKind.CUSTOM) {
                Spacer(Modifier.height(12.dp))
                OutlinedTextField(
                    value = custom,
                    onValueChange = { custom = it },
                    modifier = Modifier.fillMaxWidth(),
                    label = { Text("Custom values") },
                    supportingText = { Text(state.customError ?: "4–36 comma-separated integers") },
                    isError = state.customError != null,
                    minLines = 2,
                    shape = RoundedCornerShape(14.dp),
                )
                Button(
                    onClick = { if (viewModel.applyCustom(custom)) onDismiss() },
                    modifier = Modifier.fillMaxWidth().padding(top = 8.dp),
                    shape = RoundedCornerShape(13.dp),
                ) { Text("Apply custom array", fontWeight = FontWeight.Black) }
            }

            Spacer(Modifier.height(18.dp))
            SliderField(
                label = "Values",
                valueLabel = size.roundToInt().toString(),
            ) {
                Slider(
                    value = size,
                    onValueChange = { size = it },
                    onValueChangeFinished = { viewModel.setSize(size.roundToInt()) },
                    valueRange = 6f..32f,
                    steps = 25,
                )
            }
            SliderField(
                label = "Playback tempo",
                valueLabel = tempoLabel(state.speed),
            ) {
                Slider(
                    value = state.speed.toFloat(),
                    onValueChange = { viewModel.setSpeed(it.roundToInt()) },
                    valueRange = 1f..100f,
                )
            }

            HorizontalDivider(Modifier.padding(vertical = 12.dp))
            SwitchRow(
                title = "Fair algorithm race",
                subtitle = "Advance both algorithms on comparisons + writes.",
                checked = state.comparisonEnabled,
                onChecked = { viewModel.toggleComparison() },
            )
            if (state.comparisonEnabled) {
                SelectionMenu(
                    label = "Compare with",
                    selectedLabel = state.comparisonAlgorithm.name,
                    values = AlgorithmCatalog.algorithms.filter { it.id != state.algorithmId },
                    itemLabel = { it.name },
                    onSelected = { viewModel.selectComparisonAlgorithm(it.id) },
                    modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp),
                )
            }
            SwitchRow(
                title = "Stability identities",
                subtitle = "Track equal values as A, B, and C.",
                checked = state.stabilityMode,
                onChecked = { viewModel.toggleStability() },
            )
            SwitchRow(
                title = "Predict next decision",
                subtitle = "Pause before comparisons and answer first.",
                checked = state.predictionEnabled,
                enabled = !state.comparisonEnabled,
                onChecked = { viewModel.togglePrediction() },
            )

            Button(
                onClick = onDismiss,
                modifier = Modifier.fillMaxWidth().height(50.dp).padding(top = 6.dp),
                shape = RoundedCornerShape(14.dp),
            ) { Text("Done", fontWeight = FontWeight.Black) }
            Spacer(Modifier.height(10.dp))
        }
    }
}

@Composable
private fun SliderField(label: String, valueLabel: String, content: @Composable () -> Unit) {
    Column {
        Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
            Text(label.uppercase(), modifier = Modifier.weight(1f), color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 9.sp, fontWeight = FontWeight.Black, letterSpacing = 1.sp)
            Text(valueLabel, color = MaterialTheme.colorScheme.primary, fontSize = 11.sp, fontWeight = FontWeight.Black)
        }
        content()
    }
}

@Composable
private fun SwitchRow(
    title: String,
    subtitle: String,
    checked: Boolean,
    enabled: Boolean = true,
    onChecked: (Boolean) -> Unit,
) {
    Row(
        modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        Column(Modifier.weight(1f)) {
            Text(title, fontWeight = FontWeight.Bold, fontSize = 13.sp)
            Text(subtitle, color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 10.sp, lineHeight = 15.sp)
        }
        Switch(checked = checked, onCheckedChange = onChecked, enabled = enabled)
    }
}

private fun tempoLabel(speed: Int): String = when {
    speed < 25 -> "Slow"
    speed < 55 -> "Steady"
    speed < 80 -> "Fast"
    else -> "Very fast"
}

@file:OptIn(androidx.compose.foundation.layout.ExperimentalLayoutApi::class)

package com.ehsanulkarimpappu.sortscope.ui.screens

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.ehsanulkarimpappu.sortscope.data.AlgorithmCatalog
import com.ehsanulkarimpappu.sortscope.model.AlgorithmDefinition
import com.ehsanulkarimpappu.sortscope.model.AlgorithmFamily
import com.ehsanulkarimpappu.sortscope.ui.SortScopeState
import com.ehsanulkarimpappu.sortscope.ui.components.PropertyChip
import com.ehsanulkarimpappu.sortscope.ui.components.SectionHeading

@Composable
fun ExploreScreen(
    state: SortScopeState,
    onAlgorithmSelected: (String) -> Unit,
    modifier: Modifier = Modifier,
) {
    var query by remember { mutableStateOf("") }
    var family by remember { mutableStateOf<AlgorithmFamily?>(null) }
    val visible = AlgorithmCatalog.algorithms.filter { algorithm ->
        (family == null || algorithm.family == family) &&
            (query.isBlank() || algorithm.name.contains(query, ignoreCase = true) || algorithm.description.contains(query, ignoreCase = true))
    }

    LazyColumn(
        modifier = modifier,
        contentPadding = androidx.compose.foundation.layout.PaddingValues(16.dp, 18.dp, 16.dp, 28.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        item {
            SectionHeading(
                index = "Algorithm library",
                title = "Choose what to inspect",
                subtitle = "Fifteen offline lessons—from first principles to real-world hybrids and parallel networks.",
            )
        }
        item {
            OutlinedTextField(
                value = query,
                onValueChange = { query = it },
                modifier = Modifier.fillMaxWidth(),
                label = { Text("Search algorithms") },
                leadingIcon = { Text("⌕", fontSize = 20.sp) },
                singleLine = true,
                shape = RoundedCornerShape(16.dp),
            )
        }
        item {
            FlowRow(horizontalArrangement = Arrangement.spacedBy(7.dp), verticalArrangement = Arrangement.spacedBy(7.dp)) {
                FilterChip(
                    selected = family == null,
                    onClick = { family = null },
                    label = { Text("All") },
                )
                AlgorithmFamily.entries.forEach { option ->
                    FilterChip(
                        selected = family == option,
                        onClick = { family = option },
                        label = { Text(option.label) },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = MaterialTheme.colorScheme.primary.copy(alpha = 0.22f),
                        ),
                    )
                }
            }
        }
        items(visible, key = { it.id }) { algorithm ->
            AlgorithmCard(
                algorithm = algorithm,
                selected = algorithm.id == state.algorithmId,
                completed = algorithm.id in state.completedAlgorithms,
                onClick = { onAlgorithmSelected(algorithm.id) },
            )
        }
        if (visible.isEmpty()) {
            item {
                Text(
                    "No algorithm matches that search.",
                    modifier = Modifier.fillMaxWidth().padding(vertical = 36.dp),
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
        }
    }
}

@Composable
private fun AlgorithmCard(
    algorithm: AlgorithmDefinition,
    selected: Boolean,
    completed: Boolean,
    onClick: () -> Unit,
) {
    Surface(
        modifier = Modifier.fillMaxWidth().clickable(onClick = onClick),
        shape = RoundedCornerShape(20.dp),
        color = MaterialTheme.colorScheme.surface,
        border = androidx.compose.foundation.BorderStroke(
            if (selected) 2.dp else 1.dp,
            if (selected) Color(algorithm.accent) else MaterialTheme.colorScheme.outline.copy(alpha = 0.72f),
        ),
        tonalElevation = if (selected) 3.dp else 0.dp,
    ) {
        Column(Modifier.padding(16.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Surface(
                    shape = RoundedCornerShape(10.dp),
                    color = Color(algorithm.accent).copy(alpha = 0.16f),
                ) {
                    Text(
                        algorithm.shortName.take(2).uppercase(),
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 8.dp),
                        color = Color(algorithm.accent),
                        fontWeight = FontWeight.Black,
                        fontSize = 11.sp,
                    )
                }
                Column(Modifier.weight(1f).padding(start = 11.dp)) {
                    Text(algorithm.name, fontWeight = FontWeight.Black, fontSize = 16.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
                    Text(algorithm.family.label.uppercase(), color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 9.sp, fontWeight = FontWeight.Bold, letterSpacing = 0.8.sp)
                }
                if (completed) Text("✓", color = Color(0xFF2B986B), fontSize = 18.sp, fontWeight = FontWeight.Black)
                else Text("→", color = Color(algorithm.accent), fontSize = 19.sp, fontWeight = FontWeight.Black)
            }
            Spacer(Modifier.height(11.dp))
            Text(algorithm.description, color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 12.sp, lineHeight = 18.sp, maxLines = 3, overflow = TextOverflow.Ellipsis)
            Spacer(Modifier.height(12.dp))
            FlowRow(horizontalArrangement = Arrangement.spacedBy(7.dp), verticalArrangement = Arrangement.spacedBy(7.dp)) {
                PropertyChip("Avg ${algorithm.complexity.average}")
                PropertyChip(if (algorithm.stable) "Stable" else "Not stable", algorithm.stable)
                PropertyChip(if (algorithm.inPlace) "In place" else "Extra memory", algorithm.inPlace)
            }
        }
    }
}

package com.ehsanulkarimpappu.sortscope.ui.components

import androidx.compose.animation.core.animateDpAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.key
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.ehsanulkarimpappu.sortscope.model.OperationKind
import com.ehsanulkarimpappu.sortscope.model.SortStep
import com.ehsanulkarimpappu.sortscope.ui.theme.Candidate
import com.ehsanulkarimpappu.sortscope.ui.theme.Compare
import com.ehsanulkarimpappu.sortscope.ui.theme.DefaultBar
import com.ehsanulkarimpappu.sortscope.ui.theme.Moving
import com.ehsanulkarimpappu.sortscope.ui.theme.Sorted
import kotlin.math.max
import kotlin.math.min

@Composable
fun BarVisualizer(
    step: SortStep,
    modifier: Modifier = Modifier,
    compact: Boolean = false,
) {
    val values = step.items.map { it.value }
    val minimum = min(0, values.minOrNull() ?: 0)
    val maximum = max(1, values.maxOrNull() ?: 1)
    val spread = max(1, maximum - minimum)
    val showValues = step.items.size <= if (compact) 12 else 18
    val spoken = step.items.joinToString(", ") { "${it.value}${it.identity}" }

    BoxWithConstraints(
        modifier = modifier
            .fillMaxWidth()
            .height(if (compact) 188.dp else 278.dp)
            .semantics { contentDescription = "Array values: $spoken. ${step.title}. ${step.message}" },
    ) {
        val chartHeight = maxHeight - if (showValues) 48.dp else 27.dp
        Row(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = if (compact) 3.dp else 5.dp, vertical = 7.dp),
            horizontalArrangement = Arrangement.spacedBy(if (step.items.size > 22) 2.dp else 4.dp),
            verticalAlignment = Alignment.Bottom,
        ) {
            step.items.forEachIndexed { index, item ->
                key(item.id) {
                    val normalized = (item.value - minimum).toFloat() / spread
                    val targetHeight = chartHeight * (0.14f + normalized * 0.76f)
                    val animatedHeight by animateDpAsState(
                        targetValue = targetHeight,
                        animationSpec = tween(durationMillis = 240),
                        label = "bar-${item.id}",
                    )
                    val active = item.id in step.activeIds
                    val candidate = item.id in step.candidateIds
                    val sorted = item.id in step.sortedIds
                    val color = when {
                        sorted -> Sorted
                        active && step.operation == OperationKind.SWAP -> Moving
                        active -> Compare
                        candidate -> Candidate
                        else -> DefaultBar
                    }
                    Column(
                        modifier = Modifier.weight(1f).fillMaxHeight(),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.Bottom,
                    ) {
                        if (showValues) {
                            Text(
                                text = "${item.value}${item.identity}",
                                color = if (active || sorted || candidate) color else Color(0xFFC3CAD8),
                                fontSize = if (step.items.size > 14) 8.sp else 10.sp,
                                fontWeight = FontWeight.Black,
                                textAlign = TextAlign.Center,
                                maxLines = 1,
                            )
                            Spacer(Modifier.height(4.dp))
                        }
                        Box(
                            modifier = Modifier
                                .fillMaxWidth(if (step.items.size > 24) 0.92f else 0.78f)
                                .height(animatedHeight)
                                .shadow(if (active) 10.dp else 0.dp, RoundedCornerShape(topStart = 8.dp, topEnd = 8.dp, bottomStart = 3.dp, bottomEnd = 3.dp), ambientColor = color, spotColor = color)
                                .clip(RoundedCornerShape(topStart = 8.dp, topEnd = 8.dp, bottomStart = 3.dp, bottomEnd = 3.dp))
                                .background(color.copy(alpha = if (active || sorted) 1f else 0.76f))
                                .then(
                                    if (active) Modifier.border(1.dp, Color.White.copy(alpha = 0.45f), RoundedCornerShape(topStart = 8.dp, topEnd = 8.dp, bottomStart = 3.dp, bottomEnd = 3.dp))
                                    else Modifier
                                ),
                        )
                        if (!compact && step.items.size <= 16) {
                            Spacer(Modifier.height(5.dp))
                            Text((index + 1).toString(), color = Color(0xFF697185), fontSize = 8.sp, fontWeight = FontWeight.SemiBold)
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun VisualizationLegend(modifier: Modifier = Modifier) {
    Row(
        modifier = modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically,
    ) {
        LegendItem(Compare, "Compare")
        LegendItem(Moving, "Move")
        LegendItem(Candidate, "Candidate")
        LegendItem(Sorted, "Sorted")
    }
}

@Composable
private fun LegendItem(color: Color, label: String) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Box(Modifier.size(8.dp).clip(RoundedCornerShape(3.dp)).background(color))
        Spacer(Modifier.width(5.dp))
        Text(label.uppercase(), color = Color(0xFF8E96A8), fontSize = 8.sp, fontWeight = FontWeight.Black, letterSpacing = 0.5.sp)
    }
}

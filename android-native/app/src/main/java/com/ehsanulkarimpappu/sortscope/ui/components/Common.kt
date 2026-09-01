package com.ehsanulkarimpappu.sortscope.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.ehsanulkarimpappu.sortscope.ui.theme.Ink
import com.ehsanulkarimpappu.sortscope.ui.theme.Muted

@Composable
fun SortScopeMark(modifier: Modifier = Modifier, compact: Boolean = false) {
    val height = if (compact) 30.dp else 36.dp
    val width = if (compact) 31.dp else 38.dp
    Surface(
        modifier = modifier.size(width, height),
        shape = RoundedCornerShape(if (compact) 10.dp else 12.dp),
        color = Ink,
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 7.dp, vertical = 6.dp),
            horizontalArrangement = Arrangement.spacedBy(2.dp),
            verticalAlignment = Alignment.Bottom,
        ) {
            listOf(0.42f, 0.82f, 0.61f, 1f).forEach { fraction ->
                Box(
                    Modifier
                        .weight(1f)
                        .height((height - 12.dp) * fraction)
                        .clip(RoundedCornerShape(2.dp))
                        .background(MaterialTheme.colorScheme.primary),
                )
            }
        }
    }
}

@Composable
fun SectionHeading(index: String, title: String, subtitle: String, modifier: Modifier = Modifier) {
    Column(modifier.fillMaxWidth()) {
        Text(
            text = index.uppercase(),
            color = MaterialTheme.colorScheme.primary,
            fontSize = 10.sp,
            fontWeight = FontWeight.Black,
            letterSpacing = 1.8.sp,
        )
        Spacer(Modifier.height(4.dp))
        Text(
            text = title,
            style = MaterialTheme.typography.headlineSmall,
            fontWeight = FontWeight.Black,
            letterSpacing = (-0.6f).sp,
        )
        Spacer(Modifier.height(4.dp))
        Text(
            text = subtitle,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            style = MaterialTheme.typography.bodySmall,
            lineHeight = 18.sp,
        )
    }
}

@Composable
fun <T> SelectionMenu(
    label: String,
    selectedLabel: String,
    values: List<T>,
    itemLabel: (T) -> String,
    onSelected: (T) -> Unit,
    modifier: Modifier = Modifier,
) {
    var expanded by remember { mutableStateOf(false) }
    Column(modifier) {
        Text(
            text = label.uppercase(),
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            fontSize = 10.sp,
            fontWeight = FontWeight.Bold,
            letterSpacing = 1.sp,
        )
        Spacer(Modifier.height(6.dp))
        Box {
            OutlinedButton(
                onClick = { expanded = true },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(13.dp),
            ) {
                Text(
                    text = selectedLabel,
                    modifier = Modifier.weight(1f),
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                    fontWeight = FontWeight.Bold,
                )
                Spacer(Modifier.width(8.dp))
                Text("⌄", fontWeight = FontWeight.Black)
            }
            DropdownMenu(
                expanded = expanded,
                onDismissRequest = { expanded = false },
            ) {
                values.forEach { item ->
                    DropdownMenuItem(
                        text = { Text(itemLabel(item), fontWeight = FontWeight.SemiBold) },
                        onClick = {
                            expanded = false
                            onSelected(item)
                        },
                    )
                }
            }
        }
    }
}

@Composable
fun MetricBox(label: String, value: String, modifier: Modifier = Modifier) {
    Column(
        modifier = modifier
            .clip(RoundedCornerShape(13.dp))
            .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.68f))
            .padding(horizontal = 11.dp, vertical = 10.dp),
    ) {
        Text(
            text = label.uppercase(),
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            fontSize = 9.sp,
            fontWeight = FontWeight.Black,
            letterSpacing = 0.8.sp,
        )
        Spacer(Modifier.height(3.dp))
        Text(text = value, fontWeight = FontWeight.Black, fontSize = 15.sp)
    }
}

@Composable
fun PropertyChip(text: String, positive: Boolean? = null, modifier: Modifier = Modifier) {
    val tint = when (positive) {
        true -> Color(0xFF2B8D62)
        false -> Color(0xFFB04458)
        null -> MaterialTheme.colorScheme.onSurfaceVariant
    }
    Row(
        modifier = modifier
            .clip(RoundedCornerShape(50))
            .border(1.dp, tint.copy(alpha = 0.25f), RoundedCornerShape(50))
            .background(tint.copy(alpha = 0.08f))
            .padding(horizontal = 10.dp, vertical = 6.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        if (positive != null) {
            Text(if (positive) "✓" else "○", color = tint, fontWeight = FontWeight.Black, fontSize = 10.sp)
            Spacer(Modifier.width(5.dp))
        }
        Text(text, color = tint, fontSize = 10.sp, fontWeight = FontWeight.Bold)
    }
}

@Composable
fun OfflineBadge(modifier: Modifier = Modifier) {
    Row(
        modifier = modifier
            .clip(RoundedCornerShape(50))
            .background(Color.White.copy(alpha = 0.08f))
            .padding(horizontal = 9.dp, vertical = 6.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Box(Modifier.size(7.dp).clip(RoundedCornerShape(50)).background(Color(0xFF48E1B7)))
        Spacer(Modifier.width(6.dp))
        Text("OFFLINE", color = Color(0xFFB9C0D0), fontSize = 9.sp, fontWeight = FontWeight.Black, letterSpacing = 0.8.sp)
    }
}

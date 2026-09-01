package com.ehsanulkarimpappu.sortscope.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

val Ink = Color(0xFF11141D)
val Stage = Color(0xFF0C1018)
val StageRaised = Color(0xFF171C27)
val Paper = Color(0xFFF2EFE7)
val PaperDeep = Color(0xFFE6E1D7)
val Panel = Color(0xFFFFFDF8)
val Muted = Color(0xFF6F7077)
val StageText = Color(0xFFF8F6EF)
val Compare = Color(0xFF16DBC0)
val Moving = Color(0xFFFF6F8B)
val Candidate = Color(0xFFFFC857)
val Sorted = Color(0xFFB9EE75)
val DefaultBar = Color(0xFF71809F)

@Composable
fun SortScopeTheme(accent: Color, content: @Composable () -> Unit) {
    val dark = isSystemInDarkTheme()
    val colors = if (dark) {
        darkColorScheme(
            primary = accent,
            onPrimary = Ink,
            secondary = Compare,
            background = Color(0xFF0D1017),
            onBackground = StageText,
            surface = Color(0xFF171B24),
            onSurface = StageText,
            surfaceVariant = Color(0xFF222733),
            onSurfaceVariant = Color(0xFFC7CBD5),
            outline = Color(0xFF3A4050),
        )
    } else {
        lightColorScheme(
            primary = accent,
            onPrimary = Ink,
            secondary = Ink,
            onSecondary = Color.White,
            background = Paper,
            onBackground = Ink,
            surface = Panel,
            onSurface = Ink,
            surfaceVariant = PaperDeep,
            onSurfaceVariant = Muted,
            outline = Color(0xFFD4CFC5),
        )
    }
    MaterialTheme(colorScheme = colors, content = content)
}

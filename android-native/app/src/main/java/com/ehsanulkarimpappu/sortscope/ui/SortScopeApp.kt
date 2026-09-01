package com.ehsanulkarimpappu.sortscope.ui

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
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
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.ehsanulkarimpappu.sortscope.ui.components.OfflineBadge
import com.ehsanulkarimpappu.sortscope.ui.components.SortScopeMark
import com.ehsanulkarimpappu.sortscope.ui.screens.ExploreScreen
import com.ehsanulkarimpappu.sortscope.ui.screens.LearnScreen
import com.ehsanulkarimpappu.sortscope.ui.screens.SetupSheet
import com.ehsanulkarimpappu.sortscope.ui.screens.VisualizeScreen
import com.ehsanulkarimpappu.sortscope.ui.theme.Ink
import com.ehsanulkarimpappu.sortscope.ui.theme.Panel
import com.ehsanulkarimpappu.sortscope.ui.theme.SortScopeTheme

@Composable
fun SortScopeApp(viewModel: SortScopeViewModel = viewModel()) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    var setupOpen by remember { mutableStateOf(false) }

    SortScopeTheme(accent = Color(state.algorithm.accent)) {
        Scaffold(
            containerColor = MaterialTheme.colorScheme.background,
            topBar = { AppHeader() },
            bottomBar = {
                AppNavigation(
                    selected = state.section,
                    onSelected = viewModel::selectSection,
                )
            },
        ) { padding ->
            when (state.section) {
                AppSection.EXPLORE -> ExploreScreen(
                    state = state,
                    onAlgorithmSelected = {
                        viewModel.selectAlgorithm(it)
                        viewModel.selectSection(AppSection.VISUALIZE)
                    },
                    modifier = Modifier.padding(padding),
                )
                AppSection.VISUALIZE -> VisualizeScreen(
                    state = state,
                    viewModel = viewModel,
                    onOpenSetup = { setupOpen = true },
                    modifier = Modifier.padding(padding),
                )
                AppSection.LEARN -> LearnScreen(
                    state = state,
                    viewModel = viewModel,
                    modifier = Modifier.padding(padding),
                )
            }
        }

        if (setupOpen) {
            SetupSheet(
                state = state,
                viewModel = viewModel,
                onDismiss = { setupOpen = false },
            )
        }
    }
}

@Composable
private fun AppHeader() {
    Surface(color = Ink, contentColor = Color.White) {
        Row(
            modifier = Modifier
                .statusBarsPadding()
                .fillMaxWidth()
                .height(66.dp)
                .padding(horizontal = 16.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            SortScopeMark(compact = true)
            Column(Modifier.padding(start = 10.dp)) {
                Text("SortScope", fontSize = 17.sp, fontWeight = FontWeight.Black, letterSpacing = (-0.3f).sp)
                Text("NATIVE LEARNING LAB", color = Color(0xFF9EA7B9), fontSize = 8.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.2.sp)
            }
            Spacer(Modifier.weight(1f))
            OfflineBadge()
        }
    }
}

@Composable
private fun AppNavigation(selected: AppSection, onSelected: (AppSection) -> Unit) {
    NavigationBar(
        modifier = Modifier.navigationBarsPadding(),
        containerColor = Panel,
        tonalElevation = 8.dp,
    ) {
        AppSection.entries.forEach { section ->
            NavigationBarItem(
                selected = section == selected,
                onClick = { onSelected(section) },
                icon = { Text(section.glyph, fontSize = 17.sp, fontWeight = FontWeight.Black) },
                label = { Text(section.label, fontSize = 10.sp, fontWeight = FontWeight.Bold) },
                colors = NavigationBarItemDefaults.colors(
                    selectedIconColor = Ink,
                    selectedTextColor = Ink,
                    indicatorColor = MaterialTheme.colorScheme.primary,
                ),
            )
        }
    }
}

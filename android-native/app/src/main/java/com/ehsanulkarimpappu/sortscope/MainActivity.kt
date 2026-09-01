package com.ehsanulkarimpappu.sortscope

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.SystemBarStyle
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.toArgb
import com.ehsanulkarimpappu.sortscope.ui.SortScopeApp

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge(
            statusBarStyle = SystemBarStyle.dark(Color(0xFF11141D).toArgb()),
            navigationBarStyle = SystemBarStyle.light(
                Color(0xFFF2EFE7).toArgb(),
                Color(0xFF11141D).toArgb(),
            ),
        )
        setContent { SortScopeApp() }
    }
}
